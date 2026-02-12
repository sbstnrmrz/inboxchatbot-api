import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookValueDto } from './whatsapp-webhook-value.dto.js';

/**
 * Payload shape received from the n8n WhatsApp trigger node.
 *
 * Unlike the standard WhatsApp Cloud API webhook (which wraps everything in
 * `{ object, entry[{ id, changes[{ value, field }] }] }`), the n8n template
 * forwards the inner `value` object directly, adding `field` at the same level
 * and delivering it as an array.
 *
 * Example payload:
 * [
 *   {
 *     "messaging_product": "whatsapp",
 *     "metadata": { ... },
 *     "contacts": [ ... ],
 *     "messages": [ ... ],
 *     "field": "messages"
 *   }
 * ]
 */
export class WhatsAppN8nWebhookItemDto extends WhatsAppWebhookValueDto {
  @IsString()
  @IsNotEmpty()
  field: string;
}

export class WhatsAppN8nWebhookDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppN8nWebhookItemDto)
  items: WhatsAppN8nWebhookItemDto[];
}
