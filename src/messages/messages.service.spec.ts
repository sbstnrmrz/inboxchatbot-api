import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessagesService } from './messages.service.js';
import { Message } from './schemas/message.schema.js';
import { Customer } from '../customers/schemas/customer.schema.js';
import { Conversation } from '../conversations/schemas/conversation.schema.js';
import {
  MessageChannel,
  MessageDirection,
  MessageType,
  MessageStatus,
  SenderType,
} from './schemas/message.schema.js';
import {
  ConversationChannel,
  ConversationStatus,
} from '../conversations/schemas/conversation.schema.js';
import { WhatsAppN8nWebhookItemDto } from './dto/whatsapp/whatsapp-n8n-webhook.dto.js';
import { InstagramWebhookDto } from './dto/instagram/instagram-webhook.dto.js';
import { Tenant } from '../tenants/schemas/tenant.schema.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { BotResponseDto } from './dto/bot-response.dto.js';

// Mock ChatGateway to avoid pulling in better-auth ESM dependencies
const mockChatGateway = { emitToTenant: jest.fn() };
jest.mock('../chat/chat.gateway.js', () => ({
  ChatGateway: jest.fn().mockImplementation(() => mockChatGateway),
}));
import { ChatGateway } from '../chat/chat.gateway.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TENANT_ID = new Types.ObjectId().toHexString();

const igTextPayload: InstagramWebhookDto = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      messaging: [
        {
          sender: { id: 'ig-scoped-id-001' },
          recipient: { id: '123456789' },
          timestamp: 1770928719,
          message: {
            mid: 'mid.abc123',
            text: 'Hola desde Instagram',
          },
        },
      ],
    },
  ],
};

const waTextPayload: WhatsAppN8nWebhookItemDto = {
  messaging_product: 'whatsapp',
  metadata: {
    display_phone_number: '584247732003',
    phone_number_id: '642317185638668',
  },
  contacts: [
    {
      profile: { name: 'Miguel Vivas' },
      wa_id: '584147083834',
    },
  ],
  messages: [
    {
      from: '584147083834',
      id: 'wamid.abc123',
      timestamp: '1770928719',
      type: 'text',
      text: { body: 'Hola' },
    },
  ],
  field: 'messages',
};

// ── Model mock factory ────────────────────────────────────────────────────────

function buildModelMock(overrides: Record<string, jest.Mock> = {}) {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MessagesService', () => {
  let service: MessagesService;
  let customerModel: ReturnType<typeof buildModelMock>;
  let conversationModel: ReturnType<typeof buildModelMock>;
  let messageModel: ReturnType<typeof buildModelMock>;
  let tenantModel: ReturnType<typeof buildModelMock>;
  let tenantsService: jest.Mocked<TenantsService>;

  beforeEach(async () => {
    customerModel = buildModelMock();
    conversationModel = buildModelMock();
    messageModel = buildModelMock();
    tenantModel = buildModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getModelToken(Customer.name), useValue: customerModel },
        {
          provide: getModelToken(Conversation.name),
          useValue: conversationModel,
        },
        { provide: getModelToken(Message.name), useValue: messageModel },
        { provide: getModelToken(Tenant.name), useValue: tenantModel },
        {
          provide: ChatGateway,
          useValue: { emitToTenant: jest.fn() },
        },
        {
          provide: TenantsService,
          useValue: { resolveId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    tenantsService = module.get(TenantsService);
  });

  // ── Helper: build lean chainable mock ──────────────────────────────────────
  function leanExec(value: unknown) {
    return { lean: () => ({ exec: () => Promise.resolve(value) }) };
  }

  // ── Case 1: Customer does NOT exist ──────────────────────────────────────

  describe('when customer does not exist', () => {
    const newCustomerId = new Types.ObjectId();
    const newConversationId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    beforeEach(() => {
      // Customer not found → null
      customerModel.findOne.mockReturnValue(leanExec(null));

      // create customer
      customerModel.create.mockResolvedValue({
        _id: newCustomerId,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      // No active conversation
      conversationModel.findOne.mockReturnValue(leanExec(null));

      // create conversation
      conversationModel.create.mockResolvedValue({
        _id: newConversationId,
        status: ConversationStatus.Open,
        channel: ConversationChannel.WhatsApp,
      });

      // create message
      messageModel.create.mockResolvedValue({
        _id: newMessageId,
        channel: MessageChannel.WhatsApp,
        direction: MessageDirection.Inbound,
        messageType: MessageType.Text,
        body: 'Hola',
        externalId: 'wamid.abc123',
        status: MessageStatus.Delivered,
      });
    });

    it('should create a new customer with whatsappInfo from webhook', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(customerModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Miguel Vivas',
          whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
        }),
      );
    });

    it('should create a new OPEN WhatsApp conversation for the new customer', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(conversationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: newCustomerId,
          channel: ConversationChannel.WhatsApp,
          status: ConversationStatus.Open,
        }),
      );
    });

    it('should persist the message linked to the new conversation', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: newConversationId,
          channel: MessageChannel.WhatsApp,
          direction: MessageDirection.Inbound,
          messageType: MessageType.Text,
          body: 'Hola',
          externalId: 'wamid.abc123',
          sender: { type: SenderType.Customer, id: newCustomerId },
        }),
      );
    });

    it('should return the saved message', async () => {
      const result = await service.processWhatsAppWebhook(
        TENANT_ID,
        waTextPayload,
      );

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(newMessageId);
    });
  });

  // ── Case 2: Customer EXISTS ───────────────────────────────────────────────

  describe('when customer already exists', () => {
    const existingCustomerId = new Types.ObjectId();
    const existingConversationId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    beforeEach(() => {
      // Customer found
      customerModel.findOne.mockReturnValue(
        leanExec({
          _id: existingCustomerId,
          name: 'Miguel Vivas',
          whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
        }),
      );

      // Active conversation found
      conversationModel.findOne.mockReturnValue(
        leanExec({
          _id: existingConversationId,
          status: ConversationStatus.Open,
          channel: ConversationChannel.WhatsApp,
        }),
      );

      // create message
      messageModel.create.mockResolvedValue({
        _id: newMessageId,
        channel: MessageChannel.WhatsApp,
        direction: MessageDirection.Inbound,
        messageType: MessageType.Text,
        body: 'Hola',
        externalId: 'wamid.abc123',
        status: MessageStatus.Delivered,
      });
    });

    it('should NOT create a new customer', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(customerModel.create).not.toHaveBeenCalled();
    });

    it('should NOT create a new conversation', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(conversationModel.create).not.toHaveBeenCalled();
    });

    it('should persist the message linked to the existing conversation', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: existingConversationId,
          sender: { type: SenderType.Customer, id: existingCustomerId },
        }),
      );
    });

    it('should update lastMessage and increment unreadCount on the conversation', async () => {
      await service.processWhatsAppWebhook(TENANT_ID, waTextPayload);

      expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        existingConversationId,
        expect.objectContaining({
          lastMessage: newMessageId,
          $inc: { unreadCount: 1 },
        }),
      );
    });

    it('should return the saved message', async () => {
      const result = await service.processWhatsAppWebhook(
        TENANT_ID,
        waTextPayload,
      );

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(newMessageId);
    });
  });

  // ── Case 3: Payload with no messages ─────────────────────────────────────

  describe('when payload has no messages', () => {
    it('should return an empty array without touching any model', async () => {
      const emptyPayload: WhatsAppN8nWebhookItemDto = {
        ...waTextPayload,
        messages: [],
      };

      const result = await service.processWhatsAppWebhook(
        TENANT_ID,
        emptyPayload,
      );

      expect(result).toEqual([]);
      expect(customerModel.findOne).not.toHaveBeenCalled();
      expect(messageModel.create).not.toHaveBeenCalled();
    });
  });

  // ── Instagram: Case 1 — customer does NOT exist ───────────────────────────

  describe('Instagram: when customer does not exist', () => {
    const newCustomerId = new Types.ObjectId();
    const newConversationId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    beforeEach(() => {
      customerModel.findOne.mockReturnValue(leanExec(null));
      customerModel.create.mockResolvedValue({
        _id: newCustomerId,
        name: 'ig-scoped-id-001',
        instagramInfo: { accountId: 'ig-scoped-id-001' },
      });
      conversationModel.findOne.mockReturnValue(leanExec(null));
      conversationModel.create.mockResolvedValue({
        _id: newConversationId,
        status: ConversationStatus.Open,
        channel: ConversationChannel.Instagram,
      });
      messageModel.create.mockResolvedValue({
        _id: newMessageId,
        channel: MessageChannel.Instagram,
        direction: MessageDirection.Inbound,
        messageType: MessageType.Text,
        body: 'Hola desde Instagram',
        externalId: 'mid.abc123',
        status: MessageStatus.Delivered,
      });
    });

    it('should create a new customer with instagramInfo from the sender id', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(customerModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          instagramInfo: { accountId: 'ig-scoped-id-001' },
        }),
      );
    });

    it('should create a new OPEN Instagram conversation for the new customer', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(conversationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: newCustomerId,
          channel: ConversationChannel.Instagram,
          status: ConversationStatus.Open,
        }),
      );
    });

    it('should persist the message linked to the new conversation', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: newConversationId,
          channel: MessageChannel.Instagram,
          direction: MessageDirection.Inbound,
          messageType: MessageType.Text,
          body: 'Hola desde Instagram',
          externalId: 'mid.abc123',
          sender: { type: SenderType.Customer, id: newCustomerId },
        }),
      );
    });

    it('should return the saved message', async () => {
      const result = await service.processInstagramWebhook(
        TENANT_ID,
        igTextPayload,
      );

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(newMessageId);
    });
  });

  // ── Instagram: Case 2 — customer EXISTS ───────────────────────────────────

  describe('Instagram: when customer already exists', () => {
    const existingCustomerId = new Types.ObjectId();
    const existingConversationId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    beforeEach(() => {
      customerModel.findOne.mockReturnValue(
        leanExec({
          _id: existingCustomerId,
          name: 'ig-scoped-id-001',
          instagramInfo: { accountId: 'ig-scoped-id-001' },
        }),
      );
      conversationModel.findOne.mockReturnValue(
        leanExec({
          _id: existingConversationId,
          status: ConversationStatus.Open,
          channel: ConversationChannel.Instagram,
        }),
      );
      messageModel.create.mockResolvedValue({
        _id: newMessageId,
        channel: MessageChannel.Instagram,
        direction: MessageDirection.Inbound,
        messageType: MessageType.Text,
        body: 'Hola desde Instagram',
        externalId: 'mid.abc123',
        status: MessageStatus.Delivered,
      });
    });

    it('should NOT create a new customer', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(customerModel.create).not.toHaveBeenCalled();
    });

    it('should NOT create a new conversation', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(conversationModel.create).not.toHaveBeenCalled();
    });

    it('should persist the message linked to the existing conversation', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: existingConversationId,
          sender: { type: SenderType.Customer, id: existingCustomerId },
        }),
      );
    });

    it('should update lastMessage and increment unreadCount on the conversation', async () => {
      await service.processInstagramWebhook(TENANT_ID, igTextPayload);

      expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        existingConversationId,
        expect.objectContaining({
          lastMessage: newMessageId,
          $inc: { unreadCount: 1 },
        }),
      );
    });

    it('should return the saved message', async () => {
      const result = await service.processInstagramWebhook(
        TENANT_ID,
        igTextPayload,
      );

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(newMessageId);
    });
  });

  // ── Instagram: Case 3 — echo messages are skipped ─────────────────────────

  describe('Instagram: when message is an echo', () => {
    it('should skip the event and return an empty array', async () => {
      const echoPayload: InstagramWebhookDto = {
        object: 'instagram',
        entry: [
          {
            id: '123456789',
            messaging: [
              {
                sender: { id: 'ig-scoped-id-001' },
                recipient: { id: '123456789' },
                timestamp: 1770928719,
                message: {
                  mid: 'mid.echo001',
                  text: 'Outbound echo',
                  is_echo: true,
                },
              },
            ],
          },
        ],
      };

      const result = await service.processInstagramWebhook(
        TENANT_ID,
        echoPayload,
      );

      expect(result).toEqual([]);
      expect(customerModel.findOne).not.toHaveBeenCalled();
      expect(messageModel.create).not.toHaveBeenCalled();
    });
  });

  // ── Instagram: Case 4 — entry with no messaging events ────────────────────

  describe('Instagram: when entry has no messaging events', () => {
    it('should return an empty array without touching any model', async () => {
      const noMessagingPayload: InstagramWebhookDto = {
        object: 'instagram',
        entry: [{ id: '123456789' }],
      };

      const result = await service.processInstagramWebhook(
        TENANT_ID,
        noMessagingPayload,
      );

      expect(result).toEqual([]);
      expect(customerModel.findOne).not.toHaveBeenCalled();
      expect(messageModel.create).not.toHaveBeenCalled();
    });
  });

  // ── Case 4: Media message types ───────────────────────────────────────────
  //
  // Covers all WhatsApp media types per the Cloud API webhook reference:
  // image, audio, video, document (with filename), sticker.
  // Each case verifies that:
  //   1. messageType is correctly mapped
  //   2. media object is persisted with the right fields
  //   3. body is undefined (no text content)

  describe('media message types', () => {
    const existingCustomerId = new Types.ObjectId();
    const existingConversationId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    beforeEach(() => {
      customerModel.findOne.mockReturnValue(
        leanExec({
          _id: existingCustomerId,
          name: 'Miguel Vivas',
          whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
        }),
      );
      conversationModel.findOne.mockReturnValue(
        leanExec({
          _id: existingConversationId,
          status: ConversationStatus.Open,
          channel: ConversationChannel.WhatsApp,
        }),
      );
      messageModel.create.mockResolvedValue({ _id: newMessageId });
    });

    describe.each([
      {
        label: 'image',
        waType: 'image',
        mediaKey: 'image',
        expectedType: MessageType.Image,
        mediaPayload: {
          id: '2754859441498128',
          mime_type: 'image/jpeg',
          sha256: 'abc123hash',
          caption: 'This is a caption',
        },
        expectedMedia: {
          whatsappMediaId: '2754859441498128',
          mimeType: 'image/jpeg',
          sha256: 'abc123hash',
          caption: 'This is a caption',
          filename: undefined,
        },
      },
      {
        label: 'audio',
        waType: 'audio',
        mediaKey: 'audio',
        expectedType: MessageType.Audio,
        mediaPayload: {
          id: 'audio-media-id',
          mime_type: 'audio/ogg; codecs=opus',
          sha256: 'audiohash',
        },
        expectedMedia: {
          whatsappMediaId: 'audio-media-id',
          mimeType: 'audio/ogg; codecs=opus',
          sha256: 'audiohash',
          caption: undefined,
          filename: undefined,
        },
      },
      {
        label: 'video',
        waType: 'video',
        mediaKey: 'video',
        expectedType: MessageType.Video,
        mediaPayload: {
          id: 'video-media-id',
          mime_type: 'video/mp4',
          sha256: 'videohash',
          caption: 'Watch this',
        },
        expectedMedia: {
          whatsappMediaId: 'video-media-id',
          mimeType: 'video/mp4',
          sha256: 'videohash',
          caption: 'Watch this',
          filename: undefined,
        },
      },
      {
        label: 'document',
        waType: 'document',
        mediaKey: 'document',
        expectedType: MessageType.Document,
        mediaPayload: {
          id: 'doc-media-id',
          mime_type: 'application/pdf',
          sha256: 'dochash',
          filename: 'invoice.pdf',
          caption: 'Here is the invoice',
        },
        expectedMedia: {
          whatsappMediaId: 'doc-media-id',
          mimeType: 'application/pdf',
          sha256: 'dochash',
          caption: 'Here is the invoice',
          filename: 'invoice.pdf',
        },
      },
      {
        label: 'sticker',
        waType: 'sticker',
        mediaKey: 'sticker',
        expectedType: MessageType.Sticker,
        mediaPayload: {
          id: 'sticker-media-id',
          mime_type: 'image/webp',
          sha256: 'stickerhash',
        },
        expectedMedia: {
          whatsappMediaId: 'sticker-media-id',
          mimeType: 'image/webp',
          sha256: 'stickerhash',
          caption: undefined,
          filename: undefined,
        },
      },
    ])(
      '$label message',
      ({ waType, mediaKey, expectedType, mediaPayload, expectedMedia }) => {
        let payload: WhatsAppN8nWebhookItemDto;

        beforeEach(() => {
          payload = {
            ...waTextPayload,
            messages: [
              {
                from: '584147083834',
                id: `wamid.${waType}001`,
                timestamp: '1770928719',
                type: waType,
                [mediaKey]: mediaPayload,
              },
            ],
          };
        });

        it(`should map type to ${expectedType}`, async () => {
          await service.processWhatsAppWebhook(TENANT_ID, payload);

          expect(messageModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ messageType: expectedType }),
          );
        });

        it('should persist media with correct fields', async () => {
          await service.processWhatsAppWebhook(TENANT_ID, payload);

          expect(messageModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
              media: expect.objectContaining(
                Object.fromEntries(
                  Object.entries(expectedMedia).filter(
                    ([, v]) => v !== undefined,
                  ),
                ),
              ),
            }),
          );
        });

        it('should have no body text', async () => {
          await service.processWhatsAppWebhook(TENANT_ID, payload);

          const call = messageModel.create.mock.calls[0][0];
          expect(call.body).toBeUndefined();
        });
      },
    );
  });

  // ── sendMessage ───────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    const AGENT_ID = new Types.ObjectId().toHexString();
    const conversationId = new Types.ObjectId();
    const customerId = new Types.ObjectId();
    const newMessageId = new Types.ObjectId();

    const waConversation = {
      _id: conversationId,
      tenantId: new Types.ObjectId(TENANT_ID),
      customerId,
      channel: ConversationChannel.WhatsApp,
      status: ConversationStatus.Open,
    };

    const igConversation = {
      _id: conversationId,
      tenantId: new Types.ObjectId(TENANT_ID),
      customerId,
      channel: ConversationChannel.Instagram,
      status: ConversationStatus.Open,
    };

    const waCustomer = {
      _id: customerId,
      name: 'Miguel Vivas',
      whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
    };

    const igCustomer = {
      _id: customerId,
      name: 'ig-scoped-id-001',
      instagramInfo: { accountId: 'ig-scoped-id-001' },
    };

    const tenant = {
      _id: new Types.ObjectId(TENANT_ID),
      whatsappInfo: {
        accessToken: 'wa-access-token',
        phoneNumberId: '642317185638668',
        businessAccountId: 'biz-001',
        appSecret: 'secret',
      },
      instagramInfo: {
        accessToken: 'ig-access-token',
        accountId: '123456789',
        pageId: 'page-001',
        appSecret: 'secret',
      },
    };

    const textDto: SendMessageDto = {
      conversationId: conversationId.toHexString(),
      messageType: MessageType.Text,
      body: 'Hola cliente',
    };

    // ── WhatsApp outbound ──────────────────────────────────────────────────

    describe('WhatsApp outbound text message', () => {
      beforeEach(() => {
        conversationModel.findOne.mockReturnValue(leanExec(waConversation));
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        customerModel.findOne.mockReturnValue(leanExec(waCustomer));
        messageModel.create.mockResolvedValue({
          _id: newMessageId,
          channel: MessageChannel.WhatsApp,
          direction: MessageDirection.Outbound,
          messageType: MessageType.Text,
          body: 'Hola cliente',
          status: MessageStatus.Sent,
        });

        // Mock the WA API caller — returns hardcoded response per WA Cloud API docs
        jest.spyOn(service, 'callWhatsAppApi').mockResolvedValue({
          messaging_product: 'whatsapp',
          contacts: [{ input: '584147083834', wa_id: '584147083834' }],
          messages: [{ id: 'wamid.outbound001' }],
        });
      });

      it('should call the WhatsApp API with correct params', async () => {
        await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(service.callWhatsAppApi).toHaveBeenCalledWith(
          tenant.whatsappInfo.phoneNumberId,
          tenant.whatsappInfo.accessToken,
          waCustomer.whatsappInfo.id,
          textDto,
        );
      });

      it('should persist the message as OUTBOUND with wamid as externalId', async () => {
        await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(messageModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            channel: MessageChannel.WhatsApp,
            direction: MessageDirection.Outbound,
            messageType: MessageType.Text,
            body: 'Hola cliente',
            externalId: 'wamid.outbound001',
            status: MessageStatus.Sent,
            sender: {
              type: SenderType.User,
              id: new Types.ObjectId(AGENT_ID),
            },
          }),
        );
      });

      it('should update lastMessage on the conversation', async () => {
        await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
          conversationId,
          expect.objectContaining({ lastMessage: newMessageId }),
        );
      });

      it('should return the saved message', async () => {
        const result = await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(result._id).toEqual(newMessageId);
      });
    });

    // ── Instagram outbound ─────────────────────────────────────────────────

    describe('Instagram outbound text message', () => {
      beforeEach(() => {
        conversationModel.findOne.mockReturnValue(leanExec(igConversation));
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        customerModel.findOne.mockReturnValue(leanExec(igCustomer));
        messageModel.create.mockResolvedValue({
          _id: newMessageId,
          channel: MessageChannel.Instagram,
          direction: MessageDirection.Outbound,
          messageType: MessageType.Text,
          body: 'Hola cliente',
          status: MessageStatus.Sent,
        });

        // Mock the IG API caller — returns hardcoded response per Instagram docs
        jest.spyOn(service, 'callInstagramApi').mockResolvedValue({
          message_id: 'mid.outbound001',
        });
      });

      it('should call the Instagram API with correct params', async () => {
        await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(service.callInstagramApi).toHaveBeenCalledWith(
          tenant.instagramInfo.accountId,
          tenant.instagramInfo.accessToken,
          igCustomer.instagramInfo.accountId,
          textDto,
        );
      });

      it('should persist the message as OUTBOUND with mid as externalId', async () => {
        await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(messageModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            channel: MessageChannel.Instagram,
            direction: MessageDirection.Outbound,
            externalId: 'mid.outbound001',
            status: MessageStatus.Sent,
            sender: {
              type: SenderType.User,
              id: new Types.ObjectId(AGENT_ID),
            },
          }),
        );
      });

      it('should return the saved message', async () => {
        const result = await service.sendMessage(TENANT_ID, AGENT_ID, textDto);

        expect(result._id).toEqual(newMessageId);
      });
    });

    // ── Error cases ────────────────────────────────────────────────────────

    describe('error cases', () => {
      it('should throw if conversation is not found', async () => {
        conversationModel.findOne.mockReturnValue(leanExec(null));

        await expect(
          service.sendMessage(TENANT_ID, AGENT_ID, textDto),
        ).rejects.toThrow(`Conversation ${textDto.conversationId} not found`);
      });

      it('should throw if tenant is not found', async () => {
        conversationModel.findOne.mockReturnValue(leanExec(waConversation));
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(null));

        await expect(
          service.sendMessage(TENANT_ID, AGENT_ID, textDto),
        ).rejects.toThrow(`Tenant ${TENANT_ID} not found`);
      });

      it('should throw if tenant has no WhatsApp config', async () => {
        conversationModel.findOne.mockReturnValue(leanExec(waConversation));
        tenantModel.findById = jest
          .fn()
          .mockReturnValue(leanExec({ ...tenant, whatsappInfo: undefined }));
        customerModel.findOne.mockReturnValue(leanExec(waCustomer));

        await expect(
          service.sendMessage(TENANT_ID, AGENT_ID, textDto),
        ).rejects.toThrow(`Tenant ${TENANT_ID} has no WhatsApp config`);
      });
    });
  });

  // ── processBotResponse ────────────────────────────────────────────────────

  describe('processBotResponse', () => {
    const WA_ID = '584147083834';
    const PHONE_NUMBER_ID = '642317185638668';
    const newMessageId = new Types.ObjectId();
    const customerId = new Types.ObjectId();
    const conversationId = new Types.ObjectId();

    const tenant = {
      _id: new Types.ObjectId(TENANT_ID),
      whatsappInfo: {
        accessToken: 'wa-access-token',
        phoneNumberId: PHONE_NUMBER_ID,
        businessAccountId: 'biz-001',
        appSecret: 'secret',
      },
    };

    const existingCustomer = {
      _id: customerId,
      name: 'Miguel Vivas',
      whatsappInfo: { id: WA_ID, name: 'Miguel Vivas' },
    };

    const existingConversation = {
      _id: conversationId,
      tenantId: new Types.ObjectId(TENANT_ID),
      customerId,
      channel: ConversationChannel.WhatsApp,
      status: ConversationStatus.Open,
    };

    const textDto: BotResponseDto = {
      phoneNumberId: PHONE_NUMBER_ID,
      tenantId: TENANT_ID,
      content: 'Hola, soy el bot',
      messageType: MessageType.Text,
      metaResponse: {
        messaging_product: 'whatsapp',
        contacts: [{ input: WA_ID, wa_id: WA_ID }],
        messages: [{ id: 'wamid.bot001' }],
      },
    };

    // ── happy path: customer and conversation already exist ────────────────

    describe('existing customer and conversation', () => {
      beforeEach(() => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        customerModel.findOne.mockReturnValue(leanExec(existingCustomer));
        conversationModel.findOne.mockReturnValue(
          leanExec(existingConversation),
        );
        messageModel.create.mockResolvedValue({
          _id: newMessageId,
          channel: MessageChannel.WhatsApp,
          direction: MessageDirection.Outbound,
          messageType: MessageType.Text,
          body: 'Hola, soy el bot',
          externalId: 'wamid.bot001',
          status: MessageStatus.Sent,
          sender: { type: SenderType.Bot },
        });
      });

      it('should resolve tenantId via TenantsService', async () => {
        await service.processBotResponse(textDto);

        expect(tenantsService.resolveId).toHaveBeenCalledWith(TENANT_ID);
      });

      it('should persist the message as OUTBOUND with sender type BOT', async () => {
        await service.processBotResponse(textDto);

        expect(messageModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: new Types.ObjectId(TENANT_ID),
            conversationId,
            channel: MessageChannel.WhatsApp,
            direction: MessageDirection.Outbound,
            messageType: MessageType.Text,
            body: 'Hola, soy el bot',
            externalId: 'wamid.bot001',
            status: MessageStatus.Sent,
            sender: { type: SenderType.Bot },
          }),
        );
      });

      it('should not include an id in the sender (BOT has no user reference)', async () => {
        await service.processBotResponse(textDto);

        const call = messageModel.create.mock.calls[0][0];
        expect(call.sender.id).toBeUndefined();
      });

      it('should update lastMessage on the conversation', async () => {
        await service.processBotResponse(textDto);

        expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
          conversationId,
          expect.objectContaining({ lastMessage: newMessageId }),
        );
      });

      it('should return the saved message', async () => {
        const result = await service.processBotResponse(textDto);

        expect(result._id).toEqual(newMessageId);
      });

      it('should emit a real-time socket event to the tenant room', async () => {
        const chatGateway = service['chatGateway'] as unknown as {
          emitToTenant: jest.Mock;
        };

        await service.processBotResponse(textDto);

        expect(chatGateway.emitToTenant).toHaveBeenCalledWith(
          TENANT_ID,
          'message_sent',
          expect.objectContaining({ _id: newMessageId }),
        );
      });
    });

    // ── customer not found: should create a new one ────────────────────────

    describe('customer does not exist yet', () => {
      const newCustomer = {
        _id: customerId,
        name: WA_ID,
        whatsappInfo: { id: WA_ID, name: WA_ID },
      };

      beforeEach(() => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        // First call: customer not found; second call (conversation lookup): not needed
        customerModel.findOne.mockReturnValue(leanExec(null));
        customerModel.create.mockResolvedValue(newCustomer);
        conversationModel.findOne.mockReturnValue(
          leanExec(existingConversation),
        );
        messageModel.create.mockResolvedValue({ _id: newMessageId });
      });

      it('should create the customer with whatsappInfo from the meta response', async () => {
        await service.processBotResponse(textDto);

        expect(customerModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: new Types.ObjectId(TENANT_ID),
            whatsappInfo: { id: WA_ID, name: WA_ID },
          }),
        );
      });
    });

    // ── conversation not found: should create a new one ────────────────────

    describe('active conversation does not exist yet', () => {
      const newConversation = {
        _id: conversationId,
        tenantId: new Types.ObjectId(TENANT_ID),
        customerId,
        channel: ConversationChannel.WhatsApp,
        status: ConversationStatus.Open,
      };

      beforeEach(() => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        customerModel.findOne.mockReturnValue(leanExec(existingCustomer));
        conversationModel.findOne.mockReturnValue(leanExec(null));
        conversationModel.create.mockResolvedValue(newConversation);
        messageModel.create.mockResolvedValue({ _id: newMessageId });
      });

      it('should create a new WhatsApp conversation with status OPEN', async () => {
        await service.processBotResponse(textDto);

        expect(conversationModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: new Types.ObjectId(TENANT_ID),
            customerId,
            channel: ConversationChannel.WhatsApp,
            status: ConversationStatus.Open,
          }),
        );
      });
    });

    // ── tenantId given as slug ─────────────────────────────────────────────

    describe('tenantId provided as slug', () => {
      const slugDto: BotResponseDto = { ...textDto, tenantId: 'my-tenant' };

      beforeEach(() => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));
        customerModel.findOne.mockReturnValue(leanExec(existingCustomer));
        conversationModel.findOne.mockReturnValue(
          leanExec(existingConversation),
        );
        messageModel.create.mockResolvedValue({ _id: newMessageId });
      });

      it('should call TenantsService.resolveId with the slug', async () => {
        await service.processBotResponse(slugDto);

        expect(tenantsService.resolveId).toHaveBeenCalledWith('my-tenant');
      });
    });

    // ── error cases ────────────────────────────────────────────────────────

    describe('error cases', () => {
      it('should throw if tenant is not found', async () => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(null));

        await expect(service.processBotResponse(textDto)).rejects.toThrow(
          `Tenant ${TENANT_ID} not found`,
        );
      });

      it('should throw if phoneNumberId does not match tenant config', async () => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(
          leanExec({
            ...tenant,
            whatsappInfo: { ...tenant.whatsappInfo, phoneNumberId: 'other-id' },
          }),
        );

        await expect(service.processBotResponse(textDto)).rejects.toThrow(
          `phoneNumberId ${PHONE_NUMBER_ID} does not match tenant config`,
        );
      });

      it('should throw if metaResponse has no contacts', async () => {
        tenantsService.resolveId.mockResolvedValue(TENANT_ID);
        tenantModel.findById = jest.fn().mockReturnValue(leanExec(tenant));

        const dtoWithoutContacts: BotResponseDto = {
          ...textDto,
          metaResponse: {
            ...textDto.metaResponse,
            contacts: [],
          },
        };

        await expect(
          service.processBotResponse(dtoWithoutContacts),
        ).rejects.toThrow('metaResponse.contacts is empty');
      });
    });
  });
});
