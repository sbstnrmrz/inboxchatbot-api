export class WhatsAppSendMessageResponseContactDto {
  input: string;
  wa_id: string;
}

export class WhatsAppSendMessageResponseMessageDto {
  /** wamid — the WhatsApp message ID used as externalId in our DB */
  id: string;
}

/**
 * Response from POST /{phone-number-id}/messages (WhatsApp Cloud API).
 *
 * Example:
 * {
 *   "messaging_product": "whatsapp",
 *   "contacts": [{ "input": "584147083834", "wa_id": "584147083834" }],
 *   "messages": [{ "id": "wamid.HBgM..." }]
 * }
 */
export class WhatsAppSendMessageResponseDto {
  messaging_product: string;
  contacts: WhatsAppSendMessageResponseContactDto[];
  messages: WhatsAppSendMessageResponseMessageDto[];
}
