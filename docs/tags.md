# Tags

A Trello-like tagging system for conversations. Tags are tenant-scoped and can be applied to any conversation.

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/tags` | List all tags for the tenant |
| `POST` | `/tags` | Create a tag |
| `PATCH` | `/tags/:id` | Update tag name/color |
| `DELETE` | `/tags/:id` | Delete tag (removed from all conversations) |
| `POST` | `/conversations/:id/tags/:tagId` | Add tag to conversation |
| `DELETE` | `/conversations/:id/tags/:tagId` | Remove tag from conversation |

## Tag object

```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0d",
  "tenantId": "664f1a2b3c4d5e6f7a8b9c01",
  "name": "Urgent",
  "color": "#EF4444",
  "createdAt": "2026-03-24T10:00:00.000Z",
  "updatedAt": "2026-03-24T10:00:00.000Z"
}
```

## POST /tags body

```json
{
  "name": "Urgent",
  "color": "#EF4444"
}
```

`color` is optional and defaults to `#6B7280`. Must be a valid hex color.

## POST /DELETE /conversations/:id/tags/:tagId response

```json
{
  "conversationId": "664f1a2b3c4d5e6f7a8b9c0a",
  "tags": [
    "664f1a2b3c4d5e6f7a8b9c0d",
    "664f1a2b3c4d5e6f7a8b9c0e"
  ]
}
```

## Socket events

| Event | Payload | Trigger |
|-------|---------|---------|
| `tag_created` | Tag object | New tag created |
| `tag_updated` | Tag object | Tag renamed or recolored |
| `tag_deleted` | `{ tagId }` | Tag deleted |
| `conversation_tag_added` | `{ conversationId, tags[] }` | Tag added to conversation |
| `conversation_tag_removed` | `{ conversationId, tags[] }` | Tag removed from conversation |
