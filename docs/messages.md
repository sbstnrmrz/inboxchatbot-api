# Message Schema

Schema location: `src/messages/schemas/message.schema.ts`

---

## Fields

| Field            | Type                        | Required | Notes                                                                                   |
| ---------------- | --------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `tenantId`       | `ObjectId` ref Tenant       | yes      |                                                                                         |
| `conversationId` | `ObjectId` ref Conversation | yes      |                                                                                         |
| `channel`        | `MessageChannel`            | yes      | `WHATSAPP` \| `INSTAGRAM`                                                               |
| `direction`      | `MessageDirection`          | yes      | `INBOUND` \| `OUTBOUND`                                                                 |
| `messageType`    | `MessageType`               | yes      | see enum below                                                                          |
| `sender`         | `MessageSender`             | yes      | embedded object `{ type, id? }`                                                         |
| `body`           | `string`                    | no       | plain text, present when `messageType = TEXT`                                           |
| `media`          | `MessageMedia`              | no       | present for IMAGE, AUDIO, VIDEO, DOCUMENT, STICKER, REEL, SHARE                         |
| `externalId`     | `string`                    | no       | `wamid.*` for WhatsApp, `mid.*` for Instagram — used for idempotency and status updates |
| `status`         | `MessageStatus`             | no       | default `SENT`                                                                          |
| `sentAt`         | `Date`                      | yes      | channel timestamp, not server time                                                      |
| `deliveredAt`    | `Date`                      | no       | set when channel confirms delivery                                                      |
| `readAt`         | `Date`                      | no       | set when recipient reads the message                                                    |
| `createdAt`      | `Date`                      | no       | auto-managed by Mongoose `timestamps: true`                                             |
| `updatedAt`      | `Date`                      | no       | auto-managed by Mongoose `timestamps: true`                                             |

---

## Enums

### MessageChannel

| Value       | Description             |
| ----------- | ----------------------- |
| `WHATSAPP`  | WhatsApp Cloud API      |
| `INSTAGRAM` | Instagram Messaging API |

### MessageDirection

| Value      | Description                      |
| ---------- | -------------------------------- |
| `INBOUND`  | Message received from a customer |
| `OUTBOUND` | Message sent by an agent or bot  |

### MessageType

Unified across both channels.

| Value         | WhatsApp      | Instagram              |
| ------------- | ------------- | ---------------------- |
| `TEXT`        | `text`        | `text`                 |
| `IMAGE`       | `image`       | `image`                |
| `AUDIO`       | `audio`       | `audio`                |
| `VIDEO`       | `video`       | `video`                |
| `DOCUMENT`    | `document`    | `file`                 |
| `STICKER`     | `sticker`     | `like_heart` / sticker |
| `LOCATION`    | `location`    | —                      |
| `CONTACTS`    | `contacts`    | —                      |
| `INTERACTIVE` | `interactive` | —                      |
| `BUTTON`      | `button`      | —                      |
| `REACTION`    | `reaction`    | reaction event         |
| `ORDER`       | `order`       | —                      |
| `REEL`        | —             | `reel` / `ig_reel`     |
| `SHARE`       | —             | `share`                |
| `POSTBACK`    | —             | postback event         |
| `SYSTEM`      | `system`      | —                      |
| `UNKNOWN`     | `unknown`     | unsupported types      |

### MessageStatus

| Value       | Description                         | WhatsApp equivalent |
| ----------- | ----------------------------------- | ------------------- |
| `SENT`      | Received by the channel server      | one checkmark       |
| `DELIVERED` | Delivered to the recipient's device | two checkmarks      |
| `READ`      | Read by the recipient               | two blue checkmarks |
| `FAILED`    | Delivery failed                     | error               |

### SenderType

| Value      | Description                                       |
| ---------- | ------------------------------------------------- |
| `CUSTOMER` | Inbound message from a customer                   |
| `USER`     | Outbound message from an agent (user or admin)    |
| `BOT`      | Outbound message from the bot — no `id` reference |

---

## Embedded Objects

### MessageSender

```ts
{
  type: SenderType;   // required
  id?: Types.ObjectId // ObjectId ref User or Customer — absent when type is BOT
}
```

### MessageMedia

Unified for both channels. All fields are optional.

| Field             | Type     | Source   | Notes                                                                   |
| ----------------- | -------- | -------- | ----------------------------------------------------------------------- |
| `whatsappMediaId` | `string` | WhatsApp | Media ID used to retrieve the file from the WA Cloud API                |
| `url`             | `string` | Both     | Direct URL — always present for Instagram, may be resolved for WhatsApp |
| `mimeType`        | `string` | Both     | e.g. `image/jpeg`, `audio/ogg`                                          |
| `sha256`          | `string` | WhatsApp | Checksum for integrity verification                                     |
| `caption`         | `string` | Both     | Caption provided by the sender                                          |
| `filename`        | `string` | WhatsApp | Original filename — documents only                                      |
| `size`            | `number` | Both     | Approximate file size in bytes                                          |

---

## Indexes

| Index                                            | Options | Purpose                                                         |
| ------------------------------------------------ | ------- | --------------------------------------------------------------- |
| `{ tenantId: 1, conversationId: 1, sentAt: -1 }` | —       | Primary query: load messages for a conversation ordered by time |
| `{ tenantId: 1, externalId: 1 }`                 | sparse  | Webhook idempotency and status update lookups                   |
