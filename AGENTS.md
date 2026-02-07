# AGENTS.md

This document defines the **AI agent roles, responsibilities, and operating guidelines** for this project.
The project is a **multitenant omnichannel CRM-like API** (similar to Zendesk or respond.io), built with **NestJS**, integrating **WhatsApp** and **Instagram APIs**, using **MongoDB (Mongoose)** and **Better Auth** for authentication.

---

## 1. System Overview

* **Architecture**: Modular NestJS API
* **Domain**: Omnichannel CRM (messages, conversations, contacts, agents)
* **Tenancy Model**: Multitenant (shared cluster, tenant isolation at data and auth level)
* **Channels**: WhatsApp, Instagram (extensible to others)
* **Database**: MongoDB with Mongoose
* **Authentication**: Better Auth

Each agent described below operates within strict tenant boundaries and must never leak data across tenants.

---

## 2. Agent Principles

All agents must follow these principles:

* **Tenant Isolation First**: Every action must be scoped by `tenantId`.
* **Security by Default**: No implicit trust between services, users, or integrations.
* **Auditability**: Actions that mutate state must be traceable.
* **Idempotency**: Webhook and external API handling must be idempotent.
* **Fail Gracefully**: External APIs are unreliable by nature.

---

## 3. Core Agents

### Auth Agent

**Responsibility**

* Manage authentication and authorization using Better Auth
* Issue and validate sessions/tokens
* Enforce tenant-scoped access

**Key Capabilities**

* User registration and login
* Session validation
* Role-based access control (RBAC)
* Tenant membership validation

**Constraints**

* Must never resolve a user without an associated tenant context
* Must not embed business logic beyond access control

---

### Tenant Agent

**Responsibility**

* Manage tenant lifecycle and configuration

**Key Capabilities**

* Create and manage tenants
* Assign users to tenants
* Store tenant-level settings (channels, limits, integrations)

**Data Scope**

* `tenants`
* `tenant_users`
* `tenant_settings`

---

### Channel Integration Agent

**Responsibility**

* Handle third-party channel APIs (WhatsApp, Instagram)
* Documentation for both WhatsApp and Instagram APIs inside docs folder(docs/instagram/instagram-api-reference.md and docs/instagram/whatsapp-api-reference.md)

**Key Capabilities**

* Webhook ingestion and verification
* Message normalization into internal format
* Outbound message delivery
* Token refresh and API health checks

**Supported Channels**

* WhatsApp Cloud API
* Instagram Messaging API

**Constraints**

* Must be stateless
* Must validate webhook signatures
* Must be fully tenant-aware

---

### Conversation Agent

**Responsibility**

* Manage conversations across channels

**Key Capabilities**

* Create and update conversations
* Assign conversations to agents
* Maintain conversation state (open, pending, closed)

**Data Scope**

* `conversations`
* `messages`

---

### Message Agent

**Responsibility**

* Handle inbound and outbound messages

**Key Capabilities**

* Persist messages
* Normalize channel-specific payloads
* Trigger events (notifications, automations)

**Constraints**

* Messages must always belong to exactly one conversation
* Messages must be immutable after creation

---

## Supporting Agents

### Webhook Agent

**Responsibility**

* Centralized webhook handling

**Key Capabilities**

* Signature verification
* Payload validation
* Deduplication

---

### Automation Agent (Optional / Future)

**Responsibility**

* Rules, triggers, and workflows

**Examples**

* Auto-assign conversations
* Auto-reply messages
* SLA tracking

---

## Data & Multitenancy Rules

* All collections must include `tenantId`
* Queries **must** be tenant-scoped by default
* Cross-tenant queries are forbidden
* Indexing strategy must include `tenantId`

Example:

```ts
ConversationSchema.index({ tenantId: 1, updatedAt: -1 })
```

---

## Error Handling & Retries

* External API failures must be retried with backoff
* Webhook processing must be idempotent
* Partial failures must not corrupt tenant data

---

## Observability & Auditing

Agents should emit:

* Structured logs (tenantId, agentName)
* Domain events for critical actions
* Audit logs for auth and data mutations

---

## Security Considerations

* Validate all inbound payloads
* Never trust external IDs without verification
* Encrypt sensitive tokens at rest
* Scope API keys per tenant

---

## Extensibility Guidelines

* New channels must follow the Channel Integration Agent contract
* Business logic must live outside controllers
* Avoid tight coupling between agents

---

## Docs

Docs should be in the **/docs** folder

## Ownership

This document is a living specification.

Any architectural change that impacts:

* multitenancy
* authentication
* channel integrations

**must update this file accordingly.**

