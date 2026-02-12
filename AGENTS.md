# AGENTS.md

This document defines the **AI agent roles, responsibilities, and operating guidelines** for this project.
The project is a **multitenant omnichannel CRM-like API** (similar to Zendesk or respond.io), built with **NestJS**, integrating **WhatsApp** and **Instagram APIs**, using **MongoDB (Mongoose)** and **Better Auth** for authentication.

---

## System Overview

- **Architecture**: Modular NestJS API
- **Domain**: Omnichannel CRM (messages, conversations, contacts, agents)
- **Tenancy Model**: Multitenant (shared cluster, tenant isolation at data and auth level)
- **Channels**: WhatsApp, Instagram (extensible to others)
- **Database**: MongoDB with Mongoose
- **Authentication**: Better Auth
- **Package Manager**: pnpm

Each agent described below operates within strict tenant boundaries and must never leak data across tenants.

---

## Agent Principles

All agents must follow these principles:

- **Tenant Isolation First**: Every action must be scoped by `tenantId`.
- **Security by Default**: No implicit trust between services, users, or integrations.
- **Auditability**: Actions that mutate state must be traceable.
- **Idempotency**: Webhook and external API handling must be idempotent.
- **Fail Gracefully**: External APIs are unreliable by nature.

---

## Core Agents

### Auth Agent

**Responsibility**

- Manage authentication and authorization using Better Auth
- Issue and validate sessions/tokens
- Enforce tenant-scoped access

**Key Capabilities**

- User registration and login
- Session validation
- Role-based access control (RBAC)
- Tenant membership validation

**Constraints**

- Must never resolve a user without an associated tenant context
- Must not embed business logic beyond access control

---

### Tenant Agent

**Responsibility**

- Manage tenant lifecycle and configuration

**Key Capabilities**

- Create and manage tenants
- Assign users to tenants
- Store tenant-level settings (channels, limits, integrations)

**Data Scope**

- `tenants`
- `tenant_users`
- `tenant_settings`

---

### Channel Integration Agent

**Responsibility**

- Handle third-party channel APIs (WhatsApp, Instagram)
- Documentation for both WhatsApp and Instagram APIs inside docs folder(docs/instagram/instagram-api-reference.md and docs/instagram/whatsapp-api-reference.md)

**Key Capabilities**

- Webhook ingestion and verification
- Message normalization into internal format
- Outbound message delivery
- Token refresh and API health checks

**Supported Channels**

- WhatsApp Cloud API
- Instagram Messaging API

**Constraints**

- Must be stateless
- Must validate webhook signatures
- Must be fully tenant-aware

---

### Conversation Agent

**Responsibility**

- Manage conversations across channels

**Key Capabilities**

- Create and update conversations
- Assign conversations to agents
- Maintain conversation state (open, pending, closed)

**Data Scope**

- `conversations`
- `messages`

---

### Message Agent

**Responsibility**

- Handle inbound and outbound messages

**Key Capabilities**

- Persist messages
- Normalize channel-specific payloads
- Trigger events (notifications, automations)

**Constraints**

- Messages must always belong to exactly one conversation
- Messages must be immutable after creation

---

## Socket Authentication

WebSocket connections are authenticated via **Better Auth session cookies** validated at connection time through a manually-invoked guard.

### Flow

```
Client connects via Socket.IO (WebSocket upgrade request)
  │
  └─► Handshake carries HTTP cookies (incl. Better Auth session cookie)
        │
        └─► ChatGateway.handleConnection() fires
              │
              └─► SocketAuthGuard.canActivate() called manually
                    │
                    └─► auth.api.getSession({ headers: client.handshake.headers })
                          │
                          ├─► Session FOUND → client.data.session = session → connected
                          │
                          └─► Session NOT FOUND → WsException thrown → client.disconnect()
```

### Implementation

- **Gateway**: `src/chat/chat.gateway.ts` — implements `OnGatewayConnection`. Inside `handleConnection`, the guard is called **manually** (not via `@UseGuards`) by constructing a fake `ExecutionContext`:

```ts
const isAuthorized = await this.socketAuthGuard.canActivate({
  switchToWs: () => ({ getClient: () => client }),
} as any);
if (!isAuthorized) client.disconnect();
```

- **Guard**: `src/auth/guards/socket-auth.guard.ts` — extracts headers from the Socket.IO handshake and passes them directly to Better Auth:

```ts
const session = await auth.api.getSession({
  headers: client.handshake.headers as any,
});
if (!session) throw new WsException('Unauthorized');
client.data.session = session;
```

- **Session propagation**: Once validated, the session object is stored in `client.data.session` so any downstream message handler can access it.

### Constraints

- The client **must** send the Better Auth session cookie in the WebSocket upgrade request headers (set at HTTP login time).
- Cross-subdomain cookies are enabled in the Better Auth config to support frontend/backend on different subdomains.
- If authentication fails for any reason (no session, expired session, exception), the socket is forcibly disconnected.
- All socket operations must still be scoped by `tenantId` extracted from `client.data.session.user.tenantId`.

---

## Supporting Agents

### Webhook Agent

**Responsibility**

- Centralized webhook handling

**Key Capabilities**

- Signature verification
- Payload validation
- Deduplication

---

### Automation Agent (Optional / Future)

**Responsibility**

- Rules, triggers, and workflows

**Examples**

- Auto-assign conversations
- Auto-reply messages
- SLA tracking

---

## Data & Multitenancy Rules

- All collections must include `tenantId`
- Queries **must** be tenant-scoped by default
- Cross-tenant queries are forbidden
- Indexing strategy must include `tenantId`

Example:

```ts
ConversationSchema.index({ tenantId: 1, updatedAt: -1 });
```

---

## Error Handling & Retries

- External API failures must be retried with backoff
- Webhook processing must be idempotent
- Partial failures must not corrupt tenant data

---

## Observability & Auditing

Agents should emit:

- Structured logs (tenantId, agentName)
- Domain events for critical actions
- Audit logs for auth and data mutations

---

## Security Considerations

- Validate all inbound payloads
- Never trust external IDs without verification
- Encrypt sensitive tokens at rest
- Scope API keys per tenant

---

## Extensibility Guidelines

- New channels must follow the Channel Integration Agent contract
- Business logic must live outside controllers
- Avoid tight coupling between agents

---

## Code Guidelines

### Enums

Follow the next example for enums declaration

```js
enum CardinalDirections {
    North = "NORTH",
    South = "SOUTH",
    East = "EAST",
    West = "WEST"
}
```

## Project Structure

```
src/
├── main.ts                          # Bootstrap: NestFactory, CORS, port
├── app.module.ts                    # Root module; wires all modules + TenantsMiddleware
├── app.controller.ts / .service.ts  # Root health-check controller/service
│
├── auth/
│   └── guards/
│       └── socket-auth.guard.ts     # WebSocket auth guard (validates Better Auth session)
│
├── chat/
│   ├── chat.gateway.ts              # Socket.IO gateway (OnGatewayConnection/Disconnect)
│   ├── chat.module.ts
│   └── enums/
│       ├── socket-events.enum.ts
│       └── message-events.enum.ts
│
├── conversations/
│   ├── conversations.module.ts
│   ├── conversations.controller.ts
│   ├── conversations.service.ts
│   ├── dto/
│   │   ├── create-conversation.dto.ts
│   │   └── update-conversation.dto.ts
│   └── entities/
│       └── conversation.entity.ts   # Stub (empty class — not yet implemented)
│
├── customers/
│   ├── customers.module.ts
│   └── schemas/
│       └── customer.schema.ts
│
├── database/
│   └── database.module.ts           # MongooseModule.forRootAsync via ConfigService
│
├── lib/
│   ├── auth.ts                      # Better Auth instance (betterAuth config, admin plugin, RBAC)
│   └── permissions.ts               # RBAC roles: user, admin, superAdmin via createAccessControl
│
├── memberships/
│   ├── memberships.module.ts
│   ├── memberships.service.ts
│   └── dto/
│       └── update-membership.dto.ts
│
├── messages/
│   └── dto/
│       ├── whatsapp/                # 20 DTOs covering every WhatsApp webhook payload shape
│       │   ├── index.ts
│       │   ├── whatsapp-webhook.dto.ts
│       │   ├── whatsapp-webhook-message.dto.ts
│       │   └── ... (18 more)
│       └── instagram/               # 16 DTOs covering every Instagram webhook payload shape
│           ├── index.ts
│           ├── instagram-webhook.dto.ts
│           └── ... (14 more)
│
├── tenants/
│   ├── tenants.module.ts
│   ├── tenants.controller.ts
│   ├── tenants.service.ts
│   ├── tenants.middleware.ts        # Resolves tenantId from session or subdomain slug
│   ├── dto/
│   │   ├── create-tenant.dto.ts
│   │   ├── update-tenant.dto.ts     # PartialType(CreateTenantDto)
│   │   ├── whatsapp-info.dto.ts
│   │   └── instagram-info.dto.ts
│   └── schemas/
│       ├── tenant.schema.ts
│       └── membership.schema.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── schemas/
│       └── user.schema.ts
│
└── utils/
    ├── encryption.ts                # AES-256-GCM encrypt/decrypt/isEncrypted
    └── test-db.helper.ts
```

---

## Naming Conventions

| Concern                   | Convention                                                                     | Example                                                |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Files                     | `kebab-case.type.ts`                                                           | `tenants.service.ts`, `create-tenant.dto.ts`           |
| Schema files              | `<entity>.schema.ts` in `schemas/` subdirectory                                | `src/tenants/schemas/tenant.schema.ts`                 |
| DTO files                 | `<action>-<entity>.dto.ts`                                                     | `create-tenant.dto.ts`, `update-membership.dto.ts`     |
| Webhook DTOs              | `<channel>-webhook-<part>.dto.ts`                                              | `whatsapp-webhook-message.dto.ts`                      |
| Enum files                | `<concept>.enum.ts` in `enums/` subdirectory                                   | `src/chat/enums/socket-events.enum.ts`                 |
| Classes                   | `PascalCase`                                                                   | `TenantsService`, `TenantDocument`, `CreateTenantDto`  |
| Document types            | `type XDocument = X & Document`                                                | `TenantDocument`, `UserDocument`                       |
| Schema exports            | `export const XSchema = SchemaFactory.createForClass(X)`                       | `TenantSchema`, `UserSchema`                           |
| Local imports             | Use `.js` extension (ESM)                                                      | `import { Tenant } from './schemas/tenant.schema.js'`  |
| Model injection token     | `Tenant.name` (class `.name` property)                                         | `@InjectModel(Tenant.name)`                            |
| All queries               | `.lean().exec()` chained                                                       | `this.tenantModel.find().lean().exec()`                |
| Indexes                   | Declared after `SchemaFactory.createForClass()`, always include `tenantId`     | `Schema.index({ tenantId: 1, updatedAt: -1 })`         |
| `createdAt` / `updatedAt` | Optional fields on class body (not `@Prop`), managed by `{ timestamps: true }` | `createdAt?: Date; updatedAt?: Date;`                  |
| Update DTOs               | Extend `PartialType(CreateXDto)` from `@nestjs/mapped-types`                   | `UpdateTenantDto extends PartialType(CreateTenantDto)` |
| Logger                    | `private readonly logger = new Logger(ClassName.name)` after constructor       | Used in every service                                  |
| Tenant isolation          | Every schema has `tenantId: Types.ObjectId` + compound index with `tenantId`   | Enforced at schema and query level                     |
| Encryption                | Sensitive fields encrypted at rest via AES-256-GCM hooks in schema             | `pre('save')` + `post('save')` hooks on `TenantSchema` |

---

## Docs

Docs should be in the **/docs** folder

### better-auth

Check docs with https://www.better-auth.com/llms.txt

---

## Ownership

This document is a living specification.

Any architectural change that impacts:

- multitenancy
- authentication
- channel integrations

**must update this file accordingly.**

---
