# Schemas

This document describes all Mongoose schemas in the project.
Each schema enforces tenant isolation via a `tenantId` field and compound indexes.

---

## Table of Contents

- [Tenant](#tenant)
- [Membership](#membership)
- [User](#user)
- [Customer](#customer)
- [Conversation](#conversation)
- [Message](#message)

---

## Tenant

**File:** `src/tenants/schemas/tenant.schema.ts`
**Collection:** `tenants`
**Options:** `{ timestamps: true }`

Stores tenant configuration including channel integration credentials.
Sensitive fields are encrypted at rest using AES-256-GCM.

### Supporting Interfaces

#### `WhatsAppInfo`

| Field                 | Type      | Notes         |
| --------------------- | --------- | ------------- |
| `accessToken`         | `string`  | **Encrypted** |
| `phoneNumberId`       | `string`  |               |
| `businessAccountId`   | `string`  |               |
| `webhookVerifyToken?` | `string`  | **Encrypted** |
| `appSecret`           | `string`  | **Encrypted** |
| `isActive?`           | `boolean` |               |
| `lastSyncedAt?`       | `Date`    |               |

#### `InstagramInfo`

| Field           | Type      | Notes         |
| --------------- | --------- | ------------- |
| `accessToken`   | `string`  | **Encrypted** |
| `accountId`     | `string`  |               |
| `pageId`        | `string`  |               |
| `appSecret`     | `string`  | **Encrypted** |
| `isActive?`     | `boolean` |               |
| `lastSyncedAt?` | `Date`    |               |

### Fields

| Field            | Type            | Options                                   |
| ---------------- | --------------- | ----------------------------------------- |
| `slug`           | `string`        | `required`, `unique`, `lowercase`, `trim` |
| `name`           | `string`        | `required`, `trim`                        |
| `whatsappInfo?`  | `WhatsAppInfo`  | `type: Object`                            |
| `instagramInfo?` | `InstagramInfo` | `type: Object`                            |
| `createdAt?`     | `Date`          | Auto-managed by `timestamps`              |
| `updatedAt?`     | `Date`          | Auto-managed by `timestamps`              |

### Indexes

```ts
TenantSchema.index({ createdAt: -1 });
```

### Hooks

| Hook                       | Trigger       | Behavior                                                                      |
| -------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `pre('save')`              | Before save   | Normalizes `slug` to lowercase, replacing non-`[a-z0-9-]` characters with `-` |
| `pre('save')`              | Before save   | Encrypts sensitive fields in `whatsappInfo` and `instagramInfo` if present    |
| `pre('findOneAndUpdate')`  | Before update | Extracts and encrypts sensitive fields from the update payload                |
| `post('save')`             | After save    | Decrypts sensitive fields on the returned document (in-memory only)           |
| `post('findOne')`          | After findOne | Decrypts sensitive fields if present                                          |
| `post('find')`             | After find    | Decrypts sensitive fields across all returned documents                       |
| `post('findOneAndUpdate')` | After update  | Decrypts sensitive fields on the returned document if present                 |

---

## Membership

**File:** `src/tenants/schemas/membership.schema.ts`
**Collection:** `memberships`
**Options:** `{ timestamps: true }`

Tracks the lifecycle status of a tenant (one membership per tenant).

### Enums

#### `MembershipStatus`

| Key         | Value       |
| ----------- | ----------- |
| `Active`    | `ACTIVE`    |
| `Suspended` | `SUSPENDED` |
| `Disabled`  | `DISABLED`  |

### Fields

| Field              | Type               | Options                                        |
| ------------------ | ------------------ | ---------------------------------------------- |
| `tenantId`         | `Types.ObjectId`   | `required`, `ref: 'Tenant'`                    |
| `status`           | `MembershipStatus` | `required`, `default: MembershipStatus.Active` |
| `reason?`          | `string`           |                                                |
| `statusChangedAt?` | `Date`             |                                                |
| `statusChangedBy?` | `Types.ObjectId`   | `ref: 'User'`                                  |
| `suspendedAt?`     | `Date`             |                                                |
| `disabledAt?`      | `Date`             |                                                |
| `reactivatedAt?`   | `Date`             |                                                |
| `createdAt?`       | `Date`             | Auto-managed by `timestamps`                   |
| `updatedAt?`       | `Date`             | Auto-managed by `timestamps`                   |

### Indexes

```ts
MembershipSchema.index({ tenantId: 1 }, { unique: true }); // one membership per tenant
MembershipSchema.index({ status: 1 });
MembershipSchema.index({ tenantId: 1, status: 1 });
```

### Hooks

| Hook          | Trigger     | Behavior                                                                                                                                                    |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre('save')` | Before save | If `status` is modified: sets `statusChangedAt = new Date()` and conditionally sets `suspendedAt`, `disabledAt`, or `reactivatedAt` based on the new status |

---

## User

**File:** `src/users/schemas/user.schema.ts`
**Collection:** `users`
**Options:** `{ timestamps: true }`

### Enums

#### `UserRole`

| Key          | Value        |
| ------------ | ------------ |
| `SuperAdmin` | `superadmin` |
| `Admin`      | `admin`      |
| `User`       | `user`       |

### Fields

| Field        | Type             | Options                                                        |
| ------------ | ---------------- | -------------------------------------------------------------- |
| `tenantId`   | `Types.ObjectId` | `required`, `ref: 'Tenant'`, `index: true`                     |
| `name`       | `string`         | `required`, `trim`                                             |
| `email`      | `string`         | `required`, `unique`, `lowercase`, `trim`                      |
| `password`   | `string`         | `required`, `select: false` (excluded from queries by default) |
| `role`       | `UserRole`       | `required`, `default: UserRole.User`                           |
| `createdAt?` | `Date`           | Auto-managed by `timestamps`                                   |
| `updatedAt?` | `Date`           | Auto-managed by `timestamps`                                   |

### Indexes

```ts
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
```

---

## Customer

**File:** `src/customers/schemas/customer.schema.ts`
**Collection:** `customers`
**Options:** `{ timestamps: true }`

Represents an external contact (end-user) who interacts through a channel.

### Supporting Interfaces

#### `CustomerWhatsAppInfo`

| Field  | Type     |
| ------ | -------- |
| `id`   | `string` |
| `name` | `string` |

#### `CustomerInstagramInfo`

| Field       | Type     |
| ----------- | -------- |
| `accountId` | `string` |
| `name?`     | `string` |
| `username?` | `string` |

### Fields

| Field            | Type                    | Options                                    |
| ---------------- | ----------------------- | ------------------------------------------ |
| `tenantId`       | `Types.ObjectId`        | `required`, `ref: 'Tenant'`, `index: true` |
| `name`           | `string`                | `required`, `trim`                         |
| `whatsappInfo?`  | `CustomerWhatsAppInfo`  | `type: Object`                             |
| `instagramInfo?` | `CustomerInstagramInfo` | `type: Object`                             |
| `isBlocked`      | `boolean`               | `default: false`                           |
| `createdAt?`     | `Date`                  | Auto-managed by `timestamps`               |
| `updatedAt?`     | `Date`                  | Auto-managed by `timestamps`               |

### Indexes

```ts
CustomerSchema.index(
  { tenantId: 1, 'whatsappInfo.id': 1 },
  { unique: true, sparse: true },
);
CustomerSchema.index(
  { tenantId: 1, 'instagramInfo.accountId': 1 },
  { unique: true, sparse: true },
);
```

---

## Conversation

**File:** `src/conversations/schemas/conversation.schema.ts`
**Collection:** `conversations`
**Options:** `{ timestamps: true }`

Represents a thread of messages between a customer and a tenant across a specific channel.

### Enums

#### `ConversationChannel`

| Key         | Value       |
| ----------- | ----------- |
| `WhatsApp`  | `WHATSAPP`  |
| `Instagram` | `INSTAGRAM` |

#### `ConversationStatus`

| Key       | Value     |
| --------- | --------- |
| `Open`    | `OPEN`    |
| `Pending` | `PENDING` |
| `Closed`  | `CLOSED`  |

### Fields

| Field             | Type                  | Options                                        |
| ----------------- | --------------------- | ---------------------------------------------- |
| `tenantId`        | `Types.ObjectId`      | `required`, `ref: 'Tenant'`, `index: true`     |
| `customerId`      | `Types.ObjectId`      | `required`, `ref: 'Customer'`                  |
| `channel`         | `ConversationChannel` | `required`                                     |
| `status`          | `ConversationStatus`  | `required`, `default: ConversationStatus.Open` |
| `lastMessage?`    | `Types.ObjectId`      | `ref: 'Message'`                               |
| `lastMessageAt?`  | `Date`                |                                                |
| `unreadCount`     | `number`              | `default: 0`, `min: 0`                         |
| `requestingAgent` | `boolean`             | `default: false`                               |
| `botEnabled`      | `boolean`             | `default: true`                                |
| `botDisabledAt?`  | `Date`                |                                                |
| `createdAt?`      | `Date`                | Auto-managed by `timestamps`                   |
| `updatedAt?`      | `Date`                | Auto-managed by `timestamps`                   |

### Indexes

```ts
ConversationSchema.index({ tenantId: 1, lastMessageAt: -1 });
ConversationSchema.index({ tenantId: 1, customerId: 1 });
ConversationSchema.index({ tenantId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ tenantId: 1, channel: 1, lastMessageAt: -1 });
```

---

## Message

**File:** `src/messages/schemas/message.schema.ts`
**Collection:** `messages`
**Options:** `{ timestamps: true }`

Immutable record of a single message within a conversation.
Messages must always belong to exactly one conversation.

### Enums

#### `MessageChannel`

| Key         | Value       |
| ----------- | ----------- |
| `WhatsApp`  | `WHATSAPP`  |
| `Instagram` | `INSTAGRAM` |

#### `MessageDirection`

| Key        | Value      |
| ---------- | ---------- |
| `Inbound`  | `INBOUND`  |
| `Outbound` | `OUTBOUND` |

#### `MessageStatus`

| Key         | Value       |
| ----------- | ----------- |
| `Sent`      | `SENT`      |
| `Delivered` | `DELIVERED` |
| `Read`      | `READ`      |
| `Failed`    | `FAILED`    |

#### `MessageType`

| Key           | Value         |
| ------------- | ------------- |
| `Text`        | `TEXT`        |
| `Image`       | `IMAGE`       |
| `Audio`       | `AUDIO`       |
| `Video`       | `VIDEO`       |
| `Document`    | `DOCUMENT`    |
| `Sticker`     | `STICKER`     |
| `Location`    | `LOCATION`    |
| `Contacts`    | `CONTACTS`    |
| `Interactive` | `INTERACTIVE` |
| `Button`      | `BUTTON`      |
| `Reaction`    | `REACTION`    |
| `Order`       | `ORDER`       |
| `Reel`        | `REEL`        |
| `Share`       | `SHARE`       |
| `Postback`    | `POSTBACK`    |
| `System`      | `SYSTEM`      |
| `Unknown`     | `UNKNOWN`     |

#### `SenderType`

| Key        | Value      |
| ---------- | ---------- |
| `Customer` | `CUSTOMER` |
| `User`     | `USER`     |
| `Bot`      | `BOT`      |

### Supporting Interfaces

#### `MessageSender`

| Field  | Type             | Notes                 |
| ------ | ---------------- | --------------------- |
| `type` | `SenderType`     |                       |
| `id?`  | `Types.ObjectId` | Absent for `BOT` type |

#### `MessageMedia`

Unified media descriptor for both WhatsApp and Instagram.

| Field              | Type     |
| ------------------ | -------- |
| `whatsappMediaId?` | `string` |
| `url?`             | `string` |
| `mimeType?`        | `string` |
| `sha256?`          | `string` |
| `caption?`         | `string` |
| `filename?`        | `string` |
| `size?`            | `number` |

#### `MessageReferral`

Ad/link referral metadata (Click-to-WhatsApp / Click-to-Instagram flows).

| Field           | Type     |
| --------------- | -------- |
| `sourceUrl?`    | `string` |
| `sourceType?`   | `string` |
| `sourceId?`     | `string` |
| `headline?`     | `string` |
| `body?`         | `string` |
| `ref?`          | `string` |
| `mediaType?`    | `string` |
| `imageUrl?`     | `string` |
| `videoUrl?`     | `string` |
| `thumbnailUrl?` | `string` |

### Fields

| Field            | Type               | Options                                                           |
| ---------------- | ------------------ | ----------------------------------------------------------------- |
| `tenantId`       | `Types.ObjectId`   | `required`, `ref: 'Tenant'`, `index: true`                        |
| `conversationId` | `Types.ObjectId`   | `required`, `ref: 'Conversation'`                                 |
| `channel`        | `MessageChannel`   | `required`                                                        |
| `direction`      | `MessageDirection` | `required`                                                        |
| `messageType`    | `MessageType`      | `required`                                                        |
| `sender`         | `MessageSender`    | `required`, `type: Object`                                        |
| `body?`          | `string`           | Present when `messageType` is `TEXT`                              |
| `media?`         | `MessageMedia`     | Present for IMAGE, AUDIO, VIDEO, DOCUMENT, STICKER, REEL, SHARE   |
| `externalId?`    | `string`           | Channel-native ID (`wamid.xxx` / `mid.xxx`); used for idempotency |
| `status`         | `MessageStatus`    | `default: MessageStatus.Sent`                                     |
| `sentAt`         | `Date`             | `required` — channel timestamp, not server time                   |
| `deliveredAt?`   | `Date`             |                                                                   |
| `readAt?`        | `Date`             |                                                                   |
| `referral?`      | `MessageReferral`  | Present for ad-entry flows                                        |
| `createdAt?`     | `Date`             | Auto-managed by `timestamps`                                      |
| `updatedAt?`     | `Date`             | Auto-managed by `timestamps`                                      |

### Indexes

```ts
MessageSchema.index({ tenantId: 1, conversationId: 1, sentAt: -1 });
MessageSchema.index({ tenantId: 1, externalId: 1 }, { sparse: true });
```

---

## Summary

| Schema         | File                                           | Indexes | Hooks          | Encrypted Fields                                           |
| -------------- | ---------------------------------------------- | ------- | -------------- | ---------------------------------------------------------- |
| `Tenant`       | `tenants/schemas/tenant.schema.ts`             | 1       | 3 pre + 4 post | `accessToken`, `appSecret`, `webhookVerifyToken` (WA + IG) |
| `Membership`   | `tenants/schemas/membership.schema.ts`         | 3       | 1 pre          | None                                                       |
| `User`         | `users/schemas/user.schema.ts`                 | 3       | None           | None                                                       |
| `Customer`     | `customers/schemas/customer.schema.ts`         | 2       | None           | None                                                       |
| `Conversation` | `conversations/schemas/conversation.schema.ts` | 4       | None           | None                                                       |
| `Message`      | `messages/schemas/message.schema.ts`           | 2       | None           | None                                                       |
