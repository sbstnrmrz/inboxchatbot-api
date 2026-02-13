import { WhatsAppN8nWebhookItemDto } from './whatsapp/whatsapp-n8n-webhook.dto.js';
import { InstagramWebhookDto } from './instagram/instagram-webhook.dto.js';

/**
 * Discriminated union for the unified n8n message-received endpoint.
 *
 * Detection rules (mutually exclusive):
 *   - WhatsApp : payload.messaging_product === 'whatsapp'
 *   - Instagram: payload.object === 'instagram'
 */
export type MessageReceivedDto =
  | WhatsAppN8nWebhookItemDto
  | InstagramWebhookDto;
