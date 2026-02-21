/**
 * Response from POST /me/messages (Instagram Messaging API).
 *
 * Example:
 * {
 *   "recipient_id": "26171369109181060",
 *   "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlE..."
 * }
 *
 * Contrast with WhatsApp, which returns an object with messaging_product,
 * contacts[], and messages[].
 */
export class InstagramSendMessageResponseDto {
  /** Instagram-scoped ID (IGSID) of the recipient */
  recipient_id: string;

  /** Instagram message ID — used as externalId in our DB */
  message_id: string;
}
