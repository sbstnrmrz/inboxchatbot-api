# Instagram API Reference

This collection will allow you to connect to [Instagram's Graph API](https://developers.facebook.com/docs/instagram-api/), which allows Instagram Professionals - Businesses and Creators - to manage their presence on the platform. This guide will help you to **generate tokens**, **publish content**, **gather insights** and **manage an Instagram profile**.

The API is built on top of Facebook's Graph API, we recommend giving [this guide](https://developers.facebook.com/docs/graph-api/) a look before getting started.

# Before You Start

To interact with the API, you must first have a Facebook App. You can create one following this [guide](https://desktop.postman.com/?desktopVersion=9.31.0&webVersion=9.31.22-ui-221031-1419&userId=19667706&teamId=3121756), for the purposes of the guide, we recommend using a `Business` App.

After creating the app, you must generate a **User Access Token** with it. This token will allow you to manage permissions and objects you manage, you can generate it with this [guide](https://desktop.postman.com/?desktopVersion=9.31.0&webVersion=9.31.22-ui-221031-1419&userId=19667706&teamId=3121756). Afterwards, make sure to select the `Instagram` environment in Postman and paste the resulting token under the `user_access_token` variable.

---

## Table of Contents

- [Instagram API with Facebook Login](#instagram-api-with-facebook-login)
  - [Token](#token)
  - [Reels Publishing](#reels-publishing)
- [Instagram API with Instagram Login](#instagram-api-with-instagram-login)
  - [Send API](#send-api)
    - [Templates](#templates)
  - [Welcome Message Flows API](#welcome-message-flows-api)
  - [Messenger Profile API](#messenger-profile-api)
    - [Persistent Menu](#persistent-menu)
    - [Ice Breakers](#ice-breakers)
  - [Instagram User Profile API](#instagram-user-profile-api)
  - [Attachment Upload API](#attachment-upload-api)
  - [Conversations API](#conversations-api)
  - [Publish Content](#publish-content)
  - [Webhooks](#webhooks)
    - [Subscribe App to Pro Account's webhooks](#subscribe-app-to-pro-accounts-webhooks)
    - [Get All Pro Account's webhooks subscribed by App](#get-all-pro-accounts-webhooks-subscribed-by-app)
    - [Delete App's Pro account webhook subscription](#delete-apps-pro-account-webhook-subscription)
    - [Webhook payload reference](#webhook-payload-reference)
      - [Self webhook](#self-webhook)
  - [Insights](#insights)
  - [Comment Moderation](#comment-moderation)

---

# Instagram API with Facebook Login

The Instagram API with Facebook Login allows [Instagram Professionals](https://l.facebook.com/l.php?u=https%3A%2F%2Fhelp.instagram.com%2F502981923235522%3Ffbclid%3DIwZXh0bgNhZW0CMTEAYnJpZBExenNhTHowNVNncmpCeUVzSAEeeONi9fm0aj6pxq0mbt-OMvO0TJyZLI9_-1ltP268j8TJ9P6eWmpIrLsSozI_aem_WqzWYIFEtccsQFkBVqy4OA&h=AT1sjxS20_CfDO_mwllE_9jYi1deXrQ49MnXc4_669RsJWsBBte483kf404_kJOfXakHJ_bUGmJQPuZ4RGtyuW_9kuYJVJBEtcDNmCzX9qVelp4Kr3oMInbtfgGN_mGsDWQr6BJ_ubsJE9WgrP5apQ1kbjM) — Businesses and Creators — to use your app to manage their presence on Instagram. The API can be used to get and publish their media, manage and reply to comments on their media, identify media where they have been @mentioned by other Instagram users, find hashtagged media, and get basic metadata and metrics about other Instagram Businesses and Creators.

The permission model for the API requires a **Page** to be linked with a [Professional Instagram Account](https://help.instagram.com/502981923235522?fbclid=IwAR1jt_4CNiu3TFxV6AN9wpI2EUy59TtxnrZP1RJuSUOZhuReTezFMs1cAAc) before starting. Linking process can be found [here](https://www.facebook.com/help/1148909221857370).

## Limitations

- The Instagram API with Facebook Login cannot access Instagram consumer accounts (i.e., non-Business or non-Creator Instagram accounts).
    
- [Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing) is available to all Instagram Professional accounts, except Stories, which are only available to business accounts.
    
- [Ordering results](https://developers.facebook.com/docs/graph-api/using-graph-api#ordering) is not supported
    
- All endpoints support cursor-based [pagination](https://developers.facebook.com/docs/graph-api/using-graph-api#paging), but the [User Insights](https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights) edge is the only endpoint that supports time-based pagination
    

## Access Token Permissions needed

These are the permissions needed for the requests in this collection:

- `pages_show_list`
    
- `instagram_basic`
    
- `instagram_content_publish`
    
- `pages_read_engagement`
    
- `instagram_manage_comments`

## Token

An access token is a string that identifies a user, app or IG User and is used by an app to make Graph API calls. This section will cover the basics of tokens used for the Instagram API. Make sure the `Instagram` environment is active and the `user_access_token` variable has a value.

### Get Access Tokens of Pages You Manage

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{api_version}}/me/accounts?fields=name,access_token,tasks,instagram_business_account&access_token={{user_access_token}}`

**Path Parameters:**

- `api_version`: Variable path parameter


**Query Parameters:**

- `fields`: name,access_token,tasks,instagram_business_account

- `access_token`: {{user_access_token}}


**Headers:**

- `User-Agent`: Postman/InstagramCollection


**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "{page_name}",
            "access_token": "{page_access_token}",
            "instagram_business_account": {
                "id": "{ig_user_id}"
            },
            "id": "{page_id}",
            "tasks": [
                "ANALYZE",
                "ADVERTISE",
                "MESSAGING",
                "MODERATE",
                "CREATE_CONTENT",
                "MANAGE"
            ]
        }
        //...
    ]
}
```

---

### Get Specific Page Access Token

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{api_version}}/{{page_id}}?fields=name,access_token,instagram_business_account&access_token={{user_access_token}}`

**Path Parameters:**

- `page_id`: Variable path parameter

- `api_version`: Variable path parameter


**Query Parameters:**

- `fields`: name,access_token,instagram_business_account

- `access_token`: {{user_access_token}}


**Headers:**

- `User-Agent`: Postman/InstagramCollection


**Example Response:**

Status: `200 OK`

```json
{
    "name": "{page_name}",
    "access_token": "{page_access_token}",
    "instagram_business_account": {
        "id": "{ig_user_id}"
    },
    "id": "{page_id}"
}
```

---

## Reels Publishing

This section allows developers to upload and publish a Reel into an Instagram User from a server.

For this section, you'll need to introduce a video link into the `video_url` variable. It needs to follow these specifications:

- Container: MOV or MP4 (PMEG-4 Part 14)
- Audio codec: AAC, 48khz
- Video codec: HEVC or H.264
- Frame rate: 23-60 FPS
- Picture size:
    - Maximum 1920 horizontal pixels
    - Recommended aspect ratio 9:16
- Video bitrate: 25 Mbps maximum
- Audio bitrate: 128 kbps
- Duration 15 minutes maximum, 3 seconds minimum
- File size: 1 GB maximum
    

More information about Reels Publishing can be found [here](https://developers.facebook.com/docs/instagram-api/guides/content-publishing/#reels-posts).

### Upload a Reel to an IG Container

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{api_version}}/{{ig_user_id}}/media?media_type=REELS&video_url={{video_url}}&caption=Hello World!&share_to_feed=false&access_token={{page_access_token}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `media_type`: REELS

- `video_url`: {{video_url}}

- `caption`: Hello World!

- `share_to_feed`: false - If set to true, the reel will appear in both the Feed and Reels tab. If it's set to false, it will only appear in the Reels tab.

- `access_token`: {{page_access_token}}


**Headers:**

- `User-Agent`: Postman/InstagramCollection


**Example Response:**

Status: `200 OK`

```json
{
    "id": "18270815569115548"//IG Container ID
}
```

---

### Get IG Container Status

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{api_version}}/{{ig_container_id}}?fields=status_code,status&access_token={{page_access_token}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_container_id`: Variable path parameter


**Query Parameters:**

- `fields`: status_code,status

- `access_token`: {{page_access_token}}


**Headers:**

- `User-Agent`: Postman/InstagramCollection


**Example Response:**

Status: `200 OK`

```json
{
    "status_code": "FINISHED",
    "status": "Finished: Media has been uploaded and it is ready to be published.",
    "id": "18270815569115548" //IG Container ID
}
```

---

### Publish Reel

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{api_version}}/{{ig_user_id}}/media_publish?creation_id={{ig_container_id}}&access_token={{page_access_token}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `creation_id`: {{ig_container_id}}

- `access_token`: {{page_access_token}}


**Headers:**

- `User-Agent`: Postman/InstagramCollection


**Example Response:**

Status: `200 OK`

```json
{
    "id": "90011803596441"//IG Media ID
}
```

---

# Instagram API with Instagram Login

The Instagram API with Instagram Login allows [Instagram professionals&nbsp;](https://l.facebook.com/l.php?u=https%3A%2F%2Fhelp.instagram.com%2F502981923235522&h=AT1ASpREEMXxdykVj-QP02tVKNkwcQ2Nl_x7xvxvGksvpWqS9BdgBQWeiclc-oXzvNfRm2dFdyjLoT6H4G8w3pjkha7gUXpIuem8PhB40ANXErLcEtpZQl2CvQlavHzKidjr7Jycg6fERoByzvOzQG8vWcM)  — businesses and creators — to use your app to manage their presence on Instagram.

## Limitations

- This API setup cannot access ads or tagging.
    

## Access Token Permissions needed

These are the permissions needed for the requests in this collection:

- `instagram_business_basic`
    
- `instagram_business_manage_messages`
    
- `instagram_business_manage_comments`
    
- `instagram_business_content_publish`

## Send API

The Send API enables your app users to send and receive messages between their Instagram professional account and their customers, potential customers, and followers.

#### An Instagram user sends a message

Conversations only begin when an Instagram user sends a message to your app user through your app user's Instagram Feed, posts, story mentions, and other channels.

#### Instagram Inbox

An Instagram professional account has a messaging inbox that allows the user to organize messages and control message notifications however when using the API the behavior will be a little different.

- **General** – Only after your app user to respond to a message, using your app, is the conversation moved to the General folder, regardless of the inbox settings.
    
- **Primary** – All new conversations from followers will initially appear in the Primary folder.
    
- **Requests** – All new conversations from Instagram users who aren't followers of your app user will appear in the Requests folder.
    

[Learn more about the Instagram Inbox.](https://www.facebook.com/business/help/1264898753662278)

### Before You Start

You will need:

- An access token requested by the IG professional account who can send message to a user on the platform
    
- The `instagram_business_manage_messages` permission
    
- The message recipient user must have sent a message to your IG professional account
    

## Environment

This collection has a corresponding **Instagram Platform API** Postman [environment](https://learning.postman.com/docs/sending-requests/managing-environments/) which you must select when using the collection. Set **current values** for the variables defined in this environment if you wish to perform the queries in the collection.

### Access tokens

The API supports both user and system user access tokens. You can get access tokens 3 different ways:

- [Facebook login](https://developers.facebook.com/docs/facebook-login/overview) for your app
    
- [App Dashboard](https://developers.facebook.com/apps)
    
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
    

### Limitations

- Your app user must own any media or posts to be used in the message.
    
- Group messaging is not supported. An Instagram professional account can only converse with one customer per conversation.
    
- Messages in the Requests folder that have not been active for 30 days will not be returned in API calls.
    
- Only the URL for the shared media or post is included in the webhooks notification when a customer sends a message with a share.
    
- Your app testers must have a role on your app, grant your app access to all the required permissions, and have a role on the Instagram professional account that owns the app.

### Templates

## Generic Template

The generic template allows you to send a structured message that includes an image, text and buttons. A generic template with multiple templates described in the [<code>elements</code>](https://developers.facebook.com/docs/messenger-platform/instagram/features/generic-template#elements) array will send a horizontally scrollable carousel of items, each composed of an image, text and buttons.

## Button Template

The button template sends a text message with up to three attached buttons. This template is useful for offering the message recipient options to choose from, such as predetermined responses to a question, or actions to take.

#### Generic Template

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Example Response:**

Status: `200 OK`

```json
{
    "recipient_id": "20802401916297",
    "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjEyNTAyNDAyNjQwOTMwOjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODE4NzUxOTk3OTcyODI5MjozMjM4NzQ4MDk1NTU2NDIxMjIzNDE1NjY3NTg0NzY4NDA5NgZDZD"
}
```

---

#### Button Template

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "recipient": {
        "id": {{ig_scoped_id}}
    },
    "message": {
        "attachment": {
            "type": "template",
            "payload": {
  "template_type":"button",
  "text":"<MESSAGE_TEXT>",
  "buttons":[
    <BUTTON_OBJECT>, 
    <BUTTON_OBJECT>, 
    ...
  ]
}
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "recipient_id": "20802401916297",
    "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjEyNTAyNDAyNjQwOTMwOjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODE4NzUxOTk3OTcyODI5MjozMjM4NzQ4ODk0Njg5MDkwMzc2NTc5NDI0MzU4NjU1NTkwNAZDZD"
}
```

---

### Text Message

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "recipient": {
        "id": "{{ig_scoped_id}}"
    },
    "message": {
        "text": "Hello World!"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "Customer intake flow",
            "eligible_platforms": [
                "INSTAGRAM"
            ],
            "welcome_message_flow": "[{\"message\":{\"text\":\"Learn more about our summer sale!\",\"quick_replies\":[{\"title\":\"I am interested!\",\"content_type\":\"text\",\"payload\":\"summer-sale-interest\"},{\"title\":\"I have another quest...\",\"content_type\":\"text\",\"payload\":\"another-question\"}]}}]",
            "last_update_time": "2025-08-14T19:06:34+0000",
            "is_used_in_ad": false,
            "id": "<flow_id_1>"
        },
        {
            "name": "New customer welcome flow",
            "eligible_platforms": [
                "INSTAGRAM"
            ],
            "welcome_message_flow": "[{\"message\":{\"text\":\"Welcome to our community!\"}}]",
            "last_update_time": "2024-10-10T20:44:04+0000",
            "is_used_in_ad": false,
            "id": "<flow_id_2>"
        }
    ],
    "paging": {
        "cursors": {
            "before": "<before_cursor_hash>",
            "after": "<after_cursor_hash>"
        }
    }
}
```

---

### Media Message (Photo or GIF)

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message":{
    "attachment":{
      "type":"image", 
      "payload":{
        "url":"MEDIA_URL"        
      }
    }
  }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "recipient_id": "20802401916297",
    "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjEyNTAyNDAyNjQwOTMwOjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODE4NzUxOTk3OTcyODI5MjozMjM4NzQ2NjQ4NTM0NDQxNTQ2NDg4Mzg5ODkxOTQxOTkwNAZDZD"
}
```

---

### Media Message (Audio)

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message": {
    "attachment": {
      "type": "audio",
      "payload": {
        "url": "ACTUAL_AUDIO_FILE_URL"
      }
    }
  }
}
```

---

### Media Message (Video)

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message": {
    "attachment": {
      "type": "video",
      "payload": {
        "url": "ACTUAL_VIDEO_FILE_URL"
      }
    }
  }
}
```

---

### Send a Sticker

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message": {
    "attachment": {
      "type":"like_heart"
    }
  }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "flow_id": "1234567890"
}
```

---

### React or Unreact to a message

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "sender_action": "react",
  "payload": {
    "message_id": "MESSAGE_ID",
    "reaction": "love"
  }
}
```

---

### Quick replies

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id":"{{ig_scoped_id}}"
  },
  "messaging_type": "RESPONSE",
  "message":{
    "text": "<SOME_TEXT>",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"<TITLE_1>",
        "payload":"<POSTBACK_PAYLOAD_1>"
      },
      {
        "content_type":"text",
        "title":"<TITLE_2>",
        "payload":"<POSTBACK_PAYLOAD_2>"
      }
    ]
  }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "recipient_id": "48102409688037",
    "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjIzOTAyNDYxMzQ5Njk3OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODE5ODkyMDA5ODI1NTA2NjozMjMwNTg3OTAwODc0MjEzNzUyODg5MTk4MDY1OTAzMjA2NAZDZD"
}
```

---

### Private Replies

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "recipient": {"comment_id": {{comment_id}}},
    "message": {"text": "It is cool"}
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "recipient_id": "48102409688037",
    "message_id": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjIzOTAyNDYxMzQ5Njk3OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODE5ODkyMDA5ODI1NTA2NjozMjMwNTg4MTkxMDI4MjM4NTEyNzAwMjYyNTU5ODgxNjI1NgZDZD"
}
```

---

### Send a message with an uploaded asset

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message": {
      "attachment": {
        "type": "image",
        "payload": {
          "attachment_id": "{{attachment_id}}"
        }
      }
  }
}
```

---

### Send a Published Post

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
  "recipient":{
    "id": "{{ig_scoped_id}}"
  },
  "message": {
      "attachment": {
        "type": "MEDIA_SHARE",
        "payload": {
          "id": "{{post_id}}"
        }
      }
  }
}
```

---

### Send a message with HUMAN_AGENT tag

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messages`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "recipient": {
        "id": "{{ig_scoped_id}}"
    },
    "message": {
        "text": "Your doctor visit is scheduled"
    },
    "tag": "HUMAN_AGENT"
}
```

---

## Welcome Message Flows API

When creating ads that Click to Messenger or Click to Instagram Direct, you can connect a message flow from a messaging partner app. A message flow can include text, images, emoji, buttons, and other message types supported by the [Messenger Send API](https://developers.facebook.com/docs/messenger-platform/reference/send-api) or [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram).

### Before You Start

You will need:

- An access token requested by the IG professional account who can send message to a user on the platform
    
- The `instagram_business_manage_messages` permission
    

## Environment

This collection has a corresponding **Instagram Platform API** Postman [environment](https://learning.postman.com/docs/sending-requests/managing-environments/) which you must select when using the collection. Set **current values** for the variables defined in this environment if you wish to perform the queries in the collection.

### Access tokens

The API supports both user and system user access tokens. You can get access tokens 3 different ways:

- [Facebook login](https://developers.facebook.com/docs/facebook-login/overview) for your app
    
- [App Dashboard](https://developers.facebook.com/apps)
    
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
    

## What to do after setting up the Welcome Message Flows

## Ads Manager experience

Once welcome message flows have been successfully submitted over the API, they will show up in Ads Manager for messaging destinations within the Engagement and Sales objectives. The flows will show up in the Partner App option within the Message Template section of the Ad Creative.

### Example use

In the Message Template section of the Ad Creative, select Partner App.

<img src="https://content.pstmn.io/ece28905-cf9f-4e77-9f7e-ed26b7024425/aW1hZ2UucG5n" width="1224" height="1116">

Select the appropriate messaging Partner App.

<img src="https://content.pstmn.io/4c86fad3-30d7-4854-bf25-5e5daa4353f4/aW1hZ2UucG5n" alt="" height="1192" width="1218">

Select the Welcome Message Flow that you submitted via the API.

<img src="https://content.pstmn.io/22473018-baff-4086-ba4e-b321f96885b0/aW1hZ2UucG5n" alt="" height="1214" width="1224">

Preview your message flow.

<img src="https://content.pstmn.io/3eee8361-fd24-4bd5-9955-b719ab102d45/aW1hZ2UucG5n" alt="" height="1228" width="1218">

## Marketing API Experience

Once welcome message flows have been successfully submitted over the API, the flow ID can be used to configure ads through the marketing API.

In the ad creative, the flow ID can be set as follows:

```
{
  "name": "creative",
  "object_story_spec": {...},
  "asset_feed_spec": {
    "additional_data": {
      "partner_app_welcome_message_flow_id": "<FLOW_ID_RETURNED_FROM_POST_REQUEST>"
    }
  }
}

 ```

For more information about messaging ads, please refer to [Messaging Ads](https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads) in the Marketing API documentation.

### Get all flows

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/welcome_message_flows`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```text

```

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "Customer intake flow",
            "eligible_platforms": [
                "INSTAGRAM"
            ],
            "welcome_message_flow": "[{\"message\":{\"text\":\"Learn more about our summer sale!\",\"quick_replies\":[{\"title\":\"I am interested!\",\"content_type\":\"text\",\"payload\":\"summer-sale-interest\"},{\"title\":\"I have another quest...\",\"content_type\":\"text\",\"payload\":\"another-question\"}]}}]",
            "last_update_time": "2025-08-14T19:06:34+0000",
            "is_used_in_ad": false,
            "id": "<flow_id_1>"
        },
        {
            "name": "New customer welcome flow",
            "eligible_platforms": [
                "INSTAGRAM"
            ],
            "welcome_message_flow": "[{\"message\":{\"text\":\"Welcome to our community!\"}}]",
            "last_update_time": "2024-10-10T20:44:04+0000",
            "is_used_in_ad": false,
            "id": "<flow_id_2>"
        }
    ],
    "paging": {
        "cursors": {
            "before": "<before_cursor_hash>",
            "after": "<after_cursor_hash>"
        }
    }
}
```

---

### Get a specific flow

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/welcome_message_flows?flow_id={{flow_id}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `flow_id`: {{flow_id}}


**Request Body:**

```text

```

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "Customer intake flow - updated for Winter 2025",
            "eligible_platforms": [
                "INSTAGRAM"
            ],
            "welcome_message_flow": "[{\"message\":{\"text\":\"Learn more about our new winter sale!\",\"quick_replies\":[{\"title\":\"I am interested!\",\"content_type\":\"text\",\"payload\":\"winter-sale-interest\"},{\"title\":\"I have another quest...\",\"content_type\":\"text\",\"payload\":\"another-question\"}]}}]",
            "last_update_time": "2025-08-14T19:11:44+0000",
            "is_used_in_ad": false,
            "id": "<flow_id_1>"
        }
    ],
    "paging": {
        "cursors": {
            "before": "<before_cursor_hash>",
            "after": "<after_cursor_hash>"
        }
    }
}
```

---

### Create a new flow

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/welcome_message_flows`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "name": "Customer intake flow",
    "welcome_message_flow": [
        {
            "message": {
                "text": "Learn more about our summer sale!",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "I am interested!",
                        "payload": "summer-sale-interest"
                    },
                    {
                        "content_type": "text",
                        "title": "I have another question.",
                        "payload": "another-question"
                    }
                ]
            }
        }
    ],
    "eligible_platforms" : [
        "instagram"
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "flow_id": "1234567890"
}
```

---

### Update an existing flow

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/welcome_message_flows?flow_id={{flow_id}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `flow_id`: {{flow_id}}


**Request Body:**

```json
{
    "name": "Customer intake flow - updated for Winter 2025",
    "welcome_message_flow": [
        {
            "message": {
                "text": "Learn more about our new winter sale!",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "I am interested!",
                        "payload": "winter-sale-interest"
                    },
                    {
                        "content_type": "text",
                        "title": "I have another question.",
                        "payload": "another-question"
                    }
                ]
            }
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Delete an existing flow

**Method:** `DELETE`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/welcome_message_flows?flow_id={{flow_id}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `flow_id`: {{flow_id}}


**Request Body:**

```json

```

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

## Messenger Profile API

The Messenger Profile API provides endpoints to configure and manage key conversational features for Instagram Direct Messaging, including:

- **Icebreakers**: Predefined questions that appear at the start of a conversation to help guide users and automate common queries.
    
- **Persistent Menu**: An always-available menu in the chat interface, allowing users to access core actions or information at any time.
    

# Ice Breakers

| Ice Breakers provide a way for your app users to start a conversation with a business with a list of frequently asked questions. A maximum of 4 questions can be set via the Ice Breaker API.<br><br>This feature is currently not available on desktop.<br><br>## Requirements<br><br>This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.<br><br>You will need the following:<br><br>#### Access Level<br><br>- Advanced Access if your app serves Instagram professional accounts you don't own or manage<br>    <br>- Standard Access if your app serves Instagram professional accounts you own or manage and have added to your app in the App Dashboard<br>    <br><br>#### Access tokens<br><br>- An Instagram User access token requested from a person who can manage comments on the Instagram professional account<br>    <br><br>#### Base URL<br><br>All endpoints can be accessed via the `graph.instagram.com` host.<br><br>#### Endpoints<br><br>- [<code>GET /<your_app_users_your_app_users_ig_id>/messenger_profile</your_app_users_your_app_users_ig_id></code>](https://developers.facebook.com/docs/instagram-platform/reference/ig-user)<br>    <br>- [<code>POST /<your_app_users_your_app_users_ig_id>/messenger_profile</your_app_users_your_app_users_ig_id></code>](https://developers.facebook.com/docs/instagram-platform/reference/ig-user)<br>    <br>- [<code>DELETE /<your_app_users_your_app_users_ig_id>/messenger_profile</your_app_users_your_app_users_ig_id></code>](https://developers.facebook.com/docs/instagram-platform/reference/ig-user)<br>    <br><br>You can also use the `/me/messenger_profile` endpoints. | <img src="https://scontent-sjc3-1.xx.fbcdn.net/v/t39.2365-6/118818823_700834857168298_1003772079812652258_n.png?_nc_cat=110&amp;ccb=1-7&amp;_nc_sid=e280be&amp;_nc_ohc=ObmabLGm1VEQ7kNvwFH5yqf&amp;_nc_oc=AdnrM6hQEys0pXe7yojSsHY4TNyQu83x7DDGKZuM2xKZq0Mlv9-EFJpuMeUBXHqx1MLdcVVMAgPjrWeF2tKX2ciW&amp;_nc_zt=14&amp;_nc_ht=scontent-sjc3-1.xx&amp;_nc_gid=ZvY_9OyGKAIXzbtNKRq9cA&amp;oh=00_AfXk9GklFFx1koLNz1T76-lHp5m7V358eEUDm3fzwA-EAA&amp;oe=68CFFF5E" alt=""> |

#### IDs

- The ID for your app user's Instagram professional account
    

#### Permissions

- `instagram_business_basic`
    
- `instagram_business_manage_messages`
    

#### Webhook event subscriptions

- `messages`
    
- `messaging_postbacks`
    

---

# The Persistent Menu

| The Persistent Menu allows you to create a menu of the main features of your business, such as hours of operation, store locations, and products, that is always visible in a person's Instagram conversation with your business.<br><br>When a person clicks an item in the menu, a `postback` webhook notification is sent to your server, with information about what item was select and by whom, and the standard messaging window opens. You have 24 hours to respond to the person after the CTA. | <img src="https://scontent-sjc6-1.xx.fbcdn.net/v/t39.8562-6/274682791_507543544063430_8065749697228031629_n.png?_nc_cat=101&amp;ccb=1-7&amp;_nc_sid=f537c7&amp;_nc_ohc=bxEY4FtK5ygQ7kNvwGZx2KN&amp;_nc_oc=AdmSy93omRzuuEnbygk-pWRbKfVCwicXAvMxJlJfk2oCMiKy8lz7uD_gwfJUPFCuQjhz-2vIR4vywfUTna3o2jgv&amp;_nc_zt=14&amp;_nc_ht=scontent-sjc6-1.xx&amp;_nc_gid=f_kt9CAXEBZ41_e2fTOy_g&amp;oh=00_AfVedpCTrEZ78Mo0sSnq-MQClUElwjV8tUBD-7redOo9Zg&amp;oe=68BB9C8F" alt=""> |

## Before you start

This guide assumes you have set up your webhooks server to receive notifications and subscribed your app to Instagram `messages` and `messaging_postbacks` events.

You will need:

- The ID for the Instagram professional account (`IG_ID`)
    
- the Instagram-scoped ID (`IGSID`) for the person to whom you are sending the message
    

#### Host URL

`https://graph.instagram.com`

To view recent changes to the persistent menu within the Instagram app, go to the messages inbox and swipe down to refresh.

### Limitations

- A menu is not updated in real time
    
    - Existing conversations will not see an updated menu unless a person refreshes their inbox; new conversations will see updated menus. Be sure your app can handle deprecated menu items.
        
- The `composer_input_disabled` parameter is not available
    
- The `webview_height_ratio` parameter is not available
    
- You can not customize a menu based on the recipient's Instagram-scoped ID (IGSID)
    

### Button types

The persistent menu is composed of an array of buttons. The following button types are supported in the persistent menu:

#### URL Button

The URL Button opens a web page in the in-app browser. This allows you to enrich the conversation with a web-based experience, where you have the full development flexibility of the web. For example, you might display a product summary in-conversation, then use the URL button to open the full product page on your website.

#### Postback Button

The postback button sends a [<code>messaging_postbacks</code>](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks) event to your webhook with the string set in the `payload` property. This allows you to take arbitrary actions when the button is tapped. For example, you might display a list of products, then send the product ID in the postback to your webhook, where it can be used to query your database and return the product details as a structured message.

### Persistent Menu

#### Set Persistent Menu

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `persistent_menu`: [
        {
            "locale": "default",
            "call_to_actions": [
                {
                    "type": "postback",
                    "title": "Talk to an agent",
                    "payload": "CARE_HELP"
                },
                {
                    "type": "postback",
                    "title": "Outfit suggestions",
                    "payload": "CURATION"
                },
                {
                    "type": "web_url",
                    "title": "Shop now",
                    "url": "https://www.originalcoastclothing.com/"
                 
                }
            ],
        }
    ]


**Example Response:**

```json
{
    "result": "success"
}
```

---

#### Get Persistent Menu

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile?fields=persistent_menu`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `fields`: persistent_menu


**Example Response:**

```json
{
    "data": [
        {
            "persistent_menu": [
                {
                    "locale": "default",
                    "call_to_actions": [
                        {
                            "type": "postback",
                            "title": "Talk to an agent",
                            "payload": "CARE_HELP"
                        },
                        {
                            "type": "postback",
                            "title": "Outfit suggestions",
                            "payload": "CURATION"
                        },
                        {
                            "type": "web_url",
                            "title": "Shop now",
                            "url": "https://www.originalcoastclothing.com/"
                        }
                    ]
                }
            ]
        }
    ]
}
```

---

#### Delete Persistent Menu

**Method:** `DELETE`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile?fields=['persistent_menu']`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `fields`: ['persistent_menu']


**Example Response:**

```json
{
    "result": "success"
}
```

---

### Ice Breakers

#### Create Ice Breakers

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `platform`: instagram

- `ice_breakers`: [
    {
      "question": "What is your favorite sport?",
      "payload": "<PAYLOAD_FOR_QUESTION_1>"
    },
    {
      "question": "What is the capital of USA?",
      "payload": "<PAYLOAD_FOR_QUESTION_2>"
    }
  ] - This is a required param


**Example Response:**

```json
{
    "result": "success"
}
```

---

#### Get Ice Breakers

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile?fields=ice_breakers`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `fields`: ice_breakers


**Example Response:**

```json
{
   "data": [
        {
          "call_to_actions" : [
               {
                "question": "<QUESTION_1>",
                "payload": "<PAYLOAD_1>",
             
               },
               {
                "question": "<QUESTION_2>",
                "payload": "<PAYLOAD_2>",
             
               },
          ],
          "locale": "<LOCALE_1>",
      },
      {
          "call_to_actions" : [
               {
                "question": "<QUESTION_3>",
                "payload": "<PAYLOAD_3>",
             
               },
               {
                "question": "<QUESTION_4>",
                "payload": "<PAYLOAD_4>",
             
               },
          ],
          "locale": "<LOCALE_2>",
      }
   ]
}
```

---

#### Delete Ice Breakers

**Method:** `DELETE`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/messenger_profile?fields=['ice_breakers']`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `fields`: ['ice_breakers']


**Example Response:**

```json
{
    "result": "success"
}
```

---

## Instagram User Profile API

The User Profile API allows your app to get an Instagram user's profile information using the user's Instagram-scoped ID received from an Instagram messaging webhook notification. Your app can use this information to create a personalized messaging experience for Instagram users who are interacting with your app users.

## User Consent

**User consent is required to access an Instagram user's profile.**

User consent is set only when an Instagram user sends a message to your app user, or clicks an icebreaker or persistent menu. If an Instagram user comments on a post or comment but has not sent a message to your app user, and your app tries to send the Instagram user a message, your app will receive an error, **User consent is required to access user profile.**

## Requirements

This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.

You will need the following:

#### Access Level

- Advanced Access if your app serves Instagram professional accounts you don't own or manage
    
- Standard Access if your app serves Instagram professional accounts you own or manage and have added to your app in the App Dashboard
    

#### Access tokens

- An Instagram user access token requested from your app user who received the webhook notification and who can manage messages on the Instagram professional account
    

#### Base URL

All endpoints can be accessed via the `graph.instagram.com` host.

#### Endpoints

- `/`
    

#### IDs

- The Instagram-scoped ID () for the Instagram user interested in your app user; [received from a webhook notification](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/user-profile#webhook-notification)
    

#### Permissions

- `instagram_business_basic`
    
- `instagram_business_manage_messages`
    

#### Webhook event subscriptions

- `messages`
    
- `messaging_optins`
    
- `messaging_postbacks`
    
- `messaging_referral`
    

### Limitations

- If the Instagram user has blocked your app user, your app will not be able to view the Instagram user's information.
    

## Webhook notification

In order to get profile information for an Instagram user who has messaged your app user's Instagram professional account, you need the Instagram-scoped ID for the Instagram user that was sent in a message notification, the value of the `messages.sender.id` property.

```
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_IG_ID>",  // Your app user&#x27;s Instagram Professional account ID
      "time": <UNIX_TIMESTAMP>,
      "messaging": [
        {
          "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },    // Instagram-scoped ID for the Instagram user who sent the message
...  

 ```

## Get profile information

To get an the Instagram user's profile information, send a `GET` request to the `/` endpoint, where is the Instagram-scoped ID received in a messaging webhook notification, with the `fields` parameter set to a comma separated list of information you would like to view.

#### Sample Request

_Formatted for readability._

```
curl -X GET "https://graph.instagram.com/v23.0/<INSTAGRAM_SCOPED_ID> \
  ?fields=name,username,profile_pic,follower_count,is_user_follow_business,is_business_follow_user \
  &access_token=<INSTAGRAM_ACCESS_TOKEN>"

 ```

On success, your app will receive the following JSON response:

```
{
  "name": "Peter Chang",
  "username": "peter_chang_live",
  "profile_pic": "https://fbcdn-profile-...",
  "follower_count": 1234
  "is_user_follow_business": false,
  "is_business_follow_user": true,
}

 ```

## Reference

| Field Name | Description |
| --- | --- |
| `access_token`  <br>  <br>_string_ | The Instagram user access token from your app user who can manage messages on the Instagram professional account who received the webhook notification |
| `follower_count`  <br>  <br>_int_ | The number of followers the Instagram user has |
| _int_ | The Instagram-scoped ID returned in a webhook notification that represents the Instagram user who interacted with your app user's Instagram professional account and triggered the notification |
| `is_business_follow_user`  <br>  <br>_boolean_ | Indicates whether your app user follows the Instagram user (`true`) or not (`false`) |
| `is_user_follow_business`  <br>  <br>_boolean_ | Indicates whether the Instagram user follows your app user (`true`) or not (`false`) |
| `is_verified_user`  <br>  <br>_boolean_ | Indicates whether the Instagram user has a verified Instagram account (`true`) or not (`false`) |
| `name`  <br>  <br>_string_ | The Instagram user's name (can be null if name not set) |
| `profile_pic`  <br>  <br>_url_ | The URL for the Instagram user's profile picture (can be null if profile pic not set). The URL will expire in a few days |
| `username`  <br>  <br>_string_ | The Instagram user's username |

### Get User Profile Info

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_scoped_id}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_scoped_id`: Variable path parameter


**Example Response:**

Status: `200 OK`

```json
{
    "name": "Stories Store",
    "username": "stories.in.store",
    "profile_pic": "https://scontent-iad3-2.cdninstagram.com/v/t51.2885-19/449445260_501305562464505_1905785811469754437_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=105&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=KE3yLoZOgTAQ7kNvwEyKOHi&_nc_oc=AdntpL0ve4nNdyrs3LASXp548mCjL-c1zl8cQzERfaoHJiIKaJ4ZJqPlOyWYiWW06u0&_nc_zt=24&_nc_ht=scontent-iad3-2.cdninstagram.com&oh=00_AfYpbRzhNfCHsUR3ye6V0pk2l1KDkx-RZpnablClozdlMQ&oe=68BDB031",
    "is_verified_user": false,
    "follower_count": 1,
    "is_user_follow_business": false,
    "is_business_follow_user": false,
    "id": "819898670256713"
}
```

---

## Attachment Upload API

The Attachment Upload API allows you to upload assets that can be sent in messages at a later time. This allows you to avoid the need to upload commonly used files multiple times. The API supports saving assets from a URL and from your local file system.

### Attachment Upload(Photo)

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/message_attachments`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "message": {
        "attachment": {
            "type": "image",
            "payload": {
                "url": "<PATH_TO_ASSET>",
                "is_reusable": "<IS_REUSABLE?>"
            }
        }
    }
}
```

**Example Response:**

---

## Conversations API

The Conversations API helps you get information about conversations between your app user and an Instagram user interested in your app user's Instagram media. You can get:

- A list of conversations for your app user's Instagram professional account
    
- A list of messages within each conversation
    
- Details about each message including when the message was sent and from who
    

## Requirements

This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.

You will need the following:

#### Access Level

- Advanced Access if your app serves Instagram professional accounts you don't own or manage
    
- Standard Access if your app serves Instagram professional accounts you own or manage and have added to your app in the App Dashboard
    

#### Access tokens

- An Instagram User access token requested from a person who can manage messages on the Instagram professional account
    

#### Base URL

All endpoints can be accessed via the `graph.instagram.com` host.

#### Endpoints

- `//conversations` or `/me/conversations`
    

#### IDs

- The ID for the Instagram professional account ()
    
- The Instagram-scoped ID for the Instagram user in the conversation
    

#### Permissions

- `instagram_business_basic`
    
- `instagram_business_manage_messages`
    

### Limitations

- Only the image or video URL for a share will be included in the data returned in a call to the API or in the webhooks notification.
    
- Conversations that are within the Requests folder that have not been active for 30 days will not be returned in API calls.

### Get a List of Conversations

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/conversations?platform=instagram`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `platform`: instagram


**Request Body:**

```text

```

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "id": "converasationID1",
            "updated_time": "2025-07-28T22:44:49+0000"
        },
        {
            "id": "converasationID2",
            "updated_time": "2025-07-18T18:24:04+0000"
        },
        {
            "id": "converasationID3",
            "updated_time": "2025-06-27T23:25:09+0000"
        },
        {
            "id": "converasationID4",
            "updated_time": "2025-05-02T17:46:11+0000"
        },
        {
            "id": "converasationID5",
            "updated_time": "2025-05-02T06:49:56+0000"
        },
        {
            "id": "converasationID6",
            "updated_time": "2024-10-02T04:21:49+0000"
        },
    ],
    "paging": {
        "cursors": {
            "after": "afterCursorInformation"
        },
        "next": "next_url"
    }
}
```

---

### Find a conversation with a specific person

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/conversations?user_id={{igsid}}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `user_id`: {{igsid}}


**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "id": "conversationID1",
            "updated_time": "2025-07-28T22:44:49+0000"
        }
    ]
}
```

---

### Get a List of Messages in a Conversation

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{conversation_id}}?fields=messages{from,to}`

**Path Parameters:**

- `api_version`: Variable path parameter

- `conversation_id`: Variable path parameter


**Query Parameters:**

- `fields`: messages{from,to}


**Example Response:**

Status: `200 OK`

```json
{
    "messages": {
        "data": [
            {
                "id": "messageID1",
                "created_time": "2025-07-28T22:44:49+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID2",
                "created_time": "2025-07-28T21:20:58+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID3",
                "created_time": "2025-07-28T21:20:13+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID4",
                "created_time": "2025-07-28T21:19:26+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID5",
                "created_time": "2025-02-18T18:46:37+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID6",
                "created_time": "2025-02-18T16:46:14+0000",
                "is_unsupported": false
            },
            {
                "id": "messageID7",
                "created_time": "2025-02-18T16:46:01+0000",
                "is_unsupported": false
            },
        ],
        "paging": {
            "cursors": {
                "after": "afterCursorInformation"
            },
            "next": "next_url"
        }
    },
    "id": "converasationID1"
}
```

---

### Get information about a message

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/v23.0/{{message_id}}?fields=id,created_time,from,to,message`

**Path Parameters:**

- `message_id`: Variable path parameter


**Query Parameters:**

- `fields`: id,created_time,from,to,message


**Request Body:**

Form Data:


**Example Response:**

Status: `200 OK`

```json
{
    "id": "messageID1",
    "created_time": "2025-07-28T22:44:49+0000",
    "from": {
        "username": "username_of_sender",
        "id": "id/igsid_of_sender"
    },
    "to": {
        "data": [
            {
                "username": "username_of_recipient",
                "id": "id/igsid_of_recipient"
            }
        ]
    },
    "message": "hi"
}
```

---

## Publish Content

This guide shows you how to publish single images, videos, reels (single media posts), or posts containing multiple images and videos (carousel posts) on Instagram professional accounts using the Instagram Platform.

## Requirements

This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.

#### Media on a public server

We cURL media used in publishing attempts, so the media must be hosted on a publicly accessible server at the time of the attempt.

You will need the following:

|  |  |
| --- | --- |
| **Access Levels** | \- Advanced Access  <br>  <br>\- Standard Access |
| **Access Tokens** | \- Instagram User access token |
| **Host URL** | `graph.instagram.com` |
| **Login Type** | Business Login for Instagram |
| [<b>Permissions</b>](https://developers.facebook.com/docs/permissions/reference#i) | \- `instagram_business_basic`  <br>  <br>\- `instagram_business_content_publish` |
| **Webhooks** | \- |

#### Endpoints

- [<code>/media</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-user/media#creating) — Create media container and upload the media
    
    - `upload_type=resumable` — Create a resumbable upload session to upload large videos from an area with frequent network interruptions or other transmission failures. Only for apps that have implemented Facebook Login for Business.
        
- [<code>/media_publish</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-user/media_publish#creating) — publish uploaded media using their media containers.
    
- [<code>/?fields=status_code</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-container#reading) — check media container publishing eligibility and status.
    
- [<code>/content_publishing_limit</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-user/content_publishing_limit) — check app user's current publishing rate limit usage.
    
- `POST https://rupload.facebook.com/ig-api-upload/` — Upload the video to Meta servers
    
- `GET /?fields=status_code` — Check publishing eligibility and status of the video
    

#### HTML URL encoding troubleshooting

- Some of the parameters are supported in list/dict format.
    
- Some characters need to be encoded into a format that can be transmitted over the Internet. For example: `user_tags=[{username:’ig_user_name’}]` is encoded to `user_tags=[{username:ig_user_name}]` where `[` is encoded to `[` and `{` is encoded to `{`. For more conversions, please refer to the HTML URL Encoding standard.
    

### Limitations

- JPEG is the only image format supported. Extended JPEG formats such as MPO and JPS are not supported.
    
- Shopping tags are not supported.
    
- Branded content tags are not supported.
    
- Filters are not supported.
    

For additional limitations, see each endpoint's reference.

#### Rate Limit

Instagram accounts are limited to 100 API-published posts within a 24-hour moving period. Carousels count as a single post. This limit is enforced on the `POST //media_publish` endpoint when attempting to publish a media container. We recommend that your app also enforce the publishing rate limit, especially if your app allows app users to schedule posts to be published in the future.

To check an Instagram professional account's current rate limit usage, query the `GET /content_publishing_limit` endpoint.

## Troubleshooting

If you are able to create a container for a video but the `POST /media_publish` endpoint does not return the published media ID, you can get the container's publishing status by querying the `GET /?fields=status_code` endpoint. This endpoint will return one of the following:

- `EXPIRED` — The container was not published within 24 hours and has expired.
    
- `ERROR` — The container failed to complete the publishing process.
    
- `FINISHED` — The container and its media object are ready to be published.
    
- `IN_PROGRESS` — The container is still in the publishing process.
    
- `PUBLISHED` — The container's media object has been published.
    

We recommend querying a container's status once per minute, for no more than 5 minutes.

## Errors

See the [Error Codes](https://developers.facebook.com/docs/instagram-api/reference/error-codes) reference.

## Next Steps

Now that you have published to an Instagram professional account, learn how to [moderate comments on your media](https://developers.facebook.com/docs/instagram/platform/instagram-api/comment-moderation).

### Create an image container

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/media`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `image_url`: https://media.istockphoto.com/id/2167996762/photo/flamingos-on-lake.jpg?s=1024x1024&w=is&k=20&c=SwMgbR6f0EZ8HiyCn46kYOWzXDoWY11QbRByAh4XRPE=



**Example Response:**

Status: `200 OK`

```json
{
    "id": "<IG_CONTAINER_ID>"
}
```

---

### Create a video container

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/media`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `video_url`: https://media.istockphoto.com/id/2154918234/video/aerial-view-of-powerful-blue-wave-crashing-onto-shallow-reef-in-the-ocean-with-a-strong.mp4?s=mp4-640x640-is&k=20&c=j1oH-HpR2kFwBfvV-5v105GTz3icU5r8V37VCSbZ77k=

- `media_type`: STORIES

- `upload_type`: resumable


**Example Response:**

Status: `200 OK`

```json
{
    "id": "<IG_CONTAINER_ID>"
}
```

---

### Create a carousel container

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/media`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `caption`: New Carousel!

- `media_type`: CAROUSEL

- `children`: {{ig_container_id_1}}, {{ig_container_id_2}}


**Example Response:**

Status: `200 OK`

```json
{
    "id": "<IG_CAROUSEL_CONTAINER_ID>"
}
```

---

### Publish the container

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/media_publish`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `creation_id`: {{ig_container_id}}


**Example Response:**

Status: `200 OK`

```json
{
    "id": "<IG_MEDIA_ID>"
}
```

---

### Publish the container (Reels)

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/media_publish`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

Form Data:

- `creation_id`: {{ig_container_id}}


**Example Response:**

Status: `200 OK`

```json
{
    "id": "<IG_MEDIA_ID>"
}
```

---

## Webhooks

The steps required to receive webhook notifications are as follows:

- Subscribe your app to webhook fields – Occurs in the Meta App Dashboard
    
- Enable your app to receive webhook notification for app user's Instagram professional account via an API call to Meta
    

[View complete documentation](https://developers.facebook.com/docs/instagram-platform/webhooks)

### Subscribe App to Pro Account's webhooks

# Subscribe to a Instagram professional account

Your app must enable subscriptions by sending a `POST` request to the `/{{ig_user_id}}/subscribed_apps` endpoint with the `subscribed_fields` parameter set to a comma-separated list of webhooks fields.

For more information about subscribing to a WhatsApp Business Account, see [Subscribe to webhooks](https://developers.facebook.com/docs/instagram-platform/webhooks#enable-subscriptions)

[View complete documentation](https://developers.facebook.com/docs/instagram-platform/webhooks)

#### Subscribe to webhooks

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/subscribed_apps`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Request Body:**

```json
{
    "subscribed_fields": [
        "messages",
        "messaging_postbacks",
        "messaging_seen",
        "messaging_handover",
        "messaging_referral",
        "message_reactions",
        "standby",
        "comments",
        "live_comments",
        "mentions",
        "story_insights"
      ]
}
```

---

### Get All Pro Account's webhooks subscribed by App

# Get All Subscriptions for a Instagram professional account

Your app can get webhook feild subscriptions for an Instagram professional account by sending a `GET` request to the `/{{ig_user_id}}/subscribed_apps` endpoint

[View complete documentation](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api?entity=request-13382743-ad675e61-a4b4-4a5e-a7e7-7e8ed3d4af7d)[](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api?entity=request-13382743-ed780f51-d6e8-43e1-a2e5-13a6cdbfbb80)

#### Get subscribed webhook fields

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/subscribed_apps`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


---

### Delete App's Pro account webhook subscription

# Delete Subscriptions for a Instagram professional account

Your app can delete webhook feild subscriptions for an Instagram professional account by sending a `DELETE` request to the `/{{ig_user_id}}/subscribed_apps` endpoint

Be cautious using the API as it will stop webhook notifications to your App for the Instagram professional account

[View complete documentation](https://developers.facebook.com/docs/instagram-platform/webhooks)

#### Delete webhook subscription

**Method:** `DELETE`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/subscribed_apps`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


---

### Webhook payload reference

# Instagram Platform Webhook Notification Examples

This guide contains example JSON payloads for Instagram webhook notifications sent from Meta when a webhook field has been triggered. Syntax returned in notifications vary slightly depending on log in type implemented in your app and triggering event.

[View complete documentation](https://developers.facebook.com/docs/instagram-platform/webhooks/examples)

#### Self webhook

# Self Messaging

Self messaging enables a single Instagram Professional account to act as both a **business** and an **Instagram user**, eliminating the need for two separate accounts when testing message previews or automation. This helps showcase messaging automation previews to your newly onboarded business users.

Since the business is messaging itself, the **24-hour response window** does **not apply to send self message using API** (IG pro account has to message itself atleast once in the Instagram app first)

[View complete documentation](https://developers.facebook.com/docs/instagram-platform/self-messaging)

##### Self messaging echo webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_IG_USER_ID>",
      "time": "<TIME_META_SENT_THIS_NOTIFICATION>",
      "messaging": [
        {
          "sender": { "id": "<YOUR_APP_USERS_IG_USER_ID>" },
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_SCOPED_ID>" }, 
          "timestamp": "<TIME_META_SENT_THIS_NOTIFICATION>",
          "message": {
            "mid": "<MESSAGE_ID>",
            "text": "<MESSAGE_TEXT>",
            "is_echo": true,
            "is_self": true
          }
        }
      ]
    }
  ]
}
```

---

##### Self postback webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "45202218377435",
      "time": 1743480368963,
      "messaging": [
        {
          "sender": { "id": "<YOUR_APP_USERS_IG_USER_ID>" },
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_SCOPED_ID>" }, 
          "timestamp": 1743480368714,
          "is_self": true,
          "postback": {
            "title": "Start Chatting",
            "payload": "DEVELOPER_DEFINED_PAYLOAD",
            "mid": "<MESSAGE_ID>"
          }
        }
      ]
    }
  ]
}
```

---

##### Self comment webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

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
            "from": {
              "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
              "username": "<INSTAGRAM_USER_USERNAME>",
              "self_ig_scoped_id": "<YOUR_APP_USERS_INSTAGRAM_SCOPED_ID>"
            },
            "id": "<COMMENT_ID>",
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

---

#### Comment webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
            "time": "<TIME_META_SENT_THIS_NOTIFICATION>",
            "field": "comments",
            "value": {
                "id": "<COMMENT_ID>",
                "from": {
                    "username": "<USERNAME>"
                },
                "text": "<COMMENT_TEXT>",
                "media": {
                    "id": "<MEDIA_ID>",
                    "media_product_type": "<MEDIA_PRODUCT_TYPE>"
                }
            }
        }
    ]
}
```

---

#### Messaging webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object":"instagram",
    "entry":[
      {
        "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
        "time":"<TIME_NOTIFICATION_WAS_SENT>",
        "messaging":[
          {
            "sender":{ "id":"<SENDER_ID>" },
            "recipient":{ "id":"<RECIPIENT_ID>" },
            "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
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

---

#### Messaging reactions webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object":"instagram",
    "entry":[
      {
        "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
        "time":"<TIME_NOTIFICATION_WAS_SENT>",
        "messaging":[
          {
            "sender":{ "id":"<INSTAGRAM_SCOPED_ID>" },
            "recipient":{ "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },
            "timestamp":"<TIME_WEBHOOK_WAS_TRIGGERED>",
            "reaction" :{
              "mid" : "<MESSAGE_ID>",
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

---

#### Messaging postbacks webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
            "time": "<TIME_NOTIFICATION_WAS_SENT>",
            "messaging": [
                {
                    "sender": {
                        "id": "<INSTAGRAM_SCOPED_ID>"
                    },
                    "recipient": {
                        "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"
                    },
                    "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
                    "postback": {
                        "mid": "<MESSAGE_ID>",
                        "title": "<USER_SELECTED_ICEBREAKER_OPTION_OR_CTA_BUTTON>",
                        "payload": "<OPTION_OR_BUTTON_PAYLOAD>"
                    }
                }
            ]
        }
    ]
}

```

---

#### Messaging seen webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
            "time": "<TIME_NOTIFICATION_WAS_SENT>",
            "messaging": [
                {
                    "sender": {
                        "id": "<INSTAGRAM_SCOPED_ID>"
                    },
                    "recipient": {
                        "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"
                    },
                    "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
                    "read": {
                        "mid": "<MESSAGE_ID>"
                    }
                }
            ]
        }
    ]
}

```

---

#### Message edit webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
            "time": "<TIME_NOTIFICATION_WAS_SENT>",
            "messaging": [
                {
                    "sender": {
                        "id": "<INSTAGRAM_SCOPED_ID>"
                    },
                    "recipient": {
                        "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"
                    },
                    "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
                    "message_edit": {
                        "mid": "<MESSAGE_ID>",
                        "text": "<USER_EDITED_MESSAGE>",
                        "num_edit": "<NUMBER_OF_TIMES_MESSAGE_IS_EDITED>"
                    }
                }
            ]
        }
    ]
}

```

---

#### Messaging reply to story webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
            "time": "<TIME_NOTIFICATION_WAS_SENT>",
            "messaging": [
                {
                    "sender": {
                        "id": "<SENDER_ID>"
                    },
                    "recipient": {
                        "id": "<RECIPIENT_ID>"
                    },
                    "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
                    "message": {
                        "mid": "<MESSAGE_ID>",
                        "is_deleted": true,
                        "is_echo": true,
                        "is_self": false,
                        "is_unsupported": true,
                        "reply_to": {
                            "story": {
                                "url": "<CDN_URL_FOR_THE_STORY>",
                                "id": "<STORY_ID>"
                            }
                        },
                        "text": "<MESSAGE_TEXT>"
                    }
                }
            ]
        }
    ]
}

```

---

#### Messaging referral webhook

**Method:** `VIEW`

**Endpoint:** `https:///`

**Request Body:**

```json
{
    "object": "instagram",
    "entry": [
        {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
            "time": "<TIME_NOTIFICATION_WAS_SENT>",
            "messaging": [
                {
                    "sender": {
                        "id": "<INSTAGRAM_SCOPED_ID>"
                    },
                    "recipient": {
                        "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"
                    },
                    "timestamp": "<TIME_WEBHOOK_WAS_TRIGGERED>",
                    "referral": {
                        "ref": "<IGME_LINK_REF_PARAMETER_VALUE>",
                        "source": "<IGME_SOURCE_LINK>",
                        "type": "OPEN_THREAD"
                    }
                }
            ]
        }
    ]
}

```

---

## Insights

# Insights

This guide shows you how to get insights for your app users' Instagram media and professional accounts using the Instagram Platform.

In this guide we will be using **Instagram user** and **Instagram professional account** interchangeably. An Instagram User object represents your app user's Instagram professional account.

## Before you start

You will need the following:

### Requirements

This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.

|  | Instagram API with Instagram Login | Instagram API with Facebook Login |
| --- | --- | --- |
| **Access Tokens** | \- Instagram User access token | \- [Facebook User access token](https://developers.facebook.com/docs/facebook-login/access-tokens/#usertokens) |
| **Host URL** | `graph.instagram.com` | `graph.facebook.com` |
| **Login Type** | Business Login for Instagram | Facebook Login for Business |
| [<b>Permissions</b>](https://developers.facebook.com/docs/permissions/reference#i) | \- `instagram_business_basic`  <br>  <br>\- `instagram_business_manage_insights` | \- `instagram_basic`  <br>  <br>\- `instagram_manage_insights`  <br>  <br>\- `pages_read_engagement`  <br>  <br>  <br>If the app user was granted a role on the [Page](https://developers.facebook.com/docs/instagram-api/overview#pages) connected to your app user's Instagram professional account via the Business Manager, your app will also need:  <br>  <br>\- `ads_management`  <br>  <br>\- `ads_read` |

#### Access Level

- Advanced Access if your app serves Instagram professional accounts you don't own or manage
    
- Standard Access if your app serves Instagram professional accounts you own or manage and have added to your app in the App Dashboard
    

#### Endpoints

- [<code>GET /insights</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-media/insights) — Gets metrics on a media object
    
- [<code>GET /insights</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights) — Gets metrics on an Instagram Business Account or Instagram Creator account.
    

Refer to each endpoint's reference documentation for additional metrics, parameters, and permission requirements.

#### UTC

Timestamps in API responses use UTC with zero offset and are formatted using ISO-8601. For example: `2019-04-05T07:56:32+0000`

#### Webhook event subscriptions

### Limitations

#### Media insights

- Fields that return aggregated values don't include ads-driven data. For example, `comments_count` returns the number of comments on a photo, but not comments on ads that contain that photo.
    
- Captions don't include the `@` symbol unless the app user is also able to perform admin-equivalent [tasks](https://developers.facebook.com/docs/pages/overview#tasks) on the app.
    
- Some fields, such as `permalink`, cannot be used on photos within albums (children).
    
- Live video Instagram Media can only be read while they are being broadcast.
    
- This API returns only data for media owned by Instagram professional accounts. It can not be used to get data for media owned by personal Instagram accounts.
    

#### Account insights

- Some metrics are not available on Instagram accounts with fewer than 100 followers.
    
- User Metrics data is stored for up to 90 days.
    
- You can only get insights for a single user at a time.
    
- You cannot get insights for Facebook Pages.
    
- If insights data you are requesting does not exist or is currently unavailable the API will return an empty data set instead of `0` for individual metrics.
    

## Next Steps

Visit the API Reference to see all available metrics for [Instagram business and creator accounts](https://developers.facebook.com/docs/instagram-api/reference/ig-user) and their [Instagram Media](https://developers.facebook.com/docs/instagram-api/reference/ig-media) objects.

### Instagram Account Insights

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_user_id}}/insights?metric=reach,profile_views&period=day`

**Path Parameters:**

- `api_version`: Variable path parameter

- `ig_user_id`: Variable path parameter


**Query Parameters:**

- `metric`: reach,profile_views - Metric - reach, follower_count, website_clicks, profile_views, online_followers, accounts_engaged, total_interactions, likes, comments, shares, saves, replies, engaged_audience_demographics, reached_audience_demographics, follower_demographics, follows_and_unfollows, profile_links_taps, views, threads_likes, threads_replies, reposts, quotes, threads_followers, threads_follower_demographics, content_views, threads_views, threads_clicks, threads_reposts

- `period`: day - Time period - day, week, days_28, month, lifetime, total_over_range


**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "reach",
            "period": "day",
            "values": [
                {
                    "value": 0,
                    "end_time": "2025-12-09T08:00:00+0000"
                },
                {
                    "value": 0,
                    "end_time": "2025-12-10T08:00:00+0000"
                }
            ],
            "title": "Reach",
            "description": "Total number of times the Business Account's media objects have been uniquely viewed",
            "id": "INSTAGRAM_USER_ID/insights/reach/day"
        }
    ]
}
```

---

### Media Insights

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_media_id}}/insights?metric=shares,comments`

**Path Parameters:**

- `ig_media_id`: Variable path parameter

- `api_version`: Variable path parameter


**Query Parameters:**

- `metric`: shares,comments - Metric - impressions, shares, comments, plays, likes, saved, replies, total_interactions, navigation, follows, profile_visits, profile_activity, reach, ig_reels_video_view_total_time, ig_reels_avg_watch_time, clips_replays_count, ig_reels_aggregated_all_plays_count, views, thread_replies, reposts, quotes, thread_shares, content_views, threads_views, threads_media_clicks, reels_skip_rate, threads_reposts, facebook_views, crossposted_views


**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "shares",
            "period": "lifetime",
            "values": [
                {
                    "value": 0
                }
            ],
            "title": "Shares",
            "description": "The number of shares of your reel.",
            "id": "INSTAGRAM_MEDIA_ID/insights/shares/lifetime"
        },
        {
            "name": "comments",
            "period": "lifetime",
            "values": [
                {
                    "value": 0
                }
            ],
            "title": "Comments",
            "description": "The number of comments on your reel.",
            "id": "INSTAGRAM_MEDIA_ID/insights/comments/lifetime"
        }
    ]
}
```

---

## Comment Moderation

# Comment Moderation

This guide shows you how to get comments, reply to comments, delete comments, hide/unhide comments, and disable/enable comments on Instagram Media owned by your app users using the Instagram Platform.

In this guide we will be using **Instagram user** and **Instagram professional account** interchangeably. An Instagram User object represents your app user's Instagram professional account.

## Requirements

This guide assumes you have read the [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview) and implemented the needed components for using this API, such as a Meta login flow and a webhooks server to receive notifications.

You will need the following:

ou will need the following:

|  | Instagram API with Instagram Login | Instagram API with Facebook Login |
| --- | --- | --- |
| **Access Levels** | \- Advanced Access  <br>  <br>\- Standard Access | \- Advanced Access  <br>  <br>\- Standard Access |
| **Access Tokens** | \- Instagram User access token | \- Facebook Page access token |
| **Host URL** | `graph.instagram.com` | `graph.facebook.com` |
| **Login Type** | Business Login for Instagram | Facebook Login for Business |
| [<b>Permissions</b>](https://developers.facebook.com/docs/permissions/reference#i) | \- `instagram_business_basic`  <br>  <br>\- `instagram_business_manage_comments` | \- `instagram_basic`  <br>  <br>\- `instagram_manage_comments`  <br>  <br>\- `pages_read_engagement`  <br>  <br>  <br>If the app user was granted a role on the [Page](https://developers.facebook.com/docs/instagram-api/overview#pages) connected to your app user's Instagram professional account via the Business Manager, your app will also need:  <br>  <br>\- `ads_management`  <br>  <br>\- `ads_read` |
| **Webhooks** | \- `comments`  <br>  <br>\- `live_comments` | \- `comments`  <br>  <br>\- `live_comments` |

#### Access Level

- Advanced Access if your app serves Instagram professional accounts you don't own or manage
    
- Standard Access if your app serves Instagram professional accounts you own or manage and have added to your app in the App Dashboard
    

#### Endpoints

- [<code>GET /comments</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-media/comments#reading) — Get comments on an IG Media
    
- [<code>GET /replies</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-comment/replies#read) — Get replies on an IG Comment
    
- [<code>POST /replies</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-comment/replies#create) — Reply to an IG Comment
    
- [<code>POST /</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-comment#update) — Hide/unhide an IG Comment
    
- [<code>POST /</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-media#update) — Disable/enable comments on an IG Media
    
- [<code>DELETE /</code>](https://developers.facebook.com/docs/instagram-api/reference/ig-comment#delete) — Delete an IG Comment
    

## Next steps

Learn how to send a message to the person who commented on your app user's media post using [Private Replies](https://developers.facebook.com/docs/instagram/messaging-api/private-replies).

### Get Comments

**Method:** `GET`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_media_id}}/comments?fields=from,text`

**Path Parameters:**

- `ig_media_id`: Variable path parameter

- `api_version`: Variable path parameter


**Query Parameters:**

- `fields`: from,text


**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "from": {
                "id": "1234567890",
                "username": "commenter_username"
            },
            "text": "so cool!",
            "id": "1234567890" // comment ID
        }
    ],
    "paging": {
        "cursors": {
            "before": "QVFIUz...",
            "after": "QVFIUz..."
        }
    }
}
```

---

### Reply to a comment

**Method:** `POST`

**Endpoint:** `https://graph.instagram.com/{{api_version}}/{{ig_comment_id}}/replies`

**Path Parameters:**

- `ig_comment_id`: Variable path parameter

- `api_version`: Variable path parameter


**Request Body:**

```json
{
    "message": "Thanks for your comment!"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "18006022967821076"
}
```

---
