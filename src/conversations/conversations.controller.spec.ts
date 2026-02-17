import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';

// MessagesService pulls in better-auth (ESM) which ts-jest cannot handle.
// Mock the entire module so Jest never resolves that dependency chain.
jest.mock('../messages/messages.service.js', () => ({
  MessagesService: jest.fn(),
}));

import { MessagesService } from '../messages/messages.service.js';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let conversationsService: jest.Mocked<ConversationsService>;

  const TENANT_ID = new Types.ObjectId().toHexString();
  const CONVERSATION_ID = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: {
            toggleBot: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    conversationsService = module.get(ConversationsService);
  });

  // ── toggleBot ─────────────────────────────────────────────────────────────

  describe('toggleBot', () => {
    const makeReq = (tenantId?: string) => ({ tenantId }) as any;

    describe('when bot is disabled (toggling on)', () => {
      beforeEach(() => {
        conversationsService.toggleBot.mockResolvedValue({ botEnabled: true });
      });

      it('should return botEnabled true', async () => {
        const result = await controller.toggleBot(
          CONVERSATION_ID,
          makeReq(TENANT_ID),
        );

        expect(result.botEnabled).toBe(true);
      });

      it('should delegate to ConversationsService.toggleBot with tenantId and conversationId', async () => {
        await controller.toggleBot(CONVERSATION_ID, makeReq(TENANT_ID));

        expect(conversationsService.toggleBot).toHaveBeenCalledWith(
          TENANT_ID,
          CONVERSATION_ID,
        );
      });
    });

    describe('when bot is enabled (toggling off)', () => {
      const botDisabledAt = new Date('2026-02-17T14:00:00.000Z');

      beforeEach(() => {
        conversationsService.toggleBot.mockResolvedValue({
          botEnabled: false,
          botDisabledAt,
        });
      });

      it('should return botEnabled false and botDisabledAt', async () => {
        const result = await controller.toggleBot(
          CONVERSATION_ID,
          makeReq(TENANT_ID),
        );

        expect(result.botEnabled).toBe(false);
        expect(result.botDisabledAt).toEqual(botDisabledAt);
      });
    });

    describe('error cases', () => {
      it('should throw UnauthorizedException if tenantId is not resolved', async () => {
        await expect(
          controller.toggleBot(CONVERSATION_ID, makeReq(undefined)),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should not call the service if tenant is not resolved', async () => {
        await controller
          .toggleBot(CONVERSATION_ID, makeReq(undefined))
          .catch(() => {});

        expect(conversationsService.toggleBot).not.toHaveBeenCalled();
      });
    });
  });
});
