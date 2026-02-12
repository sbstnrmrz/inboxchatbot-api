# Instagram Webhook Payload

Estructura completa del payload que envía la Instagram Messaging API al endpoint de webhook.
Los DTOs correspondientes están en `src/messages/dto/instagram/`.

> Instagram usa una estructura diferente a WhatsApp. En lugar de `entry[].changes[].value`, los eventos de mensajería van en `entry[].messaging[]`. Los eventos de comentarios usan `entry[].changes[]`.

---

## Estructura raíz

```json
{
  "object": "instagram",
  "entry": [ <Entry> ]
}
```

| Campo    | Tipo      | Descripción                                  |
| -------- | --------- | -------------------------------------------- |
| `object` | `string`  | Siempre `"instagram"`.                       |
| `entry`  | `Entry[]` | Lista de entradas de la cuenta de Instagram. |

---

## Entry

Un entry puede contener `messaging` (eventos de mensajería) o `changes` (comentarios/otros).

```json
{
  "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
  "time": "<UNIX_TIMESTAMP>",
  "messaging": [ <MessagingEvent> ],
  "changes": [ <Change> ]
}
```

| Campo       | Tipo               | Presencia             | Descripción                                          |
| ----------- | ------------------ | --------------------- | ---------------------------------------------------- |
| `id`        | `string`           | Siempre               | Instagram User ID de la cuenta profesional.          |
| `time`      | `string`           | Siempre               | Timestamp Unix de cuando Meta envió la notificación. |
| `messaging` | `MessagingEvent[]` | Eventos de mensajería | Array de eventos de mensaje, postback, etc.          |
| `changes`   | `Change[]`         | Comentarios y otros   | Array de cambios (comments, mentions, etc.).         |

---

## MessagingEvent

Cada objeto dentro de `messaging[]` representa un evento entre un usuario y la cuenta profesional.

```json
{
  "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },
  "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },
  "timestamp": 1603059201,
  "message": { ... }
}
```

| Campo          | Tipo          | Presencia                    | Descripción                               |
| -------------- | ------------- | ---------------------------- | ----------------------------------------- |
| `sender`       | `Sender`      | Siempre                      | Quien envió el evento.                    |
| `recipient`    | `Recipient`   | Siempre                      | Quien recibió el evento.                  |
| `timestamp`    | `number`      | Siempre                      | Unix timestamp del evento.                |
| `is_self`      | `boolean`     | Self messaging               | `true` si es un evento de self-messaging. |
| `message`      | `Message`     | Evento `messages`            | Mensaje entrante o echo.                  |
| `postback`     | `Postback`    | Evento `messaging_postbacks` | Click en botón o icebreaker.              |
| `reaction`     | `Reaction`    | Evento `message_reactions`   | Reacción a un mensaje.                    |
| `read`         | `Read`        | Evento `messaging_seen`      | Mensaje leído.                            |
| `message_edit` | `MessageEdit` | Edición de mensaje           | Mensaje editado por el usuario.           |
| `referral`     | `Referral`    | Evento `messaging_referral`  | Usuario llegó desde un link o ad.         |

### Sender / Recipient

| Campo | Tipo     | Descripción                                             |
| ----- | -------- | ------------------------------------------------------- |
| `id`  | `string` | Instagram-scoped ID (IGSID) del usuario o de la cuenta. |

---

## Message

Presente cuando `messaging_event` contiene un mensaje del usuario.

```json
{
  "mid": "<MESSAGE_ID>",
  "text": "Hello",
  "is_echo": false,
  "is_self": false,
  "is_deleted": false,
  "is_unsupported": false,
  "attachments": [ <Attachment> ],
  "reply_to": { ... }
}
```

| Campo            | Tipo           | Presencia                            | Descripción                                         |
| ---------------- | -------------- | ------------------------------------ | --------------------------------------------------- |
| `mid`            | `string`       | Siempre                              | ID único del mensaje.                               |
| `text`           | `string`       | Opcional                             | Texto del mensaje.                                  |
| `is_echo`        | `boolean`      | Echo (mensaje enviado por la cuenta) | `true` si es una copia del mensaje enviado.         |
| `is_self`        | `boolean`      | Self messaging                       | `true` si es un mensaje de self-messaging.          |
| `is_deleted`     | `boolean`      | Si el mensaje fue eliminado          | `true` si el usuario eliminó el mensaje.            |
| `is_unsupported` | `boolean`      | Si el tipo no es soportado           | `true` si el tipo de mensaje no es compatible.      |
| `attachments`    | `Attachment[]` | Si incluye media o adjuntos          | Imágenes, videos, audios, stories compartidas, etc. |
| `reply_to`       | `ReplyTo`      | Si es respuesta a un mensaje o story | Referencia al mensaje o story original.             |

### Attachment

| Campo     | Tipo                | Descripción                                                                             |
| --------- | ------------------- | --------------------------------------------------------------------------------------- |
| `type`    | `string`            | Tipo: `"image"`, `"video"`, `"audio"`, `"file"`, `"reel"`, `"ig_reel"`, `"share"`, etc. |
| `payload` | `AttachmentPayload` | Datos del adjunto.                                                                      |

#### AttachmentPayload

| Campo   | Tipo     | Presencia | Descripción                             |
| ------- | -------- | --------- | --------------------------------------- |
| `url`   | `string` | Opcional  | URL del media (solo se incluye la URL). |
| `title` | `string` | Opcional  | Título del adjunto.                     |

### ReplyTo

| Campo   | Tipo     | Presencia                   | Descripción                     |
| ------- | -------- | --------------------------- | ------------------------------- |
| `story` | `Story`  | Si es respuesta a una story | Datos de la story referenciada. |
| `mid`   | `string` | Si es reply a un mensaje    | ID del mensaje original.        |

#### Story

| Campo | Tipo     | Descripción          |
| ----- | -------- | -------------------- |
| `url` | `string` | CDN URL de la story. |
| `id`  | `string` | ID de la story.      |

---

## Postback

Presente cuando el usuario hace click en un botón de menú persistente, icebreaker, o CTA button.

```json
{
  "mid": "<MESSAGE_ID>",
  "title": "Start Chatting",
  "payload": "DEVELOPER_DEFINED_PAYLOAD"
}
```

| Campo     | Tipo      | Presencia      | Descripción                                        |
| --------- | --------- | -------------- | -------------------------------------------------- |
| `mid`     | `string`  | Siempre        | ID del mensaje generado por el postback.           |
| `title`   | `string`  | Siempre        | Texto de la opción seleccionada.                   |
| `payload` | `string`  | Opcional       | Payload definido por el desarrollador en el botón. |
| `is_self` | `boolean` | Self messaging | `true` si es un postback de self-messaging.        |

---

## Reaction

Presente cuando el usuario reacciona a un mensaje.

```json
{
  "mid": "<MESSAGE_ID>",
  "action": "react",
  "reaction": "love",
  "emoji": "❤"
}
```

| Campo      | Tipo     | Presencia | Descripción                                      |
| ---------- | -------- | --------- | ------------------------------------------------ |
| `mid`      | `string` | Siempre   | ID del mensaje al que se reaccionó.              |
| `action`   | `string` | Siempre   | `"react"` para agregar, `"unreact"` para quitar. |
| `reaction` | `string` | Opcional  | Nombre de la reacción (ej. `"love"`).            |
| `emoji`    | `string` | Opcional  | Emoji Unicode de la reacción.                    |

---

## Read

Presente cuando el usuario lee un mensaje (evento `messaging_seen`).

```json
{
  "mid": "<MESSAGE_ID>"
}
```

| Campo | Tipo     | Descripción                   |
| ----- | -------- | ----------------------------- |
| `mid` | `string` | ID del mensaje que fue leído. |

---

## MessageEdit

Presente cuando el usuario edita un mensaje enviado.

```json
{
  "mid": "<MESSAGE_ID>",
  "text": "<EDITED_TEXT>",
  "num_edit": "1"
}
```

| Campo      | Tipo     | Descripción                              |
| ---------- | -------- | ---------------------------------------- |
| `mid`      | `string` | ID del mensaje editado.                  |
| `text`     | `string` | Nuevo texto del mensaje tras la edición. |
| `num_edit` | `string` | Número de veces que fue editado.         |

---

## Referral

Presente cuando el usuario llegó a la conversación desde un link `ig.me/` o un anuncio Click-to-Instagram Direct.

```json
{
  "ref": "<IGME_LINK_REF_PARAMETER_VALUE>",
  "source": "<IGME_SOURCE_LINK>",
  "type": "OPEN_THREAD"
}
```

| Campo    | Tipo     | Presencia | Descripción                                  |
| -------- | -------- | --------- | -------------------------------------------- |
| `ref`    | `string` | Siempre   | Valor del parámetro `ref` del link `ig.me/`. |
| `source` | `string` | Opcional  | URL fuente del link o anuncio.               |
| `type`   | `string` | Opcional  | Tipo de referral, ej. `"OPEN_THREAD"`.       |

---

## Change

Presente en `entry[].changes[]` para eventos de comentarios y otros (no mensajería).

```json
{
  "field": "comments",
  "value": { ... }
}
```

| Campo   | Tipo           | Descripción                                        |
| ------- | -------------- | -------------------------------------------------- |
| `field` | `string`       | Tipo de evento: `"comments"`, `"mentions"`, etc.   |
| `value` | `CommentValue` | Datos del evento (estructura varía según `field`). |

### CommentValue

Para eventos de campo `"comments"`:

```json
{
  "id": "<COMMENT_ID>",
  "from": {
    "id": "<USER_ID>",
    "username": "<USERNAME>"
  },
  "text": "<COMMENT_TEXT>",
  "media": {
    "id": "<MEDIA_ID>",
    "media_product_type": "<TYPE>"
  }
}
```

| Campo   | Tipo           | Presencia | Descripción                             |
| ------- | -------------- | --------- | --------------------------------------- |
| `id`    | `string`       | Siempre   | ID del comentario.                      |
| `from`  | `CommentFrom`  | Opcional  | Información del autor del comentario.   |
| `text`  | `string`       | Opcional  | Texto del comentario.                   |
| `media` | `CommentMedia` | Opcional  | Media a la que pertenece el comentario. |

#### CommentFrom

| Campo               | Tipo     | Presencia      | Descripción                               |
| ------------------- | -------- | -------------- | ----------------------------------------- |
| `id`                | `string` | Opcional       | ID de la cuenta que comentó.              |
| `username`          | `string` | Opcional       | Username de quien comentó.                |
| `self_ig_scoped_id` | `string` | Self messaging | IGSID de la propia cuenta (self comment). |

#### CommentMedia

| Campo                | Tipo     | Descripción                               |
| -------------------- | -------- | ----------------------------------------- |
| `id`                 | `string` | ID del media comentado.                   |
| `media_product_type` | `string` | Tipo de media (`"POST"`, `"REEL"`, etc.). |

---

## Campos de webhook suscribibles

| Campo                 | Descripción                                          |
| --------------------- | ---------------------------------------------------- |
| `messages`            | Mensajes entrantes y echoes.                         |
| `messaging_postbacks` | Clicks en botones de menú, icebreakers y CTAs.       |
| `messaging_seen`      | Notificaciones de lectura (read receipts).           |
| `messaging_referral`  | Usuarios que llegan desde links `ig.me/` o anuncios. |
| `message_reactions`   | Reacciones a mensajes.                               |
| `messaging_handover`  | Transferencia de control entre apps.                 |
| `standby`             | Mensajes en canal standby (handover protocol).       |
| `comments`            | Comentarios en media del negocio.                    |
| `live_comments`       | Comentarios en lives.                                |
| `mentions`            | Menciones de la cuenta en media de otros usuarios.   |
| `story_insights`      | Datos de rendimiento de stories.                     |

---

## Ejemplos

### Mensaje de texto entrante

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
      "time": "<TIME_NOTIFICATION_WAS_SENT>",
      "messaging": [
        {
          "sender": { "id": "<SENDER_ID>" },
          "recipient": { "id": "<RECIPIENT_ID>" },
          "timestamp": 1603059201,
          "message": {
            "mid": "<MESSAGE_ID>",
            "text": "Hello"
          }
        }
      ]
    }
  ]
}
```

### Reacción a un mensaje

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
      "time": "<TIME_NOTIFICATION_WAS_SENT>",
      "messaging": [
        {
          "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },
          "timestamp": 1603059201,
          "reaction": {
            "mid": "<MESSAGE_ID>",
            "action": "react",
            "reaction": "love",
            "emoji": "❤"
          }
        }
      ]
    }
  ]
}
```

### Postback (click en botón)

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
      "time": "<TIME_NOTIFICATION_WAS_SENT>",
      "messaging": [
        {
          "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },
          "timestamp": 1603059201,
          "postback": {
            "mid": "<MESSAGE_ID>",
            "title": "Start Chatting",
            "payload": "DEVELOPER_DEFINED_PAYLOAD"
          }
        }
      ]
    }
  ]
}
```

### Mensaje leído

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
      "time": "<TIME_NOTIFICATION_WAS_SENT>",
      "messaging": [
        {
          "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },
          "timestamp": 1603059201,
          "read": { "mid": "<MESSAGE_ID>" }
        }
      ]
    }
  ]
}
```

### Respuesta a una story

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
      "time": "<TIME_NOTIFICATION_WAS_SENT>",
      "messaging": [
        {
          "sender": { "id": "<SENDER_ID>" },
          "recipient": { "id": "<RECIPIENT_ID>" },
          "timestamp": 1603059201,
          "message": {
            "mid": "<MESSAGE_ID>",
            "text": "<MESSAGE_TEXT>",
            "reply_to": {
              "story": {
                "url": "<CDN_URL_FOR_THE_STORY>",
                "id": "<STORY_ID>"
              }
            }
          }
        }
      ]
    }
  ]
}
```

### Comentario en media (changes)

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
      "time": "<TIME_META_SENT_THIS_NOTIFICATION>",
      "changes": [
        {
          "field": "comments",
          "value": {
            "id": "<COMMENT_ID>",
            "from": { "username": "<USERNAME>" },
            "text": "<COMMENT_TEXT>",
            "media": {
              "id": "<MEDIA_ID>",
              "media_product_type": "<MEDIA_PRODUCT_TYPE>"
            }
          }
        }
      ]
    }
  ]
}
```
