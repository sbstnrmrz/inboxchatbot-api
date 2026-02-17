import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { ConversationsService } from './conversations.service.js';
import { Conversation } from './schemas/conversation.schema.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const leanExec = (value: unknown) => ({
  lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
});

const selectLeanExec = (value: unknown) => ({
  select: () => leanExec(value),
});

function buildModelMock() {
  return {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationModel: ReturnType<typeof buildModelMock>;

  const TENANT_ID = new Types.ObjectId().toHexString();
  const CONVERSATION_ID = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    conversationModel = buildModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getModelToken(Conversation.name),
          useValue: conversationModel,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  // ── toggleBot ─────────────────────────────────────────────────────────────

  describe('toggleBot', () => {
    describe('when botEnabled is true (disabling the bot)', () => {
      const existingConversation = {
        _id: new Types.ObjectId(CONVERSATION_ID),
        tenantId: new Types.ObjectId(TENANT_ID),
        botEnabled: true,
      };

      const updatedConversation = {
        botEnabled: false,
        botDisabledAt: new Date('2026-02-17T14:00:00.000Z'),
      };

      beforeEach(() => {
        conversationModel.findOne.mockReturnValue(
          leanExec(existingConversation),
        );
        conversationModel.findByIdAndUpdate.mockReturnValue(
          selectLeanExec(updatedConversation),
        );
      });

      it('should set botEnabled to false', async () => {
        const result = await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        expect(result.botEnabled).toBe(false);
      });

      it('should set botDisabledAt', async () => {
        const result = await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        expect(result.botDisabledAt).toBeDefined();
      });

      it('should call findByIdAndUpdate with botEnabled false and botDisabledAt', async () => {
        await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
          new Types.ObjectId(CONVERSATION_ID),
          expect.objectContaining({
            botEnabled: false,
            botDisabledAt: expect.any(Date),
          }),
          { new: true },
        );
      });
    });

    describe('when botEnabled is false (enabling the bot)', () => {
      const existingConversation = {
        _id: new Types.ObjectId(CONVERSATION_ID),
        tenantId: new Types.ObjectId(TENANT_ID),
        botEnabled: false,
      };

      const updatedConversation = {
        botEnabled: true,
      };

      beforeEach(() => {
        conversationModel.findOne.mockReturnValue(
          leanExec(existingConversation),
        );
        conversationModel.findByIdAndUpdate.mockReturnValue(
          selectLeanExec(updatedConversation),
        );
      });

      it('should set botEnabled to true', async () => {
        const result = await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        expect(result.botEnabled).toBe(true);
      });

      it('should not include botDisabledAt in the update', async () => {
        await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        const updateArg = conversationModel.findByIdAndUpdate.mock.calls[0][1];
        expect(updateArg).not.toHaveProperty('botDisabledAt');
      });

      it('should call findByIdAndUpdate with botEnabled true', async () => {
        await service.toggleBot(TENANT_ID, CONVERSATION_ID);

        expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
          new Types.ObjectId(CONVERSATION_ID),
          { botEnabled: true },
          { new: true },
        );
      });
    });

    describe('error cases', () => {
      it('should throw NotFoundException if conversation does not belong to tenant', async () => {
        conversationModel.findOne.mockReturnValue(leanExec(null));

        await expect(
          service.toggleBot(TENANT_ID, CONVERSATION_ID),
        ).rejects.toThrow(NotFoundException);
      });

      it('should scope the lookup by tenantId', async () => {
        conversationModel.findOne.mockReturnValue(leanExec(null));

        await service.toggleBot(TENANT_ID, CONVERSATION_ID).catch(() => {});

        expect(conversationModel.findOne).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: new Types.ObjectId(TENANT_ID),
          }),
        );
      });
    });
  });
});
