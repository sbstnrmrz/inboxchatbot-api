# WhatsApp Webhook Payload

Estructura completa del payload que envía WhatsApp Cloud API al endpoint de webhook.
Los DTOs correspondientes están en `src/messages/dto/whatsapp/`.

---

## Estructura raíz

```json
{
  "object": "whatsapp_business_account",
  "entry": [ <Entry> ]
}
```

| Campo    | Tipo      | Descripción                                       |
| -------- | --------- | ------------------------------------------------- |
| `object` | `string`  | Siempre `"whatsapp_business_account"`.            |
| `entry`  | `Entry[]` | Lista de entradas del WABA que disparó el evento. |

---

## Entry

```json
{
  "id": "<WABA_ID>",
  "changes": [ <Change> ]
}
```

| Campo     | Tipo       | Descripción                              |
| --------- | ---------- | ---------------------------------------- |
| `id`      | `string`   | ID del WhatsApp Business Account (WABA). |
| `changes` | `Change[]` | Cambios que dispararon la notificación.  |

---

## Change

```json
{
  "value": <Value>,
  "field": "messages"
}
```

| Campo   | Tipo     | Descripción                                             |
| ------- | -------- | ------------------------------------------------------- |
| `value` | `Value`  | Detalle del cambio.                                     |
| `field` | `string` | Tipo de notificación. Actualmente siempre `"messages"`. |

---

## Value

```json
{
  "messaging_product": "whatsapp",
  "metadata": <Metadata>,
  "contacts": [ <Contact> ],
  "messages": [ <Message> ],
  "statuses": [ <Status> ],
  "errors": [ <Error> ]
}
```

| Campo               | Tipo        | Presencia | Descripción                                         |
| ------------------- | ----------- | --------- | --------------------------------------------------- |
| `messaging_product` | `string`    | Siempre   | Siempre `"whatsapp"`.                               |
| `metadata`          | `Metadata`  | Siempre   | Datos del número de teléfono que recibe el webhook. |
| `contacts`          | `Contact[]` | Mensajes  | Información del contacto que envió el mensaje.      |
| `messages`          | `Message[]` | Mensajes  | Mensajes entrantes.                                 |
| `statuses`          | `Status[]`  | Status    | Actualizaciones de estado de mensajes salientes.    |
| `errors`            | `Error[]`   | Opcional  | Errores a nivel de valor.                           |

---

## Metadata

```json
{
  "display_phone_number": "16505553333",
  "phone_number_id": "27681414235104944"
}
```

| Campo                  | Tipo     | Descripción                                             |
| ---------------------- | -------- | ------------------------------------------------------- |
| `display_phone_number` | `string` | Número de teléfono del negocio que recibe el webhook.   |
| `phone_number_id`      | `string` | ID del número. Usado para enviar mensajes de respuesta. |

---

## Contact

```json
{
  "profile": { "name": "Kerry Fisher" },
  "wa_id": "16315551234"
}
```

| Campo     | Tipo      | Descripción                         |
| --------- | --------- | ----------------------------------- |
| `profile` | `Profile` | Perfil del contacto.                |
| `wa_id`   | `string`  | WhatsApp ID del cliente (teléfono). |

### Profile

| Campo  | Tipo     | Presencia | Descripción        |
| ------ | -------- | --------- | ------------------ |
| `name` | `string` | Opcional  | Nombre del perfil. |

---

## Message

Presente en `value.messages` para mensajes entrantes.

```json
{
  "from": "16315551234",
  "id": "wamid.ABGGFlCGg0cvAgo-sJQh43L5Pe4W",
  "timestamp": "1603059201",
  "type": "text",
  "text": { "body": "Hello" }
}
```

| Campo         | Tipo          | Presencia                               | Descripción                       |
| ------------- | ------------- | --------------------------------------- | --------------------------------- |
| `from`        | `string`      | Siempre                                 | Teléfono del cliente.             |
| `id`          | `string`      | Siempre                                 | ID único del mensaje (`wamid.*`). |
| `timestamp`   | `string`      | Siempre                                 | Unix timestamp del envío.         |
| `type`        | `string`      | Siempre                                 | Ver tipos soportados abajo.       |
| `context`     | `Context`     | Si es reenvío o reply                   | Contexto del mensaje original.    |
| `identity`    | `Identity`    | Si `show_security_notifications` activo | Cambio de identidad del usuario.  |
| `text`        | `Text`        | Si `type = text`                        |                                   |
| `audio`       | `Media`       | Si `type = audio`                       | Incluye mensajes de voz.          |
| `image`       | `Media`       | Si `type = image`                       |                                   |
| `sticker`     | `Media`       | Si `type = sticker`                     |                                   |
| `video`       | `Media`       | Si `type = video`                       |                                   |
| `document`    | `Media`       | Si `type = document`                    |                                   |
| `reaction`    | `Reaction`    | Si `type = reaction`                    |                                   |
| `interactive` | `Interactive` | Si `type = interactive`                 | Respuesta a botones o listas.     |
| `button`      | `Button`      | Si `type = button`                      | Click en botón de quick reply.    |
| `system`      | `System`      | Si `type = system`                      | Cambio de número o identidad.     |
| `referral`    | `Referral`    | Si viene de un ad Click-to-WhatsApp     |                                   |
| `errors`      | `Error[]`     | Si `type = unknown`                     |                                   |

### Tipos de mensaje (`type`)

| Valor         | Descripción                                    |
| ------------- | ---------------------------------------------- |
| `text`        | Mensaje de texto plano.                        |
| `image`       | Imagen.                                        |
| `audio`       | Audio o mensaje de voz.                        |
| `video`       | Video.                                         |
| `document`    | Documento (PDF, DOCX, etc.).                   |
| `sticker`     | Sticker.                                       |
| `reaction`    | Reacción con emoji a un mensaje.               |
| `interactive` | Respuesta a mensaje interactivo (botón/lista). |
| `button`      | Click en quick reply button de template.       |
| `order`       | Pedido de producto (Commerce).                 |
| `contacts`    | Tarjeta de contacto.                           |
| `location`    | Ubicación.                                     |
| `system`      | Cambio de número o identidad del usuario.      |
| `unknown`     | Tipo no soportado.                             |

---

## Text

| Campo  | Tipo     | Descripción            |
| ------ | -------- | ---------------------- |
| `body` | `string` | Contenido del mensaje. |

---

## Media

Usado para `audio`, `image`, `sticker`, `video` y `document`.

| Campo       | Tipo     | Presencia                      | Descripción                           |
| ----------- | -------- | ------------------------------ | ------------------------------------- |
| `id`        | `string` | Siempre                        | ID del media (para descargarlo).      |
| `mime_type` | `string` | Siempre                        | MIME type del archivo.                |
| `sha256`    | `string` | Siempre                        | Checksum del archivo.                 |
| `caption`   | `string` | Opcional (si fue especificado) | Descripción del media.                |
| `filename`  | `string` | Solo en `document`             | Nombre del archivo en el dispositivo. |

---

## Reaction

| Campo        | Tipo     | Descripción                              |
| ------------ | -------- | ---------------------------------------- |
| `message_id` | `string` | `wamid` del mensaje al que se reaccionó. |
| `emoji`      | `string` | Emoji usado en la reacción.              |

---

## Context

Presente si el mensaje es un reenvío o una respuesta a otro mensaje.

| Campo                  | Tipo      | Presencia                     | Descripción                                 |
| ---------------------- | --------- | ----------------------------- | ------------------------------------------- |
| `forwarded`            | `boolean` | Si fue reenviado              | `true` si el mensaje fue reenviado.         |
| `frequently_forwarded` | `boolean` | Si fue reenviado muchas veces | `true` si fue reenviado más de 5 veces.     |
| `from`                 | `string`  | Si es reply                   | WhatsApp ID del remitente original.         |
| `id`                   | `string`  | Opcional                      | ID del mensaje original al que se responde. |

---

## Identity

Presente si `show_security_notifications` está activo.

| Campo               | Tipo      | Descripción                                          |
| ------------------- | --------- | ---------------------------------------------------- |
| `acknowledged`      | `boolean` | Estado del acuse del último `user_identity_changed`. |
| `created_timestamp` | `number`  | Timestamp de cuando se detectó el posible cambio.    |
| `hash`              | `string`  | Identificador de la última notificación de cambio.   |

---

## Interactive

Presente cuando el usuario responde a un mensaje interactivo.

| Campo          | Tipo          | Presencia                | Descripción                        |
| -------------- | ------------- | ------------------------ | ---------------------------------- |
| `type`         | `string`      | Siempre                  | `"button_reply"` o `"list_reply"`. |
| `button_reply` | `ButtonReply` | Si `type = button_reply` | Respuesta a Reply Button.          |
| `list_reply`   | `ListReply`   | Si `type = list_reply`   | Respuesta a List Message.          |

### ButtonReply

| Campo   | Tipo     | Descripción         |
| ------- | -------- | ------------------- |
| `id`    | `string` | ID único del botón. |
| `title` | `string` | Texto del botón.    |

### ListReply

| Campo         | Tipo     | Descripción                 |
| ------------- | -------- | --------------------------- |
| `id`          | `string` | ID de la fila seleccionada. |
| `title`       | `string` | Título de la fila.          |
| `description` | `string` | Descripción de la fila.     |

---

## Button

Presente cuando el usuario hace click en un quick reply button de un template.

| Campo     | Tipo     | Descripción                                        |
| --------- | -------- | -------------------------------------------------- |
| `payload` | `string` | Payload definido por el desarrollador en el botón. |
| `text`    | `string` | Texto del botón.                                   |

---

## System

Presente cuando un usuario cambia de número o hay un cambio de identidad.

| Campo       | Tipo     | Presencia                         | Descripción                                          |
| ----------- | -------- | --------------------------------- | ---------------------------------------------------- |
| `body`      | `string` | Siempre                           | Descripción del evento.                              |
| `type`      | `string` | Siempre                           | `"user_changed_number"` o `"user_identity_changed"`. |
| `new_wa_id` | `string` | Si `type = user_changed_number`   | Nuevo WhatsApp ID del cliente.                       |
| `identity`  | `string` | Si `type = user_identity_changed` | Nuevo WhatsApp ID del cliente.                       |
| `user`      | `string` | Si `type = user_identity_changed` | Nuevo user ID de WhatsApp.                           |

---

## Referral

Presente cuando el mensaje viene de un usuario que hizo click en un anuncio Click-to-WhatsApp.

| Campo           | Tipo     | Presencia               | Descripción                   |
| --------------- | -------- | ----------------------- | ----------------------------- |
| `source_url`    | `string` | Siempre                 | URL del anuncio o post.       |
| `source_type`   | `string` | Siempre                 | `"ad"` o `"post"`.            |
| `source_id`     | `string` | Siempre                 | Meta ID del anuncio o post.   |
| `headline`      | `string` | Siempre                 | Título del anuncio.           |
| `body`          | `string` | Siempre                 | Descripción del anuncio.      |
| `media_type`    | `string` | Siempre                 | `"image"` o `"video"`.        |
| `image_url`     | `string` | Si `media_type = image` | URL de la imagen del anuncio. |
| `video_url`     | `string` | Si `media_type = video` | URL del video del anuncio.    |
| `thumbnail_url` | `string` | Si `media_type = video` | URL del thumbnail del video.  |

---

## Status

Presente en `value.statuses` para actualizaciones de estado de mensajes salientes.

```json
{
  "id": "wamid.ABGGFlCGg0cvAgo-sJQh43L5Pe4W",
  "recipient_id": "16315551234",
  "status": "delivered",
  "timestamp": "1603059201",
  "conversation": { "id": "...", "origin": { "type": "user_initiated" } },
  "pricing": {
    "pricing_model": "CBP",
    "billable": true,
    "category": "user_initiated"
  }
}
```

| Campo          | Tipo           | Presencia            | Descripción                                                 |
| -------------- | -------------- | -------------------- | ----------------------------------------------------------- |
| `id`           | `string`       | Siempre              | ID del mensaje (`wamid.*`).                                 |
| `recipient_id` | `string`       | Siempre              | WhatsApp ID del destinatario.                               |
| `status`       | `string`       | Siempre              | `"sent"`, `"delivered"`, `"read"`, `"failed"`, `"deleted"`. |
| `timestamp`    | `string`       | Siempre              | Unix timestamp del cambio de estado.                        |
| `conversation` | `Conversation` | Opcional             | Atributos de la conversación activa.                        |
| `pricing`      | `Pricing`      | Opcional             | Atributos de facturación.                                   |
| `errors`       | `Error[]`      | Si `status = failed` | Detalle del error de entrega.                               |

### Conversation

| Campo                  | Tipo     | Presencia | Descripción                                   |
| ---------------------- | -------- | --------- | --------------------------------------------- |
| `id`                   | `string` | Siempre   | ID de la conversación.                        |
| `origin`               | `Origin` | Opcional  | Origen de la conversación.                    |
| `expiration_timestamp` | `string` | Opcional  | Timestamp de expiración de la ventana de 24h. |

### Origin

| Campo  | Tipo     | Descripción                                                           |
| ------ | -------- | --------------------------------------------------------------------- |
| `type` | `string` | `"business_initiated"`, `"user_initiated"` o `"referral_conversion"`. |

### Pricing

| Campo           | Tipo      | Descripción                                                           |
| --------------- | --------- | --------------------------------------------------------------------- |
| `pricing_model` | `string`  | `"CBP"` (conversation-based) o `"NBP"` (notification-based).          |
| `billable`      | `boolean` | Si la conversación/mensaje es facturable.                             |
| `category`      | `string`  | `"business_initiated"`, `"user_initiated"` o `"referral_conversion"`. |

---

## Error

| Campo     | Tipo     | Presencia | Descripción        |
| --------- | -------- | --------- | ------------------ |
| `code`    | `number` | Siempre   | Código de error.   |
| `title`   | `string` | Siempre   | Título del error.  |
| `details` | `string` | Opcional  | Detalle del error. |

---

## Ejemplos

### Mensaje de texto entrante

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "8856996819413533",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "16505553333",
              "phone_number_id": "27681414235104944"
            },
            "contacts": [
              {
                "profile": { "name": "Kerry Fisher" },
                "wa_id": "16315551234"
              }
            ],
            "messages": [
              {
                "from": "16315551234",
                "id": "wamid.ABGGFlCGg0cvAgo-sJQh43L5Pe4W",
                "timestamp": "1603059201",
                "text": { "body": "Hello this is an answer" },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Actualización de estado (entregado)

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "8856996819413533",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "16505553333",
              "phone_number_id": "27681414235104944"
            },
            "statuses": [
              {
                "id": "wamid.ABGGFlCGg0cvAgo-sJQh43L5Pe4W",
                "recipient_id": "16315551234",
                "status": "delivered",
                "timestamp": "1603059201",
                "conversation": {
                  "id": "CONVERSATION_ID",
                  "origin": { "type": "user_initiated" }
                },
                "pricing": {
                  "pricing_model": "CBP",
                  "billable": true,
                  "category": "user_initiated"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```
