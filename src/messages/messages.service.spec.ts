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

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TENANT_ID = new Types.ObjectId().toHexString();

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

  beforeEach(async () => {
    customerModel = buildModelMock();
    conversationModel = buildModelMock();
    messageModel = buildModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getModelToken(Customer.name), useValue: customerModel },
        {
          provide: getModelToken(Conversation.name),
          useValue: conversationModel,
        },
        { provide: getModelToken(Message.name), useValue: messageModel },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
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
});
