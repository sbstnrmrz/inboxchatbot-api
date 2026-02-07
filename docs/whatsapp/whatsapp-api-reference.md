# WhatsApp Cloud API Reference

[WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api), hosted by Meta, is the official WhatsApp Business Platform API used for business messaging. This collection contains common queries, sample responses, and links to supporting documentation that can help you quickly get started with the API.

## **Cloud API Overview**

Cloud API allows medium and large businesses to communicate with customers at scale. Using the API, businesses can build systems that connect thousands of customers with agents or bots, enabling both programmatic and manual communication. Additionally, businesses can integrate the API with numerous backend systems, such as CRM and marketing platforms.

[https://developers.facebook.com/docs/whatsapp/cloud-api/overview](https://developers.facebook.com/docs/whatsapp/cloud-api/overview)

## Getting Started with Cloud API

To use the API and this collection you must have a Meta business portfolio, a WhatsApp Business Account, and a business phone number. If you complete the steps in the Cloud API [Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) guide, these assets will be created for you.

## Get Started as a Solution Partner

[This guide](https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-solution-partners) goes over the steps Solution Partners need to take in order to offer the Cloud API to their customers.

## Migrating from On-Premises API to Cloud API

[This guide explains how to migrate](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/migrating-from-onprem-to-cloud) business phone numbers from On-Premises API to Cloud API.

## Environment

This collection has a corresponding WhatsApp Cloud API Postman [environment](https://learning.postman.com/docs/sending-requests/managing-environments/) which you must select when using the collection. Set **current values** for the variables defined in this environment if you wish to use the collection to perform queries.

You can find most of these values in the [WhatsApp Manager](https://business.facebook.com/wa/manage/home/) or the **WhatsApp** > **Getting Started** panel in the [app dashboard](https://developers.facebook.com/apps). However, if you have an access token and your business portfolio ID, you can use queries in the collection to get the remaining values.

## Access tokens

The API supports both user and system user access tokens. You can get a user access token by loading your app in the [app dashboard](https://developers.facebook.com/apps) and navigating to the WhatsApp > Getting Started panel. Alternatively you can use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to generate one.

Since user access tokens expire after 24 hours, you'll likely want to generate a system user access token, which lasts up to 60 days (or permanently, if you wish). See [Access Tokens](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#access-tokens) to learn how to create a system user and system user access token.

Once you have your token, save it as a **current value** in the environment.

## Business portfolio ID

You can get your business portfolio ID by signing into the [Meta Business Suite](https://business.facebook.com). The ID appears in the URL as the `business_id` query string parameter value. Once you save this as a **current value** in the environment, go to the WhatsApp Business Account (WABA) folder and run the **Get all owned WABAs** query. This will return your WABA ID, which you can save to your environment and then use to determine your business phone number ID.

## Permissions

The API only relies on two permissions:

- whatsapp_business_management
    
- whatsapp_business_messaging
    

Note that if you get a user access token from the app dashboard, your app will automatically be granted these permissions (by you, on your behalf), so you can use the token to test right away.

Queries that target your business portfolio require the business_management permission, which you may also need based on your business use case. Most developers do not need this permission, however, as accessing your business portfolio is uncommon, and the Meta Business Suite provides nearly all of this functionality anyway.

## Access token debugger

You can paste any token you generate into the [access token debugger](https://developers.facebook.com/tools/debug/accesstoken/) to see what type of token it is and what permission you have granted to your app.

## Pagination

Endpoints that return lists/collections may [paginate results](https://developers.facebook.com/docs/graph-api/results) (you'll see previous and next properties in the response). Use the URLs from these properties to get the previous or next set of results. Note that if you click one of these links in Postman, it will open a new query in a new tab which you must save before running (otherwise it can't read your environment variables), so you may wish to cut and paste the URL and run the query in the same tab in which it was returned.

---

## Table of Contents

1. [Get Started](#get-started)
2. [WhatsApp Business Accounts (WABAs)](#whatsapp-business-accounts-wabas)
3. [Registration](#registration)
4. [Phone Numbers](#phone-numbers)
5. [Webhook Subscriptions](#webhook-subscriptions)
6. [Messages](#messages)
7. [Templates](#templates)
8. [Flows](#flows)
9. [Media](#media)
10. [Typing indicators](#typing-indicators)
11. [Business Profiles](#business-profiles)
12. [Commerce Settings](#commerce-settings)
13. [Payments API - SG](#payments-api---sg)
14. [Payments API - IN](#payments-api---in)
15. [QR codes](#qr-codes)
16. [Business Portfolio](#business-portfolio)
17. [Analytics](#analytics)
18. [Billing](#billing)
19. [OnPrem Account Migration](#onprem-account-migration)
20. [Block Users](#block-users)
21. [Business Compliance](#business-compliance)
22. [Examples](#examples)

---

## Get Started

### Subscribe to your WABA

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/subscribed_apps`

**Example Response:**

Status: `200 OK`

```json
{
    "success": "true"
}
```

---

### Get Phone Number ID

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/phone_numbers`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "verified_name": "Jasper's Market",
            "display_phone_number": "+1 631-555-5555",
            "id": "1906385232743451",
            "quality_rating": "GREEN"
        },
        {
            "verified_name": "Jasper's Ice Cream",
            "display_phone_number": "+1 631-555-5556",
            "id": "1913623884432103",
            "quality_rating": "NA"
        }
    ]
}
```

---

### Register Phone Number

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/register`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "pin": "6-digit-pin"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "success": "true"
}
```

---

### Send Test Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "hello_world",
        "language": {
            "code": "en_US"
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Debug Access Token

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/debug_token?input_token={{User-Access-Token}}`

**Query Parameters:**

- `input_token`: `{{User-Access-Token}}`

---

## WhatsApp Business Accounts (WABAs)

Some API calls listed in this document require you to know your WhatsApp Business Account (WABA) ID. You have the following methods of getting a WABA ID:

1.  **Business Manager**: This is the most simple way. Just open the [Business Manager](https://business.facebook.com/), select your business, go to Settings and find your WhatsApp Business Account. When you click on the account, you see `"owned by"` and `"id"`. Save that ID number.
2.  **During Embedded Signup Onboarding**: See [Get Shared WABA ID with accessToken](https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-shared-waba-id-with-accesstoken) for information.
3.  **Getting all WABAs shared with your business**: See [Get List of Shared WABAs](https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-list-of-shared-wabas) for information.

### Get WABA

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "104996122399160",
    "name": "Lucky Shrub",
    "timezone_id": "1",
    "message_template_namespace": "58e6d318_b627_4112_b9c7_2961197553ea"
}
```

---

### Get owned WABAs

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Business-ID}}/owned_whatsapp_business_accounts`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "id": "104996122399160",
            "name": "Lucky Shrub",
            "timezone_id": "1",
            "message_template_namespace": "58e6d318_b627_4112_b9c7_2961197553ea"
        },
        {
            "id": "102290129340398",
            "name": "Test WhatsApp Business Account",
            "timezone_id": "1",
            "message_template_namespace": "ba30dd89_2ebd_41e4_b805_f2c05ae04cc9"
        }
    ],
    "paging": {
        "cursors": {
            "before": "QVFIUnpPVXRnY3BPN19rTVItOG51T291YURjV3BaeXRXU29adDVreS04ekhSNl9YWTlfdmN3SHlyTEk1a2FRdnlWanBqM1FuQm1uZAHhfYl9UMTNCYjM3MWV3",
            "after": "QVFIUjBrRUs5QVJuUDhDSmZARMlc2dXRYNXBmMjMtRUt3SmFlbk9PRk43azdiN1VQaW1HcnRkejFzZATNoNDdTdGVWMDhjamVvY25HWnI4WjIzX0hYSk40NHhB"
        }
    }
}
```

---

### Get shared WABAs

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Business-ID}}/client_whatsapp_business_accounts`

**Example Response:**

Status: `200 OK`

```json
{ 
    "data": [
        {
            "id": 1906385232743451, 
            "name": "My WhatsApp Business Account", 
            "currency": "USD", 
            "timezone_id": "1", 
            "message_template_namespace": "abcdefghijk_12lmnop" 
        },
       {
            "id": 1972385232742141, 
            "name": "My Regional Account", 
            "currency": "INR", 
            "timezone_id": "5", 
            "message_template_namespace": "12abcdefghijk_34lmnop" 
        }

    ],
    "paging": {
	"cursors": {
		"before": "abcdefghij",
		"after": "klmnopqr"
	}
   }
}
```

---

## Registration

You need to register your phone number in the following scenarios:

*   Account Creation: When you implement this API, you need to register the phone number you want to use to send messages. We enforce [setting two-step verification](#fc57a30c-97e0-4e06-b74b-89fd7fc5f783) during account creation to add an extra layer of security of your accounts.
*   Name Change: In this case, your phone is already registered and you want to change your display name. To do that, you must first [file for a name change on WhatsApp Manager](https://www.facebook.com/business/help/378834799515077). Once the name is approved, you need to register your phone again under the new name.
    

Before registering your phone, you need to verify that you own that phone number with a SMS or voice code. For details, see [Verify Phone Ownership](https://developers.facebook.com/docs/whatsapp/business-management-api/guides/migrate-phone-to-different-waba#step-2--verify-phone-ownership).

In case you would like to remove your phone from the Cloud API, you can deregister a phone. This can be used in cases where you want to move to the On-Premises API or you want to use your phone number in the regular WhatsApp customer app. You can always reregister your phone with Cloud API later by repeating the registration process.

**You set up** [**two-factor verification**](#fc57a30c-97e0-4e06-b74b-89fd7fc5f783) **and** [**register a phone number**](#b22af3db-9d13-4467-a7a6-4026f71984cb) **in the same API call.**

#### Reminders

*   To use these endpoints, you need to authenticate yourself with a system user access token with the **`whatsapp_business_messaging`** permission.
*   If you need to find your phone number ID, see [Get Phone Number ID](#c72d9c17-554d-4ae1-8f9e-b28a94010b28).

### Register Phone

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/register`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "pin": "<your-6-digit-pin>"
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

### Deregister Phone

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/deregister`

**Headers:**

- `Content-Type`: application/json

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

## Phone Numbers

Some API calls listed in this document require you to know your phone number’s ID. For more information on how to get a list of phone numbers associated with your WhatsApp Business Account, see [Get All Phone Numbers](https://developers.facebook.com/docs/whatsapp/business-management-api/phone-numbers#all-phone-numbers). The API call response includes IDs for each of the phone numbers connected to your WhatsApp Business Account. Save the ID for the phone you want to use with any **`/{phone-number-ID}`** calls.

### Get Phone Numbers

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/phone_numbers`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "verified_name": "Jasper's Market",
            "display_phone_number": "+1 631-555-5555",
            "id": "1906385232743451",
            "quality_rating": "GREEN"
        },
        {
            "verified_name": "Jasper's Ice Cream",
            "display_phone_number": "+1 631-555-5556",
            "id": "1913623884432103",
            "quality_rating": "NA"
        }
    ]
}
```

---

### Get Phone Number By ID

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}`

**Example Response:**

Status: `200 OK`

```json
{
    "verified_name": "Jasper's Market",
    "display_phone_number": "+1 631-555-5555",
    "id": "1906385232743451",
    "quality_rating": "GREEN"
}
```

---

### Get Display Name Status (Beta)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}?fields=name_status`

**Query Parameters:**

- `fields`: `name_status` - The status of a display name associated with a specific phone number. The **`name_status`** value can be one of the following:

* `APPROVED`: The name has been approved. You can download your certificate now.
* `AVAILABLE_WITHOUT_REVIEW`: The certificate for the phone is available and display name is ready to use without review.
* `DECLINED`: The name has not been approved. You cannot download your certificate.
* `EXPIRED`: Your certificate has expired and can no longer be downloaded.
* `PENDING_REVIEW`: Your name request is under review. You cannot download your certificate.
NONE: No certificate is available.

**Example Response:**

Status: `200 OK`

```json
{
  "id" : "105954558954427",
  "name_status" : "AVAILABLE_WITHOUT_REVIEW"
}
```

---

### Get Phone Numbers with Filtering (beta)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/phone_numbers?fields=id,is_official_business_account,display_phone_number,verified_name&filtering=[{'field':'account_mode','operator':'EQUAL','value':'SANDBOX'}]`

**Query Parameters:**

- `fields`: `id,is_official_business_account,display_phone_number,verified_name`
- `filtering`: `[{'field':'account_mode','operator':'EQUAL','value':'SANDBOX'}]`

---

### Request Verification Code

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/request_code`

**Headers:**

- `Content-Type`: application/json
- `Authorization`: Bearer {{User-Access-Token}}

**Request Body:**

```json
{
    "code_method": "SMS",
    "locale": "en_US"
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

### Verify Code

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/verify_code`

**Headers:**

- `Content-Type`: application/json
- `Authorization`: Bearer {{User-Access-Token}}

**Request Body:**

```json
{
    "code": "<your-requested-code>"
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

### Set Two-Step Verification Code

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "pin": "<6-digit-pin>"
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

## Webhook Subscriptions

To get Webhook events for a specific WABA, you need to explicitly subscribe to that WABA. You only need to subscribe to a WABA once and then you receive all Webhook events for phone numbers under that WABA. You don’t need to subscribe for every phone number. 
<br><br>

## Reminders
- To use these endpoints, you need to authenticate yourself with a [System User Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens) with the **`whatsapp_business_management`** permission.
- WhatsApp Business Account ID (WABA ID). If you need to find your WABA ID see [Get WABA ID](#b7f6e513-f4e4-4b62-b4a2-d18dc5e6249c).
- You need to set up Webhooks server in your application to receive Webhooks events. To learn how to set up Webhooks, see [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components).

### Webhook Payload Reference

Webhooks are user-defined HTTP callbacks that are triggered by specific events. Whenever that trigger event occurs, the WhatsApp Business API client captures the event, collects the data, and immediately sends a notification (HTTPs request) to the Webhook URL configured in the Webhooks setup step.

For the purposes of this use case, your Webhooks server must be reachable from facebook and have HTTPs support and a valid SSL certificate. See [Webhooks, Getting Started](https://developers.facebook.com/docs/graph-api/webhooks/getting-started) for requirements on creating a Webhooks endpoint and configuring the Webhooks product.

To get Webhooks notifications, your application must subscribe to the WABA you want to receive alerts for. For a full guide, see [Webhooks for WhatsApp Business Accounts](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-whatsapp).

  
The structure of the webhook payload is explained in the [Webhooks Notification Payload Reference. ](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components/) All Webhooks have the following generic JSON format:

``` json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": "PHONE_NUMBER",
                  "phone_number_id": "PHONE_NUMBER_ID"
              },
              # specific Webhooks payload            
          },
          "field": "messages"
        }
      ]
    }
  ]
}

 ```

  
If you receive a message that is not supported for the Cloud API beta release, you will get an [unknown message Webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks#received-unknown-messages).

**This table lists all possible options for the status of a message.**

| Status | Description | WhatsApp Mobile Equivalent |
| --- | --- | --- |
| **`sent`** | Message received by WhatsApp server. | One checkmark |
| **`delivered`** | Message delivered to the recipient. | Two checkmarks |
| **`read`** | Message read by recipient. | Two blue checkmarks |
| **`failed`** | Message failed to send. | Red error triangle |
| **`deleted`** | Message deleted by the user. | Message is replaced in WhatsApp mobile with the note `"This message was deleted"`. |

#### Components

The top level Webhooks array contains the following two fields:

| Field                   | Description                      |
|--------------------|----------------------------------|
| **`object`**       | All Webhook events for WhatsApp Cloud API belong under the **`whatsapp_business_account`** object. |
| **`entry`**        | An array of [entry objects](#818e8a3e-37b1-4bb6-8441-3291c02c0258). |

##### Entry Object

| Field                   | Description                      |
|--------------------|----------------------------------|
| **`id`**           | The ID of Whatsapp Business Accounts this Webhook belongs to. |
| **`changes`**      | Changes that triggered the Webhooks call. This field contains an array of change objects. |

##### Change Object

| Field                   | Description                      |
|--------------------|----------------------------------|
| **`value`**        | A [value object](#54a8a703-18c8-47af-9aaf-a560afd9aa7b). Contains details of the changes related to the specified field. |
| **`field`**        | Contains the type of notification you are getting on that Webhook. Currently, the only option for this API is `“messages”`. |

##### Metadata Object

| Name                    | Description                      |
|-------------------------|----------------------------------|
| **`display_phone_number`** | The phone number of the business account that is receiving the Webhooks. |
| **`phone_number_id`** | The ID of the phone number receiving the Webhooks. You can use this **`phone_number_id`** to send messages back to customers. |

##### Value Object

| Field                   | Description                      |
|-------------------------|----------------------------------|
| **`messaging_product`** | The messaging service used for Webhooks. For WhatsApp messages, this value needs to be set to `“whatsapp”`. |
| **`metadata`**        | The metadata about your phone number. |
| **`messages`**        | An array of [message objects](#9ad6ff8c-72d6-4b04-b4d5-45fe093976ad). **Added to Webhooks for incoming message notifications**.|
| **`statuses`**        | An array of [message status objects](#15305365-753b-400a-90ce-de069ee7f909). **Added to Webhooks for message status update**. |
| **`errors`**          | An array of [message error objects](#a89ecf92-9b51-409a-af27-2c3b9bc0fd7e). |

##### Contact Object

| Field                   | Description                      |
|-------------------------|----------------------------------|
| **`profile`**           | The [profile object](#bedd6ec6-be2f-42ca-9b0e-a6c3f6f4cd70).          |
| **`wa_id`**             | The WhatsApp ID of the customer. You can send messages using this **`wa_id`**.          |

##### Profile Object

| Field | Description |
| --- | --- |
| **`name`** |  **Optional.**<br/> Specifies the sender's profile name. |

##### Messages Object

The messages array of objects is nested within the **`Value`** object and is triggered when a customer updates their profile information or a customer sends a message to the business that is subscribed to the Webhook.

| Field                   | Description                      |
|-------------------------|----------------------------------|
| **`from`**              | The customer's phone number.       |
| **`id`**                | The unique identifier of incoming message, you can use messages endpoint to mark it as read.       |
| **`timestamp`**         | The timestamp when a customer sends a message.       |
| **`type`**              | The type of message being received.<br/><br/>Supported values are:<ul><li>`text`: for text messages.</li><li>`image`: for image (media) messages.</li><li>`interactive`: for interactive messages.</li><li>`document`: for document (media) messages.</li><li>`audio`: for audio and voice (media) messages.</li><li>`sticker`: for sticker messages.</li><li>`order`: for when a customer has placed an order.</li><li>`video`: for video (media) messages.</li><li>`button`: for responses to [interactive message templates](#b00c9f92-be3e-4511-af38-be72827a7f3a).</li><li>`contacts`: for contact messages.</li><li>`location`: for location messages.</li><li>`unknown`: for unknown messages.</li><li>`system`: for user number change messages.</li></ul>       |
| **`context`**              |  **Added to Webhook if message is forwarded or an inbound reply.** <br/>A [context object](#57287ed9-e640-44db-b991-9f03749cb645).|
| **`identity`**            | **Added to Webhook if show_security_notifications is enabled in application settings.** <br/>An [identity object](#a1b69494-a0f5-405c-9dd5-968362c4a30f). |
| **`text`**              |  **Added to Webhook if type is `text`**. <br/>A [text object](#e2e1d9df-0886-4e29-a8c8-ff93223178bd). |
| **`audio`**              |  **Added to Webhook if type is `audio` (including voice messages)**. <br/>A [media object](#058689bd-e754-4efc-938d-bec7bec3b1c4) with the audio information. |
| **`image`**              |  **Added to Webhook if type is `image`**. <br/>A [media object](#058689bd-e754-4efc-938d-bec7bec3b1c4) with the image information. |
| **`sticker`**              |  **Added to Webhook if type is `sticker`**. <br/>A [media object](#058689bd-e754-4efc-938d-bec7bec3b1c4) with the sticker information. |
| **`video`**              |  **Added to Webhook if type is `video`**. <br/>A [media object](#058689bd-e754-4efc-938d-bec7bec3b1c4) with the video information. |
| **`interactive`**              |  **Added to Webhook if type is `interactive`**. <br/>When a customer has interacted with your message, an [interactive object](https://documenter.getpostman.com/view/13382743/UVC5FTHT?fbclid=IwAR083mCseNzJm-JgxlIQbdF30hkAbEOHkbBaw9bA7-isGKU6uwtq1RJKc0o#68fe0550-aba5-4ee3-b79d-0846f3dddef1) is included in the **``Messages`** object. |
| **`order`** | Included in the **`Messages`** object when a customer has placed an order. The order object can contain the following fields:<ul><li>**`catalog_id`**: ID for the catalog the ordered item belongs to.</li><li>**`text`**: Text message from the user sent along with the order.</li><li>**`product_items`**: Array of product item objects.</li></ul><br/><br/>The **`product_items`** object contains the following fields:<ul><li>**`product_retailer_id`**: The unique identifier of the product in a catalog.</li><li>**`quanitity`**: The number of items.</li><li>**`item_price`**: The price of each item.</li><li>**`currency`**: The price currency.</li></ul>
| **`document`**              |  **Added to Webhook if type is `document`**. <br/>A [media object](#058689bd-e754-4efc-938d-bec7bec3b1c4) with the document information. |
| **`errors`**              |  **Added to Webhook if type is `unknown`**. <br/>If displayed, this field contains the following error message:<br/><br/>```[{"code":131051,"details":"Message type is not currently supported","title":"Unsupported message type"]```|
| **`system`**              |  **Added to Webhook if type is `system`**. <br/>A [system message object](#15b395a9-15eb-4610-ba12-3c9f8a5e0528). |
| **`button`**              |  **Added to Webhook if type is `button`**. <br/>A [button message object](#cffcb0b3-f6c8-45d6-b4a1-5deaa8955a7d). <br/>This field is used when the Webhook notifies you that a user clicked on a quick reply button.|
| **`referral`**              |  **Added to Webhook if the message is coming from a user that clicked an ad that is `Click To WhatsApp`**.<br/>A [referral object](). This is how the referral object works:<ol><li>A user clicks on an ad with the Click to WhatsApp call-to-action.</li><li>User is redirected to WhatsApp and sends a message to the advertising business.</li><li>User sends a message to the business. Be aware that users may elect to remove their referral data.</li><li>The advertising business gets an inbound message notification including the **`referral`** object, which provides additional context on the ad that triggered the message. Knowing all this information, the business can appropriately reply to the user message.</li></ol>
|

##### Text Object

| Field                 | Description                      |
|-------------------------|----------------------------------|
| **`body`**              | The text of the text message.    |

##### Context Object

| Field                 | Description                      |
|----------------------------|----------------------------------|
| **`forwarded`**            | **Added to Webhooks if message was forwarded.**<br/>Set to **`true`** if the received message has been forwarded.         |
| **`frequently_forwarded`** | **Added to Webhooks if message has been frequently forwarded.**<br/>Set to **`true`** if the received message has been forwarded more than five times.         |
| **`from`**               | **Added to Webhooks if message is an inbound reply to a sent message.**<br/>The WhatsApp ID of the sender of the sent message.         |
| **`id`**                | **Optional**<br/>The message ID for the sent message for an inbound reply. |
| **`referred_product`** | **Required for Product Enquiry Messages**.<br/><br/>Specifies the product the user is requesting information about. For more information, see [Receive Response From Customers](https://developers.facebook.com/docs/whatsapp/on-premises/guides/commerce-guides/receive-responses-from-customers).<br/><br/>The **`referred_product`** object contains the following fields:<ul><li>**`catalog_id`**: Unique identifier of the Meta catalog linked to the WhatsApp Business Account.</li><li>**`product_retailer_id`**: Unique identifier of the product in a catalog.</li></ul> |

##### Identity Object

| Field                 | Description                      |
|----------------------------|----------------------------------|
| **`acknowledged`**         | State of acknowledgment for latest **`user_identity_changed`** system notification. |
| **`created_timestamp`**    | The timestamp of when the WhatsApp Business API detected the user potentially changed. |
| **`hash`**                 | Identifier for the latest **`user_identity_changed`** system notification. |

##### Media Object

**`Media Object`** is used for audio, images, documents, videos and stickers.

| Field                 | Description                      |
|----------------------------|----------------------------------|
| **`caption`**         | **Added to Webhooks if it has been previously specified.**<br/>The caption that describes the media. |
| **`filename`**        | **Added to Webhooks for document messages.**<br/>The media's filename on the sender's device. |
| **`id`**              | The ID of the media. |
| **`mime_type`**       | The mime type of the media. |
| **`sha256`**          | The checksum of the media. |

##### Reaction Object

The `Reaction` object contains information about messages that contain a reaction and corresponding emojis. This object contains the following fields:

| Field                 | Description                      |
|-----------------------|----------------------------------|
| **`message_id`**      | Specifies the **`wamid`** of the message received that contained the reaction. |
| **`emoji`**           | The emoji used for the reaction.|

##### Interactive Object

| Field | Description |
| --- | --- |
| **`type`** | Contains the type of interactive object. Supported options are:<ul><li>`button_reply`: for responses of Reply Buttons.</li><li>`list_reply`: for responses to List Messages and other interactive objects.</li></ul>|
| **`button_reply`** | **Used on Webhooks related to Reply Buttons.**  <br/>Contains a [button reply object](#3530f9ca-704b-4811-a1bc-04472a72e00f). |
| **`list_reply`** | **Used on Webhooks related to List Messages**  <br/>Contains a [list reply object](#374bd5d7-e6c5-48e6-80f9-5821ad5da7ff). |

###### Button Reply Object

| Field | Description |
| --- | --- |
| **`id`** | The unique identifier of the button. |
| **`title`** | The title of the button. |

###### List Reply Object

| Field | Description |
| --- | --- |
| **`id`** | The unique identifier (ID) of the selected row. |
| **`title`** | The title of the selected row. |
| **`description`** | The description of the selected row. |

##### System Message Object

This object is added to Webhooks if a user has changed their phone number and if a user’s identity has potentially changed on WhatsApp.

| Field                 | Description                      |
|-----------------------|----------------------------------|
| **`body`**            | Describes the system message event. Supported use cases are:<ul><li>**Phone number update:** for when a user changes from an old number to a new number.</li><li>**Identity update:** for when a user identity has changed.</li></ul> |
| **`new_wa_id`**       | **Added to Webhooks for phone number updates.**<br/>New WhatsApp ID of the customer.|
| **`identity`**       | **Added to Webhooks for identity updates.**<br/>New WhatsApp ID of the customer.|
|**`type`**       | Supported types are:<ul><li>**user_changed_number**: for a user changed number notification.</li><li>**user_identity_changed**: for user identity changed notification.</li></ul>|
| **`user`**       | **Added to Webhooks for identity updates.**<br/>The new WhatsApp user ID of the customer.|

##### Statuses Object

The **`statuses`** object informs you of the status of messages between you, users, and/or groups.

| Field                        | Description                      |
|------------------------------|----------------------------------|
| **`id`**<br/>type: string    |  The message ID. |
| **`recipient_id`**<br/>type: string | The WhatsApp ID of the recipient.|
| **`status`**<br/>type: string          | The status of the message. Valid values are: **`read`**, **`delivered`**, **`sent`**, **`failed`**, or **`deleted`**. <br/><br/>For more information, see [All Possible Message Statuses](#9a302c08-c8d7-42da-8800-1b24bed8adaf).|
| **`timestamp`**<br/>type: string       | The timestamp of the status message.|
| **`type`**<br/>type: string            | The type of entity this status object is about. Currently, the only available option is `"message"`.<br/>_This object is only available for the On-Premises implementation of the API. Cloud API developers will not receive this field._ |
| **`conversation`**<br/>type: object    | **This object will be provided by default when [Conversation-Based Pricing](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing) launches in a future update.**<br/>Object containing conversation attributes, including **`id`**. See [conversation object](#7f5a70d6-7302-44d3-a473-74b92c21365b) for more information.<br/><br/>WhatsApp defines a conversation as a 24-hour session of messaging between a person and a business. There is no limit on the number of messages that can be exchanged in the fixed 24-hour window. The 24-hour conversation session begins when:<ul><li>A business-initiated message is delivered to a user</li><li>A business’ reply to a user message is delivered</li></ul><br/>The 24-hour conversation session is different from the 24-hour customer support window. The customer support window is a rolling window that is refreshed when a user-initiated message is delivered to a business. Within the customer support window businesses can send free-form messages. Any business-initiated message sent more than 24 hours after the last customer message must be a template message. |
| **`pricing`**<br/>type: object       | **This object will be provided by default when [Conversation-Based Pricing](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing) launches in a future update.**<br/>| Object containing billing attributes, including **`pricing_model`**, **`billable`** flag, and **`category`**. See [pricing object](https://documenter.getpostman.com/view/13382743/UVC5FTHT#f72385a4-9ab5-40ec-bd1b-fd0adf0d37e3) for more information.
| **`errors`**          | **Added to Webhook if status is set to `failed`**. <br/>An array of [error objects](#a89ecf92-9b51-409a-af27-2c3b9bc0fd7e) with information about a message’s delivery failure.|

###### Conversation Object

The **`conversation`** object tracks the attributes of your current conversation. The following fields are specified within the conversation object:

| Field                        | Description                      |
|------------------------------|----------------------------------|
| **`id`**<br/>type: string    |  The ID of the conversation the given status notification belongs to. |
| **`origin`**<br/>type: object | Describes where the conversation originated from. See [origin object](#efa78bee-682f-4620-9d97-14ecb3cee0ef) for more information.|
| **`expiration_timestamp`**<br/>type: [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time?fbclid=IwAR3joUPmHY6qMICZD4EeLhuRgSR7F28eKavnrVnru3QFMhtgOcCJ3V-QjbQ)    |  The timestamp when the current ongoing conversation expires. This field is not present in all Webhook types. |

###### Payment Object

The **`payment`** object tracks the attributes of the user-initiated transaction changes. The following fields are specified within the payment object:

| Field | Description |
| --- | --- |
| **`id`**  <br>type: string | Webhook ID for the notification. |
| **`from`**  <br>type: string | WhatsApp ID of the customer. |
| **`type`**  <br>type: string | For payment status update webhooks, type is `payment`. |
| **`status`**  <br>type: string | Latest status of the payment. Can be one of `captured`, `failed` or `pending`. |
| **`payment`**  <br>type: object | Contains the following field:  <br>  <br>`reference_id` string  <br>\- Unique reference ID for the order sent in order_details message. |
| **`timestamp`**  <br>type: string | Timestamp for the webhook. |

###### Origin Object

**This object will become available when [Conversation-Based Pricing](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing) launches in a future update.**
The **`origin`** object describes where a conversation has originated from. The following fields are specified within the origin object:

| Field                        | Description                      |
|------------------------------|----------------------------------|
| **`type`**<br/>type: string  | Indicates where a conversation has started. This can also be referred to as a conversation entry point. Currently, the available options are:<ul><li>**`business_initiated`**: indicates that the conversation started by a business sending the first message to a user. This applies any time it has been more than 24 hours since the last user message.</li><li>**`user_initiated`**: indicates that the conversation started by a business replying to a user message. This applies only when the business reply is within 24 hours of the last user message.</li><li>**`referral_conversion`**: indicates that the conversation originated from a [free entry point](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing#free-entry-points). These conversations are always user-initiated.</li></ul>|

###### Pricing Object

The **`pricing`** object includes your billing attributes. The following fields are specified within the pricing object:

| Field                                  | Description                      |
|----------------------------------------|----------------------------------|
| **`pricing_model`**<br/>type: string  |  Type of pricing model being used. Current supported values are:<ul><li>`"CBP"` (conversation-based pricing): See [Conversation-Based Pricing](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing) for rates based on recipient country.</li><li>`"NBP"` (notification-based pricing): Notifications are also known as Template Messages ([click here for details on pricing](https://developers.facebook.com/docs/whatsapp/pricing)). This pricing model will be deprecated in a future release early 2022.</li></ul>|
| **`billable`**<br/>type: boolean  | Indicates if the given message or conversation is billable. Value varies according to **`pricing_model`**.<br/><br/>If you are using CBP (conversation-based pricing):<ul><li>This flag is set to **`false`** if the conversation was initiated from [free entry points](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing#free-entry-points). Conversations initiated from free entry points are not billable.</li><li>For all other conversations, it’s set to **`true`**.</li><li>This is also set to **`true`** for conversations inside your free tier limit. You are not charged for these conversations, but they are considered billable and are reflected on your invoice.</li></ul><br/>If you are using NBP (notification-based pricing):<ul><li>This flag is **`false`** for user-initiated conversations.</li><li>This flag is set to **`true`** for notification messages (template messages)</li></ul> |
| **`category`**<br/>type: string | Indicates the conversation pricing category. Currently, available options are:<ul><li>**`business_initiated`**: indicates that the conversation was started by a business sending the first message to a user. This applies any time it has been more than 24 hours since the last user message.</li><li>**`user_initiated`**: indicates that the conversation was initiated by a business replying to a user message. This applies only when the business reply is within 24 hours of the last user message.</li><li>**`referral_conversion`**: indicates that the conversation originated from a [free entry point](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing#free-entry-points). These conversations are always user-initiated.</li></ul>|

##### Error Object

| Field                 | Description                      |
|-----------------------|----------------------------------|
| **`code`**            | The error code. |
| **`title`**           | The error title.|

##### Button Object

| Field                 | Description                      |
|-----------------------|----------------------------------|
| **`payload`**         | The developer-defined payload for the button when a business account sends interactive messages. |
| **`text`**            | The button text.|

##### Referral Object

| Field | Description |
| --- | --- | 
| **`source_url`** | Specifies the URL that leads to the ad or post clicked by the user. Opening this URL takes you to the ad viewed by your user. |
| **`source_type`** | Specifies the type of the ad's source. Supported values are `"ad"` or `"post"`. |
| **`source_id`** | Specifies the Meta ID for an ad or post. |
| **`headline`** | Specifies the headline used in the ad or post that generated the message. |
| **`body`** | The description, or body, from the ad or post that generated the message. |
| **`media_type`** | Media present in the ad or post the user clicked. Supported values are `"image"` or `"video"`. |
| **`image_url`** | **Added if media_type is `“image”`**.<br/> Contains a URL to the raw image. |
| **`video_url`** | **Added if media_type is `“video”`**.<br/> Contains a URL to the video. |
| **`thumbnail_url`** | **Added if media_type is `“video”`**.<br/> Contains a URL to the thumbnail image of the clicked video. |

#### Received Text Message

**Method:** `VIEW`

**Request Body:**

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
                                "profile": {
                                    "name": "Kerry Fisher"
                                },
                                "wa_id": "16315551234"
                            }
                        ],
                        "messages": [
                            {
                                "from": "16315551234",
                                "id": "wamid.ABGGFlCGg0cvAgo-sJQh43L5Pe4W",
                                "timestamp": "1603059201",
                                "text": {
                                    "body": "Hello this is an answer"
                                },
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

---

#### Received Text Message with Show Security Notifications

**Method:** `VIEW`

**Request Body:**

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
                            "display_phone_number": "<PHONE_NUMBER>",
                            "phone_number_id": "27681414235104944"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<CONTACT_NAME>"
                                },
                                "wa_id": "<WA_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "<FROM_PHONE_NUMBER>",
                                "id": "ABGGFjFVU2AfAgo6V-Hc5eCgK5Gh",
                                "identity": {
                                    "acknowledged": true,
                                    "created_timestamp": 1602532300000,
                                    "hash": "Sjvjlx8G6Z0="
                                },
                                "text": {
                                    "body": "Hi from new number 3601"
                                },
                                "timestamp": "1602532300",
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

---

#### Received Message with Reaction

**Method:** `VIEW`

**Request Body:**

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
                            "display_phone_number": "<PHONE_NUMBER>",
                            "phone_number_id": "27681414235104944"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<CONTACT_NAME>"
                                },
                                "wa_id": "<WA_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "sender_wa_id",
                                "id": "message_id",
                                "timestamp": "message_timestamp",
                                "type": "reaction",
                                "reaction": {
                                    "emoji": "<emoji>",
                                    "messsage_id": "<WAMID>"
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

---

#### Received Media Message with Image

**Method:** `VIEW`

**Request Body:**

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
                            "phone_number_id": "<PHONE_NUMBER_ID>"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<CONTACT_NAME>"
                                },
                                "wa_id": "<WA_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "<FROM_PHONE_NUMBER>",
                                "id": "wamid.id",
                                "timestamp": "<TIMESTAMP>",
                                "type": "image",
                                "image": {
                                    "caption": "This is a caption",
                                    "mime_type": "image/jpeg",
                                    "sha256": "81d3bd8a8db4868c9520ed47186e8b7c5789e61ff79f7f834be6950b808a90d3",
                                    "id": "2754859441498128"
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

---

#### Received Media Message with Sticker

**Method:** `VIEW`

**Request Body:**

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
                            "display_phone_number": "<DISPLAY_PHONE_NUMBER>",
                            "phone_number_id": "<PHONE_NUMBER_ID>"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<CONTACT_NAME>"
                                },
                                "wa_id": "<WA_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "<SENDER_PHONE_NUMBER>",
                                "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
                                "timestamp": "<TIMESTAMP>",
                                "type": "sticker",
                                "sticker": {
                                    "id": "<ID>",
                                    "animated": false,
                                    "mime_type": "image/webp",
                                    "sha256": "<HASH>"
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

---

#### Received Contact Messages

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "<PHONE_NUMBER>",
                            "phone_number_id": "<PHONE_NUMBER_ID>"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<NAME>"
                                },
                                "wa_id": "<WHATSAPP_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "<PHONE_NUMBER>",
                                "id": "<wamid.ID>",
                                "timestamp": "<TIMESTAMP>",
                                "contacts": [
                                    {
                                        "addresses": [
                                            {
                                                "city": "<ADDRESS_CITY>",
                                                "country": "<ADDRESS_COUNTRY>",
                                                "country_code": "<ADDRESS_COUNTRY_CODE>",
                                                "state": "<ADDRESS_STATE>",
                                                "street": "<ADDRESS_STREET>",
                                                "type": "<HOME|WORK>",
                                                "zip": "<ADDRESS_ZIP>"
                                            }
                                        ],
                                        "birthday": "<CONTACT_BIRTHDAY>",
                                        "emails": [
                                            {
                                                "email": "<CONTACT_EMAIL>",
                                                "type": "<WORK|HOME>"
                                            }
                                        ],
                                        "name": {
                                            "formatted_name": "<CONTACT_FORMATTED_NAME>",
                                            "first_name": "<CONTACT_FIRST_NAME>",
                                            "last_name": "<CONTACT_LAST_NAME>",
                                            "middle_name": "<CONTACT_MIDDLE_NAME>",
                                            "suffix": "<CONTACT_SUFFIX>",
                                            "prefix": "<CONTACT_PREFIX>"
                                        },
                                        "org": {
                                            "company": "<CONTACT_ORG_COMPANY>",
                                            "department": "<CONTACT_ORG_DEPARTMENT>",
                                            "title": "<CONTACT_ORG_TITLE>"
                                        },
                                        "phones": [
                                            {
                                                "phone": "<CONTACT_PHONE>",
                                                "wa_id": "<CONTACT_WA_ID>",
                                                "type": "<HOME|WORK>"
                                            }
                                        ],
                                        "urls": [
                                            {
                                                "url": "<CONTACT_URL>",
                                                "type": "<HOME|WORK>"
                                            }
                                        ]
                                    }
                                ]
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

---

#### Received Static Location Messages

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "<PHONE_NUMBER>",
                            "phone_number_id": "<PHONE_NUMBER_ID>"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<NAME>"
                                },
                                "wa_id": "<WHATSAPP_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "from": "PHONE_NUMBER",
                                "id": "wamid.ID",
                                "timestamp": "TIMESTAMP",
                                "location": {
                                    "latitude": "<LOCATION_LATITUDE>",
                                    "longitude": "<LOCATION_LONGITUDE>",
                                    "name": "<LOCATION_NAME>",
                                    "address": "<LOCATION_ADDRESS>",
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

---

#### Received Message Triggered by Click to WhatsApp Ads

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "<PHONE_NUMBER>",
                            "phone_number_id": "<PHONE_NUMBER_ID>"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "<PROFILE_NAME>"
                                },
                                "wa_id": "<WA_ID>"
                            }
                        ],
                        "messages": [
                            {
                                "referral": {
                                    "source_url": "<AD_OR_POST_FB_URL>",
                                    "source_id": "<AD_ID>",
                                    "source_type": "<AD_OR_POST>",
                                    "headline": "<AD_TITLE>",
                                    "body": "<AD_DESCRIPTION>",
                                    "media_type": "<IMAGE_OR_VIDEO>",
                                    "image_url": "<RAW_IMAGE_URL>",
                                    "video_url": "<RAW_VIDEO_URL>",
                                    "thumbnail_url": "<RAW_THUMBNAIL_URL>"
                                },
                                "from": "<SENDER_PHONE_NUMBERID>",
                                "id": "wamid.ID",
                                "timestamp": "<TIMESTAMP>",
                                "type": "text",
                                "text": {
                                    "body": "<BODY>"
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

---

#### Received Unknown Messages

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "1900820329959633",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "16315551234",
                            "phone_number_id": "16315551234"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "Kerry Fisher"
                                },
                                "wa_id": "16315555555"
                            }
                        ],
                        "messages": [
                            {
                                "from": "16315555555",
                                "id": "wamid.ABGGFlA5FpafAgo6tHcNmNjXmuSf",
                                "timestamp": "1602139392",
                                "errors": [
                                    {
                                        "code": 130501,
                                        "details": "Message type is not currently supported",
                                        "title": "Unsupported message type"
                                    }
                                ],
                                "type": "unknown"
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

---

#### Message Status Update Notifications

**Method:** `VIEW`

**Request Body:**

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
                                "id": "wamid.gBGGFlCGg0cvAglAxydbAoy-gwNo",
                                "status": "sent",
                                "timestamp": "1603086313",
                                "recipient_id": "16315551234"
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

---

#### Received Callback from a Quick Reply Button Click

**Method:** `VIEW`

**Request Body:**

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
                                "profile": {
                                    "name": "Kerry Fisher"
                                },
                                "wa_id": "16315551234"
                            }
                        ],
                        "messages": [
                            {
                                "context": {
                                    "from": "16505553333",
                                    "id": "wamid.gBGGFlCGg0cvAgkLFm4e9tICiTI"
                                },
                                "from": "16315551234",
                                "id": "wamid.ABGGFlCGg0cvAgo-sHWxBA2VFD_S",
                                "timestamp": "1603087229",
                                "type": "button",
                                "button": {
                                    "text": "No",
                                    "payload": "No-Button-Payload"
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

---

#### Status: Message Sent - User Initiated

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "recipient_id": "PHONE_NUMBER",
                                "status": "sent",
                                "timestamp": "TIMESTAMP",
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "origin": {
                                        "type": "user_initiated"
                                    }
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

---

#### Status: Message Sent - Business-Initiated

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "recipient_id": "PHONE_NUMBER",
                                "status": "sent",
                                "timestamp": "TIMESTAMP",
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "origin": {
                                        "type": "business_initated"
                                    }
                                },
                                "pricing": {
                                    "pricing_model": "CBP",
                                    "billable": true,
                                    "category": "business_initated"
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

---

#### Status: Message Sent - Business Reply to User

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "status": "sent",
                                "timestamp": TIMESTAMP,
                                "recipient_id": PHONE_NUMBER,
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "origin": {
                                        "type": "referral_conversion"
                                    }
                                },
                                "pricing": {
                                    "billable": false,
                                    "pricing_model": "CBP",
                                    "category": "referral_conversion"
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

---

#### Status: Message Delivered - User Initiated

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "recipient_id": "PHONE_NUMBER",
                                "status": "delivered",
                                "timestamp": "TIMESTAMP",
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "origin": {
                                        "type": "business_initiated"
                                    }
                                },
                                "pricing": {
                                    "pricing_model": "CBP",
                                    "billable": true
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

---

#### Status: Message Delivered - Business from User-Initiated

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "status": "sent",
                                "timestamp": "TIMESTAMP",
                                "recipient_id": "PHONE_NUMBER",
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "type": "referral_conversion"
                                },
                                "pricing": {
                                    "billable": false,
                                    "pricing_model": "CBP",
                                    "category": "referral_conversion"
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

---

#### Status: Message Delivered - Business Delivered from User

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "recipient_id": "PHONE_NUMBER",
                                "status": "delivered",
                                "timestamp": "TIMESTAMP",
                                "conversation": {
                                    "id": "CONVERSATION_ID",
                                    "expiration_timestamp": TIMESTAMP,
                                    "origin": {
                                        "type": "user_initiated"
                                    }
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

---

#### Status: Message Deleted

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": PHONE_NUMBER,
                            "phone_number_id": PHONE_NUMBER
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "NAME"
                                },
                                "wa_id": PHONE_NUMBER
                            }
                        ],
                        "messages": [
                            {
                                "from": PHONE_NUMBER,
                                "id": "wamid.ID",
                                "timestamp": TIMESTAMP,
                                "errors": [
                                    {
                                        "code": 131051,
                                        "details": "Message type is not currently supported",
                                        "title": "Unsupported message type"
                                    }
                                ],
                                "type": "unsupported"
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

---

#### Status: Message Failed

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": PHONE_NUMBER,
                            "phone_number_id": PHONE_NUMBER_ID
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "status": "failed",
                                "timestamp": TIMESTAMP,
                                "recipient_id": PHONE_NUMBER,
                                "errors": [
                                    {
                                        "code": 131014,
                                        "title": "Request for url https://URL.jpg failed with error: 404 (Not Found)"
                                    }
                                ]
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

---

#### Received Product Enquiry Message

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "NAME"
                                },
                                "wa_id": "PHONE_NUMBER_ID"
                            }
                        ],
                        "messages": [
                            {
                                "from": "PHONE_NUMBER",
                                "id": "wamid.ID",
                                "text": {
                                    "body": "MESSAGE_TEXT"
                                },
                                "context": {
                                    "from": "PHONE_NUMBER",
                                    "id": "wamid.ID",
                                    "referred_product": {
                                        "catalog_id": "CATALOG_ID",
                                        "product_retailer_id": "PRODUCT_ID"
                                    }
                                },
                                "timestamp": "TIMESTAMP",
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

---

#### Received Order Messages

**Method:** `VIEW`

**Request Body:**

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
                            "phone_number_id": "phone-number-id"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "Kerry Fisher"
                                },
                                "wa_id": "16315551234"
                            }
                        ],
                        "messages": [
                            {
                                "from": "16315551234",
                                "id": "wamid.ABGGFlCGg0cvAgo6cHbBhfK5760V",
                                "order": {
                                    "catalog_id": "the-catalog_id",
                                    "product_items": [
                                        {
                                            "product_retailer_id": "the-product-SKU-identifier",
                                            "quantity": "number-of-item",
                                            "item_price": "unitary-price-of-item",
                                            "currency": "price-currency"
                                        }
                                    ],
                                    "text": "text-message-sent-along-with-the-order"
                                },
                                "context": {
                                    "from": "16315551234",
                                    "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
                                },
                                "timestamp": "1603069091",
                                "type": "order"
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

---

#### Status: Transaction Status - Order Details Message

**Method:** `VIEW`

**Request Body:**

```json
{
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "statuses": [
                            {
                                "id": "wamid.ID",
                                "from": "PHONE_NUMBER",
                                "type": "payment",
                                "status": "<captured | failed | pending>",
                                "payment": {
                                    "reference_id": "reference-id-from-order-details-msg"
                                },
                                "timestamp": "notification_timestamp"
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

---

### Subscribe to a WABA

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/subscribed_apps`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Get All Subscriptions for a WABA

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/subscribed_apps`

**Headers:**

- `Authorization`: Bearer {{User-Access-Token}}

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "whatsapp_business_api_data": {
                "link": "<APP1_LINK>",
                "name": "<APP1_NAME>",
                "id": "7234002551525653"
            }
        },
        {
            "whatsapp_business_api_data": {
                "link": "<APP2_LINK>",
                "name": "<APP2_LINK>",
                "id": "3736565603394103"
            }
        }
    ]
}

```

---

### Unsubscribe from a WABA

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/subscribed_apps`

**Headers:**

- `Authorization`: Bearer {{User-Access-Token}}

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Override Callback URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/subscribed_apps`

**Headers:**

- `Authorization`: Bearer {{User-Access-Token}}

**Request Body:**

```json
{
  "override_callback_uri": "<ALTERNATE_WEBHOOK_ENDPOINT_URL>",
  "verify_token": "<ALTERNATE_WEBOOK_ENDPOINT_VERIFICATION_TOKEN>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
  "data" : [
    {
      "override_callback_uri" : "https://alternate-endpoint-callback.com/webhook",
      "whatsapp_business_api_data" : {
        "id" : "670843887433847",
        "link" : "https://www.facebook.com/games/?app_id=67084...",
        "name" : "Jaspers Market"
      }
    }
  ]
}
```

---

## Messages

<!-- 
You can use this API to send text messages, media, and message templates to your customers. To send a message, create a **Message** object. Each message is identified by a unique ID. You can also mark an incoming message as read through the `/messages` endpoint. You can track message status with Webhooks by ID. 
-->

Use the **`/{{Phone-Number-ID}}/messages`** endpoint to send text messages, media (audio, documents, images, and video), and message templates to your customers. For more information relating to the messages you can send, see [Messages](#1f4f7644-cc97-40b5-b8e4-c19da268fff1).

Messages are identified by a unique ID. You can track message status in the Webhooks through its ID. You could also mark an incoming message as read through the **`/{{Phone-Number-ID}}/messages`** endpoint.

## Prerequisites

*   [User Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens) with **`whatsapp_business_messaging`** permission
*   `phone-number-id` for your registered WhatsApp account. See [Get Phone Number](#c72d9c17-554d-4ae1-8f9e-b28a94010b28).

### Messages Object

To send a message, you must first assemble a message object with the content you want to send. The **`Message Object`** contains the following fields used to create a message object:

#### Fields

| Name | Description |
|------|----------|
|**`messaging_product`** | **Required**. <br/> Messaging service used for the request. Always use `"whatsapp"`.|
|**`recipient_type`** | **Optional**. <br/> Currently, you can only send messages to individuals. Set this value to `"individual"`. <br/><br/>**Default**: `individual` |
|**`to`** | **Required**. <br/> WhatsApp ID or phone number for the person you want to send a message to.<br></br>See [Phone Numbers, Formatting](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#formatting) for more information. |
|**`context`** | **Optional**. Only used for Cloud API. <br/>Used to mention a specific message you are replying to. The reply can be any message type currently supported by the Cloud API. |
|**`type`** | **Optional**. <br/>The type of message you want to send. <br/><br/>The supported options for beta users are: <ul><li>**text**: for text messages.</li><li>**template**: for template messages. Only text-based templates are supported.</li><li>**document**: for document messages.</li><li>**image**: for image messages.</li><li>**interactive**: for list and reply button messages.</li><li>**audio**: for audio messages.</li><li>**contacts**: for contacts messages.</li><li>**location**: for location messages.</li><li>**sticker**: for sticker messages.</li><li>**video**: for video messages.</li></ul><br/>**Default**: `text`|
|**`text`** | **Required for text messages**.<br/> A [text object](#fa59d67b-dc6f-446a-a0fd-f97537afbd2e). |
|**`audio`** | **Required when `type` is set to `audio`**.<br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) containing audio. |
|**`contact`** | **Required when `type` is set to `contacts`**.<br/> A [contacts object](#5bb1e554-402c-4278-bce4-657a9c4dc12f).|
|**`document`** | **Required when `type` is set to `document`**.<br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) containing a document.  |
|**`image`** | **Required when `type` is set to `image`**.<br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) containing an image.  |
|**`interactive`** | **Required when `type` is set to `interactive`**.<br/> An [interactive object](#68fe0550-aba5-4ee3-b79d-0846f3dddef1). This option is used to send List Messages and Reply Buttons.<br/><br/>The components of each interactive object generally follow a consistent pattern: **`header`**, **`body`**, **`footer`**, and **`action`**. |
|**`location`** | **Required when type `type` is set to `location`**.<br/> A [location object](#2ad90ff7-6fef-40a8-96cf-83f1144763c1).  |
|**`reaction`** | **Required when type `type` is set to `reaction`**. <br/> A [reaction object](). |
|**`sticker`** | **Required when `type` is set to `sticker`**.<br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) containing a sticker. Currently, we only support third-party static stickers. Static stickers must be 512x512 pixels and cannot exceed 100 KB. Animated stickers must be 512x512 pixels and cannot exceed 500 KB.|
|**`video`** | **Required when `type` is set to `video`**.<br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) containing a video.  |
|**`template`** | **Required when type is set to `template`**.<br/> A [template object](#fb5ad9b7-7991-443a-a1b5-97fdc5731673).  |

#### Text Object

A **`Text Object`** consists of the following fields and formatting options:

#### Fields

| Name           |  Description |
|----------------|--------------|
| **`body`**     | **Required for text messages**.<br/>The text of the text message that can contain URLs and supports formatting. To view available formatting options, see [Text Object Formatting Options](https://developers.facebook.com/docs/whatsapp/api/messages#formatting). <br/><br/>If you include URLs in your text **and** want to include a preview box in text messages (`"preview_url": true`), ensure it starts with `http://` or `https://`. You must include a hostname, since IP addresses are not matched.<br/><br/>Maximum length: 4096 characters. |
|**`preview_url`**<br/>type: `Boolean`| **Optional**.<br/>By default, WhatsApp recognizes URLs and makes them clickable, but you can also include a preview box with more information about the link. Set this field to `true` if you want to include a URL preview box.<br/><br/>The majority of the time when you send a URL, whether with a preview or not, the receiver of the message will see a URL that they can click on.<br/><br/>URL previews are only rendered after one of the following has occurred:<ul><li>The business has sent a message template to the user.</li><li>The user initiates a conversation with a "click to chat" link.</li><li>The user adds the business phone number to their address book and initiates a conversation.</li></ul><br/>**Default**: `false`|

#### Reaction Object

The `Reaction Object` consists of a message ID and a emoji.

#### Fields

| Name            | Description         |
|-----------------|---------------------|
| **`message_id`**        | **Required**.<br/><br/>Specifies the WhatsApp message ID (WAMID) that this reaction is being sent to. <br/><br/> You cannot send a reaction to a **`message_id`** that previously sent or received reaction messages. |
| **`emoji`**      | **Required**.<br/><br/>The emoji used for the reaction.<br/><br/>All emojis are supported, however only one emoji can be sent in a reaction message. Set this value to "" (empty string) to remove the reaction. <br/>Unicode is not supported. However, unicode values can be Java or JavaScript-escape encoded. |

#### Media Object

The `Media Object` consists of audio, document, image, sticker, and video objects.

#### Fields

| Name            | Description         |
|-----------------|---------------------|
| **`id`**        | **Required when type is an image, audio, document, sticker, or video and you are not using a link**.<br/>The media object ID. For more information, see [Get Media ID](#39a02bc0-ede1-4848-b24e-4ac3d501aaea). |
| **`link`**      | **Required when type is audio, document, image, sticker, or video and you are not using an uploaded media ID.** <br/>The protocol and URL of the media to be sent. Use only with HTTP/HTTPS URLs. |
| **`caption`** | **Optional**.<br/>Describes the specified image, document, or video. Do not use it with audio or sticker media.|
|**`filename`** | **Optional**. <br/> Describes the filename for the specific document. Use only with document media.|

#### Template Object

The `Template Object` contains the following fields:

#### Fields

| Name             | Description              |
|------------------|--------------------------|
| **`name`**  |**Required**. <br/> The name of the template. |
| **`language`**  |**Required**. <br/> Specifies a [language object](https://documenter.getpostman.com/view/13382743/UVC5FTHT?fbclid=IwAR083mCseNzJm-JgxlIQbdF30hkAbEOHkbBaw9bA7-isGKU6uwtq1RJKc0o#d9272e38-c3db-458c-a23b-07953abc73a4). Specifies the language the template may be rendered in.<br/><br/>Only the **`deterministic`** language policy works with media template messages.|
| **`components`**  |**Optional**. <br/> An array of [components objects](https://documenter.getpostman.com/view/13382743/UVC5FTHT?fbclid=IwAR0V3m0B47q6rsaPsrwcWzb5FbNtQD7K8I1RulisTB4Mj-rB0AYiSkdc9lY#8225365a-acb8-48c7-8e57-079dfc532865) that contain the parameters of the message. |

#### Language Object

The `Language Object` contains the following fields:

#### Fields

| Name             | Description              |
|------------------|--------------------------|
| **`policy`**  |**Optional**. <br/> For more information, see [Language Policy Options](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#language-policy-options). <br/><br/> **Default** (and only supported value): `deterministic`|
| **`code`**  |**Required**. <br/>The code of the language or locale to use. This field accepts both language (for example, `‘en’`) and language_locale (for example, `‘en_US’`) formats. <br/> For more information regarding all codes, see [Supported Languages](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages). |

#### Components Object

The `Components Object` contains the following fields:

#### Fields

| Name             | Description              |
|------------------|--------------------------|
| **`type`**  |**Required**. <br/> Describes the component type. <br/><br/> **Values**: `header`, `body`, `button` <br/> For text-based templates, only `body` is supported. |
| **`parameters`**  |**Required when type is `button`**. <br/> The namespace of the template. |
| **`sub_type`**  |**Required when type is `button`. Not used for the other types.**<br/> The type of button to create. <br/><br/>**Values**: `quick_reply`, `url`|
| **`index`**  |**Required when type is `button`. Not used for the other types.** <br/> The position index of the button. You can have up to 3 buttons using index values of 0 to 2. |

#### Parameter Object

The **`Parameter Object`** contains the following fields:

#### Fields

| Name             | Description              |
|------------------|--------------------------|
| **`type`**       |**Required**. <br/> Describes the parameter type. <br/><br/><br/>**Values**: `text`, `currency`, `date_time`, `image`, `document`<br/><br/>For text-based templates, the only supported parameter types are `text`, `currency`, and `date_time` |
| **`text`**       |**Required when type=`text`**. <br/> The message of the text.<br/>For the `header component`, the character limit is 60 characters. <br/>For the `body component`, the character limit is 1024.<br/><br/>The exception to these character limits applies to template messages in the following conditions:<br/><ul><li>When sending a **`template`** message with a **`body`** component only, the character limit for the `text` parameter and the full template text is 32768 characters.</li><li>When sending a **`template`** message with **`body`** and other components, The character limit for the `text` parameter and the full template text is 1024 characters.</li><ul/>|
| **`currency`**       |**Required when type is `currency`**. <br/> A [currency object](#424b70af-ced8-456d-b1e1-1360c5afb9e9).|
| **`date_time`**       |**Required when type is `date_time`**. <br/> A [date_time object](#ec955b05-7bd4-4273-ad87-ae755b580f6e).|
| **`image`**       |**Required when type is `image`**. <br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) of type image.|
| **`document`**       |**Required when type is `document`**. <br/> A [media object](#77f64012-481d-45d8-855f-e1620c6b2a5e) of type document. <br/>Only PDF documents are supported for media-based message templates.|

#### Currency Object

The `Currency Object` contains the following fields:

#### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`fallback_value`** |**Required**. <br/> The default text if localization fails. <br/> |
| **`code`**           |**Required**. <br/> The currency code as defined in [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes). <br/> |
| **`amount_1000`**           |**Required**. <br/> The amount multiplied by 1000. <br/> |

#### Date_Time Object

The `Date_Time Object` contains the following fields:

#### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`fallback_value`** | **Required**. <br/> The default text if localization fails. |
| **`day_of_week`**    | **Optional**. <br/> If it is different from the value derived from the date (if specified), use the derived value. Both strings and numbers are accepted.<br/>Supported values: <ul><li>`"MONDAY"` or 1</li><li>`"TUESDAY"` or 2</li><li>`"WEDNESDAY"` or 3</li><li>`"THURSDAY"` or 4</li><li>`"FRIDAY"` or 5</li><li>`"SATURDAY"` or 6</li><li>`"SUNDAY"` or 7</li></ul> |
| **`year`** | **Optional**. <br/> Specifies the year. |
| **`month`** | **Optional**. <br/> Specifies the month. |
| **`day_of_month`** | **Optional**. <br/> Specifies the day of the month. |
| **`hour`** | **Optional**. <br/> Specifies the hour. |
| **`minute`** | **Optional**. <br/> Specifies the minute. |
| **`calendar`** | **Optional**. <br/> The type of calendar.<br/><br/>**Values**: `"GREGORIAN"` or `"SOLAR_HIJRI"`. |

#### Button Parameter Object

The `Button Parameter Object` contains the following fields:

#### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`type`** | **Required**. <br/> Specifies the type of parameter for the button. <br/><br/>**Values**: `payload`,`text`|
| **`payload`** | **Required for `quick_reply` buttons**. <br/> Developer-defined payload that is returned when the button is clicked in addition to the display text on the button.<br/><br/>For more information on usage, see [Callback from a Quick Reply Button Click](#eb99d8fb-170a-4284-b7da-454484a0333a).|
| **`text`** | **Required for url buttons**. <br/> Developer-provided suffix that is appended to the predefined prefix URL in the template.|

#### Contacts Object

The `Contacts Object` contains the following fields:

#### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`addresses`** | **Optional**. <br/> Specifies an array of address objects. For more information, see [address object](https://developers.facebook.com/docs/whatsapp/api/messages#addresses-object).|
| **`birthday`** | **Optional**. <br/> A **YYYY-MM-DD** formatted string.|
| **`emails`** | **Optional**. <br/> Specifies an array of email objects. For more information, see [emails object](https://developers.facebook.com/docs/whatsapp/api/messages#emails-object).|
| **`name`** | **Required**. <br/> Specifies the name object. For more information, see [name object](https://developers.facebook.com/docs/whatsapp/api/messages#name-object).|
| **`org`** | **Optional**. <br/> Specifies the org object. For more information, see [org object](https://developers.facebook.com/docs/whatsapp/api/messages#org-object).|
| **`phones`** | **Optional**. <br/> Specifies an array of phone objects. For more information, see [phone object](https://developers.facebook.com/docs/whatsapp/api/messages#phone-object).|
| **`urls`** | **Optional**. <br/> Specifies an array of url objects. For more information, see [url object](https://developers.facebook.com/docs/whatsapp/api/messages#urls-object).|

##### addresses Object

| Name | Description |
| --- | --- |
| **`street`** | **Optional**.  <br>Steet number and name. |
| **`city`** | **Optional**.  <br>The name of the city. |
| **`state`** | **Optional**.  <br>The abbreviation name of the state. |
| **`zip`** | **Optional**.  <br>The ZIP code. |
| **`country`** | **Optional**.  <br>The full name of the country. |
| **`country_code`** | **Optional**.  <br>The two-letter country abbreviation. |
| **`type`** | **Optional**.  <br>Standard values: `HOME`, `WORK`. |

##### emails Object

| Name | Description |
| --- | --- |
| **`email`** | **Optional**.  <br>Email address. |
| **`type`** | **Optional**.  <br>Standard Values: `HOME`, `WORK` |

##### name Object

| Name | Description |
|---|---|
| **`formatted_name`** | **Required.**<br>Full name, as it normally appears. |
| **`first_name`** | **Optional**.<br>First name.|
| **`last_name`** | **Optional**.<br>Last name. |
| **`middle_name`** | **Optional**.<br>Middle name. |
| **`suffix`** | **Optional**.<br>Name suffix.|
| **`prefix`**| **Optional**.<br>Name prefix. |

* At least one of the optional parameters needs to be included along with the **`formatted_name`** parameter.

##### org Object

| Name | Description |
| --- | --- |
| **`company`** | **Optional.**  <br>Name of the contact's company. |
| **`department`** | **Optional.**  <br>Name of the contact's department. |
| **`title`** | **Optional.**  <br>The contact's business title. |

##### phone Object

| Name | Description |
| --- | --- |
| **`phone`** | **Optional.**  <br>Automatically populated with the **`wa_id`** value as a formatted phone number. |
| **`type`** | **Optional.**  <br>Standard Values: `CELL`, `MAIN`, `IPHONE`, `HOME`, `WORK` |
| **`wa_id`** | **Optional.**  <br>WhatsApp ID. |

##### urls Object

| Name | Description |
| --- | --- |
| **`url`** | **Optional.**  <br>The URL. |
| **`type`** | **Optional.**  <br>Standard Values: `HOME`, `WORK` |

#### Location Object

The `Location Object` contains the following fields:

<h5>Fields</h5>

| Name                 | Description              |
|----------------------|--------------------------|
| **`longitude`** | **Required**. <br/> The longitude of the location.|
| **`latitude`** | **Required**. <br/> The latitude of the location.|
| **`name`** | **Optional**. <br/> The name of the location.|
| **`address`** | **Optional**. <br/> The address of the location. This field is only displayed if **`name`** is present.|

#### Interactive Object

The **`Interactive Object`** contains four main components: **`header`**, **`body`**, **`footer`**, and **`action`**. Additionally, some of those components can contain one or more different objects:

* Inside **`header`**, you can nest **`media`** objects.
* Inside **`action`**, you can nest **`section`** and **`button`** objects.

#### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`type`**      | **Required**.<br/>The type of interactive message you want to send. Supported values:<ul><li>`list`: Use it for List Messages.</li><li>`button`: Use it for Reply Buttons.</li><li>`product`: Use this for Single Product Messages</li><li>`product_list`: Use this for Multi-Product Messages</li></ul>|
| **`header`**      | **Required for type `product_list`**. **Optional for other types**.<br/>This contains the header content displayed on top of a message. You cannot set a **`header`** if your **`interactive`** object is type `product`.<br/><br/>The **`header`** object contains the following fields:<ul><li>`document`: **Required** if **`type`** is set to `document`. Contains the **`media`** object with the document.</li><li>`image`: **Required** if **`type`** is set to `image`. Contains the **`media`** object with the image.</li><li>`video`: **Required** if **`type`** is set to `video`. Contains the **`media`** object with the video.</li><li>`text`: **Required** if **`type`** is set to `text`. The text for the header. Formatting allows emojis, but not markdown. Maximum length: 60 characters.</li></ul><br/><br/>Supported interactive message type by header type:<ul><li>`text` - for List Messages, Reply Buttons, and Multi-Product Messages</li><li>`video` - for Reply Buttons.</li><li>`image`: for Reply Buttons.</li><li>`document` - For Reply Buttons.</li></ul>|
| **`body`**      |  **Optional** for type `product`. **Required** for all other message types.<br/>The body of the message. The **`text`** field for the **`body`** object supports Emojis and markdown.<br/><br/>Maximum length: 1024 characters.|
| **`footer`**      | **Optional**.<br/>An object with the footer of the message.Emojis and markdown are supported.<br/><br/>Maximum length: 60 characters.|
| **`action`**      | **Required**.<br/>The action you want the user to perform after reading the message.|

##### Header Object

##### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`type`**      | **Required**.<br/>The header type you would like to use. Supported values are:<ul><li>`text`: Used for List Messages, Reply Buttons, and Multi-Product Messages.</li><li>`video`: Used for Reply Buttons.</li><li>`image`: Used for Reply Buttons.</li><li>`document`: Used for Reply Buttons.</li></ul>|
| **`text`**      | **Required if `type` is set to `text`**.<br/>The text for the header. Formatting allows emojis, but not markdown.<br/><br/>Maximum length: 60 characters.|
| **`video`**      | **Required if `type` is set to `video`**.<br/>Contains the **`media`** object for this video.|
| **`image`**      | **Required if `type` is set to `image`**.<br/>Contains the **`media`** object for this image.|
| **`document`**      | **Required if `type` is set to `document`**.<br/>Contains the **`media`** object for this document.|

##### Body Object

##### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`text`**      | **Required**.<br/>The body content of the message. Emojis and markdown are supported. Links are supported.<br/><br/>Maximum length: 1024 characters.|

##### Footer Object

##### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`text`**      | **Required if the `footer` object is present**.<br/>The footer content of the message. Emojis and markdown are supported. Links are supported.<br/><br/>Maximum length: 60 characters.|

##### Action Object

##### Fields

| Name                 | Description              |
|----------------------|--------------------------|
| **`button`**      | **Required for all List Messages**.<br/>The Button content. It cannot be an empty string and must be unique within the message. Does not allow emojis or markdown.<br/><br/>Maximum length: 20 characters.|
| **`buttons`**      | **Required for Reply Button**.<br/>A button can contain the following parameters:<ul><li>**`type`**: only supported if **`type`**=**`reply`**(for Reply Button)</li><li>**`title`**: The Button title. It cannot be an empty string and must be unique within the message. Does not allow emojis or markdown. Maximum length: 20 characters.</li><li>**`id`**: Unique identifier for your button. This ID is returned in the Webhook when the button is clicked by the user. Maximum length: 256 characters.</li></ul><br/>You can have a maximum of 3 buttons.|
| **`sections`**      | **Required for List Messages and Multi-Product Messages**.<br/>The array of **`section`** objects. There is a minimum of 1 and maximum of 10. For more information, see [section object](#).|
| **`catalog_id`**  |  **Required for Single Product and Multi-Product messages.**<br/><br/>Unique identifier of the Facebook catalog linked to your WhatsApp Business Account. **`catalog_id`** can be retrieved through [Commerce Manager](https://business.facebook.com/commerce/). |
| **`product_retailer_id`**  | **Required for Single Product and Multi-Product messages.**<br/><br/> The unique identifier of the product in the catalog.<br/><br/>To get the **`product_retailer_id`**, go to [Commerce Manager](https://business.facebook.com/commerce/), select your Facebook Business account, and you will see a list of shops connected to your account. Click the shop you want to use. On the left-side panel, click **Catalog** > **Items**, and find the item you want to mention. The ID for that item is displayed under the item's name.     |

##### Section Object

##### Fields

| Name | Description |
| --- | --- |
| **`title`** | **Required if the message has more than one** **`section`**.  <br/>The title of the section.  <br/>  <br/>Maximum length: 24 characters. |
| **`rows`** | **Required for List Messages**.  <br/Contains a list of rows. You can have a maximum of 10 rows across your sections.  <br/><br/>Each row must have a **`title`** (Maximum length: 24 characters) and an **`ID`** (Maximum length: 200 characters). You can add a **`description`** (Maximum length: 72 characters), but it is optional. |
| **`product_items`** | **Required for Multi-Product Messages**.<br/><br/>Specifies an array of `product` objects.<br/>There is a minimum of 1 product per section and a maximum of 30 products across all sections.<br/><br/>Each `product` object contains the following field:<br/>**`product_retailer_id`** – **Required for Multi-Product Messages**. Specifies the unique identifier of the product in a catalog. To get this ID, go to [Commerce Manager](https://business.facebook.com/commerce/), select your account and the shop you want to use. Then, click **Catalog** > **Items**, and find the item you want to mention. The ID for that item is displayed under the item's name.


##### **`Rows`** Example

``` json
"rows": [
  {
   "id":"unique-row-identifier-here",
   "title": "row-title-content-here",
   "description": "row-description-content-here",
   }
]

```

### Send Text Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",    
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "text",
    "text": {
        "preview_url": false,
        "body": "Hello world"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Text Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "text",
    "text": {
        "preview_url": false,
        "body": "<TEXT_MSG_CONTENT>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Text Message with Preview URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "text": {
        "preview_url": true,
        "body": "Please visit https://youtu.be/hpltvTEiRrY to inspire your day!"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "15555551234",
      "wa_id": "<WHATSAPP_ID>"
    }],
  "messages": [{
      "id": "wamid.ID"
    }]
}
```

---

### Send Reply with Reaction Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "reaction",
    "reaction": {
        "message_id": "<WAM_ID>",
        "emoji": "<EMOJI>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "<PHONE_NUMBER>",
            "wa_id": "<WHATSAPP_ID>"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgLM..."
        }
    ]
}
```

---

### Send Image Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "image",
    "image": {
        "id": "<IMAGE_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}

```

---

### Send Reply to Image Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "image",
    "image": {
        "id": "<IMAGE_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Image Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "image",
    "image": {
        "link": "http(s)://image-url"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Image Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "image",
    "image": {
        "link": "http(s)://image-url"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Audio Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "audio",
    "audio": {
        "id": "<AUDIO_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Audio Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "audio",
    "audio": {
        "id": "<AUDIO_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Audio Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "audio",
    "audio": {
        "link": "http(s)://audio-url"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Audio Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "audio",
    "audio": {
        "link": "http(s)://audio-url"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Document Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "document",
    "document": {
        "id": "<DOCUMENT_OBJECT_ID>",
        "caption": "<DOCUMENT_CAPTION_TO_SEND>",
        "filename": "<DOCUMENT_FILENAME>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Document Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "document",
    "document": {
        "id": "<DOCUMENT_OBJECT_ID>",
        "caption": "<DOCUMENT_CAPTION_TO_SEND>",
        "filename": "<DOCUMENT_FILENAME>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Document Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "document",
    "document": {
        "link": "<http(s)://document-url>",
        "caption": "<DOCUMENT_CAPTION_TEXT>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Document Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "document",
    "document": {
        "link": "<http(s)://document-url>",
        "caption": "<DOCUMENT_CAPTION_TEXT>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Sticker Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "sticker",
    "sticker": {
        "id": "<MEDIA_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Sticker Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "sticker",
    "sticker": {
        "id": "<MEDIA_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Sticker Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "sticker",
    "sticker": {
        "link": "<http(s)://sticker-url>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Sticker Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "sticker",
    "sticker": {
        "link": "<http(s)://sticker-url>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Video Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "video",
    "video": {
        "caption": "<VIDEO_CAPTION_TEXT>",
        "id": "<VIDEO_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Video Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "video",
    "video": {
        "caption": "<VIDEO_CAPTION_TEXT>",
        "id": "<VIDEO_OBJECT_ID>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Video Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "video",
    "video": {
        "link": "<http(s)://video-url>",
        "caption": "<VIDEO_CAPTION_TEXT>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Video Message by URL

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_MSG_YOU_ARE_REPLYING_TO>"
    },
    "type": "video",
    "video": {
        "link": "<http(s)://video-url>",
        "caption": "<VIDEO_CAPTION_TEXT>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Contact Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "type": "contacts",
    "contacts": [
        {
            "addresses": [
                {
                    "street": "<ADDRESS_STREET>",
                    "city": "<ADDRESS_CITY>",
                    "state": "<ADDRESS_STATE>",
                    "zip": "<ADDRESS_ZIP>",
                    "country": "<ADDRESS_COUNTRY>",
                    "country_code": "<ADDRESS_COUNTRY_CODE>",
                    "type": "<HOME|WORK>"
                }
            ],
            "birthday": "<CONTACT_BIRTHDAY>",
            "emails": [
                {
                    "email": "<CONTACT_EMAIL>",
                    "type": "<WORK|HOME>"
                }
            ],
            "name": {
                "formatted_name": "<CONTACT_FORMATTED_NAME>",
                "first_name": "<CONTACT_FIRST_NAME>",
                "last_name": "<CONTACT_LAST_NAME>",
                "middle_name": "<CONTACT_MIDDLE_NAME>",
                "suffix": "<CONTACT_SUFFIX>",
                "prefix": "<CONTACT_PREFIX>"
            },
            "org": {
                "company": "<CONTACT_ORG_COMPANY>",
                "department": "<CONTACT_ORG_DEPARTMENT>",
                "title": "<CONTACT_ORG_TITLE>"
            },
            "phones": [
                {
                    "phone": "<CONTACT_PHONE>",
                    "wa_id": "<CONTACT_WA_ID>",
                    "type": "<HOME|WORK>"
                }
            ],
            "urls": [
                {
                    "url": "<CONTACT_URL>",
                    "type": "<HOME|WORK>"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Contact Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "contacts",
    "contacts": [
        {
            "addresses": [
                {
                    "street": "<ADDRESS_STREET>",
                    "city": "<ADDRESS_CITY>",
                    "state": "<ADDRESS_STATE>",
                    "zip": "<ADDRESS_ZIP>",
                    "country": "<ADDRESS_COUNTRY>",
                    "country_code": "<ADDRESS_COUNTRY_CODE>",
                    "type": "<HOME|WORK>"
                }
            ],
            "birthday": "<CONTACT_BIRTHDAY>",
            "emails": [
                {
                    "email": "<CONTACT_EMAIL>",
                    "type": "<WORK|HOME>"
                }
            ],
            "name": {
                "formatted_name": "<CONTACT_FORMATTED_NAME>",
                "first_name": "<CONTACT_FIRST_NAME>",
                "last_name": "<CONTACT_LAST_NAME>",
                "middle_name": "<CONTACT_MIDDLE_NAME>",
                "suffix": "<CONTACT_SUFFIX>",
                "prefix": "<CONTACT_PREFIX>"
            },
            "org": {
                "company": "<CONTACT_ORG_COMPANY>",
                "department": "<CONTACT_ORG_DEPARTMENT>",
                "title": "<CONTACT_ORG_TITLE>"
            },
            "phones": [
                {
                    "phone": "<CONTACT_PHONE>",
                    "wa_id": "<CONTACT_WA_ID>",
                    "type": "<HOME|WORK>"
                }
            ],
            "urls": [
                {
                    "url": "<CONTACT_URL>",
                    "type": "<HOME|WORK>"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Location Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "location",
    "location": {
        "latitude": "<LOCATION_LATITUDE>",
        "longitude": "<LOCATION_LONGITUDE>",
        "name": "<LOCATION_NAME>",
        "address": "<LOCATION_ADDRESS>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Reply to Location Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "location",
    "location": {
        "latitude": "<LOCATION_LATITUDE>",
        "longitude": "<LOCATION_LONGITUDE>",
        "name": "<LOCATION_NAME>",
        "address": "<LOCATION_ADDRESS>"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Message Template Text

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "template-name",
        "language": {
            "code": "language-and-locale-code"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "text-string"
                    },
                    {
                        "type": "currency",
                        "currency": {
                            "fallback_value": "$100.99",
                            "code": "USD",
                            "amount_1000": 100990
                        }
                    },
                    {
                        "type": "date_time",
                        "date_time": {
                            "fallback_value": "February 25, 1977",
                            "day_of_week": 5,
                            "year": 1977,
                            "month": 2,
                            "day_of_month": 25,
                            "hour": 15,
                            "minute": 33,
                            "calendar": "GREGORIAN"
                        }
                    }
                ]
            }
        ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Message Template Media

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "template-name",
        "language": {
            "code": "language-and-locale-code"
        },
        "components": [
            {
                "type": "header",
                "parameters": [
                    {
                        "type": "image",
                        "image": {
                            "link": "http(s)://the-image-url"
                        }
                    }
                ]
            },
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "text-string"
                    },
                    {
                        "type": "currency",
                        "currency": {
                            "fallback_value": "$100.99",
                            "code": "USD",
                            "amount_1000": 100990
                        }
                    },
                    {
                        "type": "date_time",
                        "date_time": {
                            "fallback_value": "February 25, 1977",
                            "day_of_week": 5,
                            "year": 1977,
                            "month": 2,
                            "day_of_month": 25,
                            "hour": 15,
                            "minute": 33,
                            "calendar": "GREGORIAN"
                        }
                    }
                ]
            }
        ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Message Template Interactive

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "template-name",
        "language": {
            "code": "language-and-locale-code"
        },
        "components": [
            {
                "type": "header",
                "parameters": [
                    {
                        "type": "image",
                        "image": {
                            "link": "http(s)://the-image-url"
                        }
                    }
                ]
            },
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "text-string"
                    },
                    {
                        "type": "currency",
                        "currency": {
                            "fallback_value": "$100.99",
                            "code": "USD",
                            "amount_1000": 100990
                        }
                    },
                    {
                        "type": "date_time",
                        "date_time": {
                            "fallback_value": "February 25, 1977",
                            "day_of_week": 5,
                            "year": 1977,
                            "month": 2,
                            "day_of_month": 25,
                            "hour": 15,
                            "minute": 33,
                            "calendar": "GREGORIAN"
                        }
                    }
                ]
            },
            {
                "type": "button",
                "sub_type": "quick_reply",
                "index": "0",
                "parameters": [
                    {
                        "type": "payload",
                        "payload": "aGlzIHRoaXMgaXMgY29v"
                    }
                ]
            },
            {
                "type": "button",
                "sub_type": "quick_reply",
                "index": "1",
                "parameters": [
                    {
                        "type": "payload",
                        "payload": "9rwnB8RbYmPF5t2Mn09x4h"
                    }
                ]
            }
        ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send List Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "list",
        "header": {
            "type": "text",
            "text": "<HEADER_TEXT>"
        },
        "body": {
            "text": "<BODY_TEXT>"
        },
        "footer": {
            "text": "<FOOTER_TEXT>"
        },
        "action": {
            "button": "<BUTTON_TEXT>",
            "sections": [
                {
                    "title": "<LIST_SECTION_1_TITLE>",
                    "rows": [
                        {
                            "id": "<LIST_SECTION_1_ROW_1_ID>",
                            "title": "<SECTION_1_ROW_1_TITLE>",
                            "description": "<SECTION_1_ROW_1_DESC>"
                        },
                        {
                            "id": "<LIST_SECTION_1_ROW_2_ID>",
                            "title": "<SECTION_1_ROW_2_TITLE>",
                            "description": "<SECTION_1_ROW_2_DESC>"
                        }
                    ]
                },
                {
                    "title": "<LIST_SECTION_2_TITLE>",
                    "rows": [
                        {
                            "id": "<LIST_SECTION_2_ROW_1_ID>",
                            "title": "<SECTION_2_ROW_1_TITLE>",
                            "description": "<SECTION_2_ROW_1_DESC>"
                        },
                        {
                            "id": "<LIST_SECTION_2_ROW_2_ID>",
                            "title": "<SECTION_2_ROW_2_TITLE>",
                            "description": "<SECTION_2_ROW_2_DESC>"
                        }
                    ]
                }
            ]
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "15555551234",
      "wa_id": "<WHATSAPP_ID>"
    }],
  "messages": [{
      "id": "wamid.ID"
    }]
}
```

---

### Send Reply to List Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "interactive",
    "interactive": {
        "type": "list",
        "header": {
            "type": "text",
            "text": "<HEADER_TEXT>"
        },
        "body": {
            "text": "<BODY_TEXT>"
        },
        "footer": {
            "text": "<FOOTER_TEXT>"
        },
        "action": {
            "button": "<BUTTON_TEXT>",
            "sections": [
                {
                    "title": "<LIST_SECTION_1_TITLE>",
                    "rows": [
                        {
                            "id": "<LIST_SECTION_1_ROW_1_ID>",
                            "title": "<SECTION_1_ROW_1_TITLE>",
                            "description": "<SECTION_1_ROW_1_DESC>"
                        },
                        {
                            "id": "<LIST_SECTION_1_ROW_2_ID>",
                            "title": "<SECTION_1_ROW_2_TITLE>",
                            "description": "<SECTION_1_ROW_2_DESC>"
                        }
                    ]
                },
                {
                    "title": "<LIST_SECTION_2_TITLE>",
                    "rows": [
                        {
                            "id": "<LIST_SECTION_2_ROW_1_ID>",
                            "title": "<SECTION_2_ROW_1_TITLE>",
                            "description": "<SECTION_2_ROW_1_DESC>"
                        },
                        {
                            "id": "<LIST_SECTION_2_ROW_2_ID>",
                            "title": "<SECTION_2_ROW_2_TITLE>",
                            "description": "<SECTION_2_ROW_2_DESC>"
                        }
                    ]
                }
            ]
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "15555551234",
      "wa_id": "<WHATSAPP_ID>"
    }],
  "messages": [{
      "id": "wamid.ID"
    }]
}
```

---

### Send Reply Button

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "button",
        "body": {
            "text": "<BUTTON_TEXT>"
        },
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {
                        "id": "<UNIQUE_BUTTON_ID_1>",
                        "title": "<BUTTON_TITLE_1>"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "<UNIQUE_BUTTON_ID_2>",
                        "title": "<BUTTON_TITLE_2>"
                    }
                }
            ]
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "PHONE_NUMBER",
      "wa_id": "WHATSAPP_ID"
    }],
  "messages": [{
      "id": "wamid.ID"
    }]
}
```

---

### Mark Message As Read

**Method:** `PUT`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "status": "read",
    "message_id": "<INCOMING_MSG_ID>"
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

### Send Single Product Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "product",
        "body": {
            "text": "<OPTIONAL_BODY_TEXT>"
        },
        "footer": {
            "text": "<OPTIONAL_FOOTER_TEXT>"
        },
        "action": {
            "catalog_id": "367025965434465",
            "product_retailer_id": "<ID_TEST_ITEM_1>"
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}

```

---

### Send Multi-Product Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "product_list",
        "header": {
            "type": "<HEADER_TYPE>",
            "text": "<YOUR_TEXT_HEADER_CONTENT>"
        },
        "body": {
            "text": "<YOUR_TEXT_BODY_CONTENT>"
        },
        "footer": {
            "text": "<YOUR_TEXT_FOOTER_CONTENT>"
        },
        "action": {
            "catalog_id": "146265584024623",
            "sections": [
                {
                    "title": "<SECTION1_TITLE>",
                    "product_items": [
                        {
                            "product_retailer_id": "<YOUR_PRODUCT1_SKU_IN_CATALOG>"
                        },
                        {
                            "product_retailer_id": "<YOUR_SECOND_PRODUCT1_SKU_IN_CATALOG>"
                        }
                    ]
                },
                {
                    "title": "<SECTION2_TITLE>",
                    "product_items": [
                        {
                            "product_retailer_id": "<YOUR_PRODUCT2_SKU_IN_CATALOG>"
                        },
                        {
                            "product_retailer_id": "<YOUR_SECOND_PRODUCT2_SKU_IN_CATALOG>"
                        }
                    ]
                }
            ]
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}
```

---

### Send Catalog Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "catalog_message",
        "body": {
            "text": "Hello! Thanks for your interest. Ordering is easy. Just visit our catalog and add items to purchase."
        },
        "action": {
            "name": "catalog_message",
            "parameters": {
                "thumbnail_product_retailer_id": "2lc20305pt"
            }
        },
        "footer": {
            "text": "Best grocery deals on WhatsApp!"
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+16505551234",
            "wa_id": "16505551234"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgLMTY1MDM4Nzk0MzkVAgARGBI3NDMzMjc2N0VDNUVFNURBQzQA"
        }
    ]
}
```

---

### Send Catalog Template Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "intro_catalog_offer",
        "language": {
            "code": "en_US"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "100"
                    },
                    {
                        "type": "text",
                        "text": "400"
                    },
                    {
                        "type": "text",
                        "text": "3"
                    }
                ]
            },
            {
                "type": "button",
                "sub_type": "CATALOG",
                "index": 0,
                "parameters": [
                    {
                        "type": "action",
                        "action": {
                            "thumbnail_product_retailer_id": "2lc20305pt"
                        }
                    }
                ]
            }
        ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+16505551234",
            "wa_id": "16505551234"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgLMTY1MDM4Nzk0MzkVAgARGBJCOTY3NDc0NDFDRUI3NTA0Q0UA"
        }
    ]
}
```

---

## Templates

- Guide: [Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- Guide: [How To Monitor Quality Signals](https://developers.facebook.com/docs/whatsapp/guides/how-to-monitor-quality-signals)

### Get template by ID (default fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/<TEMPLATE_ID>`

**Example Response:**

Status: `200 OK`

```json
{
    "name": "2023_april_promo",
    "components": [
        {
            "type": "HEADER",
            "format": "TEXT",
            "text": "Fall Sale"
        },
        {
            "type": "BODY",
            "text": "Hi {{1}}, our Fall Sale is on! Use promo code {{2}} Get an extra 25% off every order above $350!",
            "example": {
                "body_text": [
                    [
                        "Mark",
                        "FALL25"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "Not interested in any of our sales? Tap Stop Promotions"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "QUICK_REPLY",
                    "text": "Stop promotions"
                }
            ]
        }
    ],
    "language": "en_US",
    "status": "APPROVED",
    "category": "MARKETING",
    "id": "920070352646140"
}
```

---

### Get template by name (default fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates?name=<TEMPLATE_NAME>`

**Query Parameters:**

- `name`: `<TEMPLATE_NAME>`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "2023_april_promo",
            "components": [
                {
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Fall Sale"
                },
                {
                    "type": "BODY",
                    "text": "Hi {{1}}, our Fall Sale is on! Use promo code {{2}} Get an extra 25% off every order above $350!",
                    "example": {
                        "body_text": [
                            [
                                "Mark",
                                "FALL25"
                            ]
                        ]
                    }
                },
                {
                    "type": "FOOTER",
                    "text": "Not interested in any of our sales? Tap Stop Promotions"
                },
                {
                    "type": "BUTTONS",
                    "buttons": [
                        {
                            "type": "QUICK_REPLY",
                            "text": "Stop promotions"
                        }
                    ]
                }
            ],
            "language": "en_US",
            "status": "REJECTED",
            "category": "MARKETING",
            "id": "920070352646140"
        }
    ],
    "paging": {
        "cursors": {
            "before": "MAZDZD",
            "after": "MjQZD"
        }
    }
}
```

---

### Get all templates (default fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "hello_world",
            "previous_category": "ACCOUNT_UPDATE",
            "components": [
                {
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Hello World"
                },
                {
                    "type": "BODY",
                    "text": "Welcome and congratulations!! This message demonstrates your ability to send a message notification from WhatsApp Business Platform’s Cloud API. Thank you for taking the time to test with us."
                },
                {
                    "type": "FOOTER",
                    "text": "WhatsApp Business API Team"
                }
            ],
            "language": "en_US",
            "status": "APPROVED",
            "category": "MARKETING",
            "id": "1192339204654487"
        },
        {
            "name": "2023_april_promo",
            "components": [
                {
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Fall Sale"
                },
                {
                    "type": "BODY",
                    "text": "Hi {{1}}, our Fall Sale is on! Use promo code {{2}} Get an extra 25% off every order above $350!",
                    "example": {
                        "body_text": [
                            [
                                "Mark",
                                "FALL25"
                            ]
                        ]
                    }
                },
                {
                    "type": "FOOTER",
                    "text": "Not interested in any of our sales? Tap Stop Promotions"
                },
                {
                    "type": "BUTTONS",
                    "buttons": [
                        {
                            "type": "QUICK_REPLY",
                            "text": "Stop promotions"
                        }
                    ]
                }
            ],
            "language": "en_US",
            "status": "APPROVED",
            "category": "MARKETING",
            "id": "920070352646140"
        }
    ],
    "paging": {
        "cursors": {
            "before": "MAZDZD",
            "after": "MjQZD"
        }
    }
}
```

---

### Get namespace

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}?fields=message_template_namespace`

**Query Parameters:**

- `fields`: `message_template_namespace`

**Example Response:**

Status: `200 OK`

```json
{
    "message_template_namespace": "58e6d318_b627_4112_b9c7_2961197553ea",
    "id": "104996122399160"
}
```

---

### Create authentication template w/ OTP copy code button

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "authentication_code_copy_code_button",
    "language": "en_US",
    "category": "AUTHENTICATION",
    "components": [
        {
            "type": "BODY",
            "add_security_recommendation": true
        },
        {
            "type": "FOOTER",
            "code_expiration_minutes": 10
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "OTP",
                    "otp_type": "COPY_CODE",
                    "text": "Copy Code"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "1473688840035974",
    "status": "APPROVED",
    "category": "AUTHENTICATION"
}
```

---

### Create authentication template w/ OTP one-tap autofill button

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "authentication_code_autofill_button",
    "language": "en_US",
    "category": "AUTHENTICATION",
    "components": [
        {
            "type": "BODY",
            "add_security_recommendation": true
        },
        {
            "type": "FOOTER",
            "code_expiration_minutes": 10
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "OTP",
                    "otp_type": "ONE_TAP",
                    "text": "Copy Code",
                    "autofill_text": "Autofill",
                    "package_name": "com.example.luckyshrub",
                    "signature_hash": "K8a%2FAINcGX7"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "771761447905391",
    "status": "APPROVED",
    "category": "AUTHENTICATION"
}
```

---

### Create catalog template

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "intro_catalog_offer",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "BODY",
            "text": "Now shop for your favourite products right here on WhatsApp! Get Rs {{1}} off on all orders above {{2}}Rs! Valid for your first {{3}} orders placed on WhatsApp!",
            "example": {
                "body_text": [
                    [
                        "100",
                        "400",
                        "3"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "Best grocery deals on WhatsApp!"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "CATALOG",
                    "text": "View catalog"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "category" : "MARKETING",
    "id" : "188720130491317",
    "status" : "PENDING"
}
```

---

### Create multi-product message template

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "abandoned_cart",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "HEADER",
            "format": "TEXT",
            "text": "Forget something {{1}}?",
            "example": {
                "header_text": [
                    "Pablo"
                ]
            }
        },
        {
            "type": "BODY",
            "text": "Looks like you left some items in your cart! Use code {{1}} and you can get 10% off of all of them!",
            "example": {
                "body_text": [
                    [
                        "10OFF"
                    ]
                ]
            }
        },
        {
            "type":"BUTTONS",
            "buttons": [
                {
                    "type": "MPM",
                    "text": "View items"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "1986030731777856",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

### Create template w/ text header, text body, text footer, and 2 quick reply buttons

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "seasonal_promotion_text_only",
    "language": "en",
    "category": "MARKETING",
    "components": [
        {
            "type": "HEADER",
            "format": "TEXT",
            "text": "Our {{1}} is on!",
            "example": {
                "header_text": [
                    "Summer Sale"
                ]
            }
        },
        {
            "type": "BODY",
            "text": "Shop now through {{1}} and use code {{2}} to get {{3}} off of all merchandise.",
            "example": {
                "body_text": [
                    [
                        "the end of August","25OFF","25%"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "Use the buttons below to manage your marketing subscriptions"
        },
        {
            "type":"BUTTONS",
            "buttons": [
                {
                    "type": "QUICK_REPLY",
                    "text": "Unsubcribe from Promos"
                },
                {
                    "type":"QUICK_REPLY",
                    "text": "Unsubscribe from All"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "1627019861106475",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

### Create template w/ image header, text body, text footer, and 2 call-to-action buttons

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "limited_time_offer_tuscan_getaway_2023",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "HEADER",
            "format": "IMAGE",
            "example": {
                "header_handle": [
                    "4::aW..."
                ]
            }
        },
        {
            "type": "BODY",
            "text": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
            "example": {
                "body_text": [
                    [
                        "Mark","Tuscan Getaway package","800"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "Offer valid until May 31, 2023"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "PHONE_NUMBER",
                    "text": "Call",
                    "phone_number": "15550051310"
                },
                {
                    "type": "URL",
                    "text": "Shop Now",
                    "url": "https://www.examplesite.com/shop?promo={{1}}",
                    "example": [
                        "summer2023"
                    ]
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "558456123149285",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

### Create template w/ location header, text body, text footer, and a website buttons

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "order_delivery_update",
    "language": "en_US",
    "category": "UTILITY",
    "components": [
        {
            "type": "HEADER",
            "format": "LOCATION"
        },
        {
            "type": "BODY",
            "text": "Good news {{1}}! Your order #{{2}} is on its way to the location above. Thank you for your order!",
            "example": {
                "body_text": [
                    [
                        "Mark",
                        "566701"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "To stop receiving delivery updates, tap the button below."
        },
        {
            "type":"BUTTONS",
            "buttons": [
                {
                    "type": "QUICK_REPLY",
                    "text": "Stop Delivery Updates"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "1667192013751005",
    "status": "PENDING",
    "category": "UTILITY"
}
```

---

### Create template w/ document header, text body, a phone number button, and a URL button

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
  "name": "order_confirmation",
  "language": "en_US",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "DOCUMENT",
      "example": {
        "header_handle": [
          "4::YXBwbGljYXRpb24vcGRm:ARZVv4zuogJMxmAdS3_6T4o_K4ll2806avA7rWpikisTzYPsXXUeKk0REjS-hIM1rYrizHD7rQXj951TKgUFblgd_BDWVROCwRkg9Vhjj-cHNQ:e:1681237341:634974688087057:100089620928913:ARa1ZDhwbLZM3EENeeg"
         ]
      }
    },
    {
      "type": "BODY",
      "text": "Thank you for your order, {{1}}! Your order number is {{2}}. Tap the PDF linked above to view your receipt. If you have any questions, please use the buttons below to contact support. Thanks again!",
      "example": {
        "body_text": [
          [
            "Mark","860198-230332"
          ]
        ]
      }
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "PHONE_NUMBER",
          "text": "Call",
          "phone_number": "16467043595"
        },
        {
          "type": "URL",
          "text": "Contact Support",
          "url": "https://www.examplesite.com/support"
        }
      ]
    }
  ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "1689556908129832",
    "status": "PENDING",
    "category": "UTILITY"
}
```

---

### Edit template

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/<TEMPLATE_ID>`

**Request Body:**

```json
{
    "name": "2023_april_promo",
    "components": [
        {
            "type": "HEADER",
            "format": "TEXT",
            "text": "Fall Sale"
        },
        {
            "type": "BODY",
            "text": "Hi {{1}}, our Fall Sale is on! Use promo code {{2}} Get an extra 25% off every order above $350!",
            "example": {
                "body_text": [
                    [
                        "Mark",
                        "FALL25"
                    ]
                ]
            }
        },
        {
            "type": "FOOTER",
            "text": "Not interested in any of our sales? Tap Stop Promotions"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "QUICK_REPLY",
                    "text": "Stop promotions"
                }
            ]
        }
    ],
    "language": "en_US",
    "category": "MARKETING"
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

### Delete template by name

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates?name=<TEMPLATE_NAME>`

**Query Parameters:**

- `name`: `<TEMPLATE_NAME>`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Delete template by ID

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates?hsm_id=<HSM_ID>&name=<NAME>`

**Query Parameters:**

- `hsm_id`: `<HSM_ID>` - Template ID
- `name`: `<NAME>` - Template name

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

## Flows

### Create Flow

#### Create Flow

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/flows`

**Form Data:**

- `name`: <FLOW_NAME>
- `categories`: ["OTHER"]
- `clone_flow_id`: <EXISTING_FLOW_ID>
- `endpoint_uri`: https://example.com

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1"
}
```

---

#### Migrate Flows

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/migrate_flows`

**Form Data:**

- `source_waba_id`: <SOURCE_WABA_ID>
- `source_flow_names`: ["appointment", "leadgen"]

**Example Response:**

Status: `200 OK`

```json
{
    "migrated_flows": [
        {
            "source_id": "source-flow-1",
            "source_name": "appointment",
            "migrated_id": "dest-flow-1"
        }
    ],
    "failed_flows": [
        {
            "source_name": "leadgen",
            "error_code": "4233041",
            "error_message": "Flows Migration Error: Flow name not found in source WABA."
        }
    ]
}
```

---

#### Get Flow

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=id,name,categories,preview,status,validation_errors,json_version,data_api_version,data_channel_uri,health_status,whatsapp_business_account,application`

**Query Parameters:**

- `fields`: `id,name,categories,preview,status,validation_errors,json_version,data_api_version,data_channel_uri,health_status,whatsapp_business_account,application` - Return specific fields in the response

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "name": "my first flow",
    "categories": [
        "OTHER"
    ],
    "preview": {
        "preview_url": "https://business.facebook.com/wa/manage/flows/55000..../preview/?token=b9d6.....",
        "expires_at": "2023-05-21T11:18:09+0000"
    },
    "status": "DRAFT",
    "validation_errors": [],
    "json_version": "2.1",
    "data_api_version": "3.0",
    "data_channel_uri": "https://example.com",
    "health_status": {
        "can_send_message": "BLOCKED",
        "entities": [
            {
                "entity_type": "FLOW",
                "id": "flow-1",
                "can_send_message": "AVAILABLE"
            },
            {
                "entity_type": "WABA",
                "id": "waba-1",
                "can_send_message": "BLOCKED",
                "errors": [
                    {
                        "error_code": 141006,
                        "error_description": "There is an error with the payment method. This will block business initiated conversations.",
                        "possible_solution": "There was an error with your payment method. Please add a new payment method to the account."
                    },
                    {
                        "error_code": 141014,
                        "error_description": "The WABA is banned.",
                        "possible_solution": "Please visit Business Support Home for more details (https://business.facebook.com/accountquality) on how to appeal the ban."
                    }
                ]
            },
            {
                "entity_type": "BUSINESS",
                "id": "business-1",
                "can_send_message": "LIMITED",
                "errors": [
                    {
                        "error_code": 141010,
                        "error_description": "The Business has not passed business verification.",
                        "possible_solution": "Visit business settings and start or resolve the business verification request."
                    }
                ]
            },
            {
                "entity_type": "APP",
                "id": "app-1",
                "can_send_message": "AVAILABLE"
            }
        ]
    },
    "whatsapp_business_account": {
        "id": "waba-1",
        "name": "My Awesome WABA",
        "timezone_id": "54",
        "business_type": "ent",
        "message_template_namespace": "namespace-1"
    },
    "application": {
        "link": "https://www.facebook.com/games/?app_id=app-1",
        "name": "My Awesome App",
        "id": "app-1"
    }
}
```

---

#### Get Preview URL

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=preview.invalidate(false)`

**Query Parameters:**

- `fields`: `preview.invalidate(false)` - Set to true to generate a new preview link and expire old link

**Example Response:**

Status: `200 OK`

```json
{
    "preview": {
        "preview_url": "https://business.facebook.com/wa/manage/flows/550.../preview/?token=b9d6....",
        "expires_at": "2023-05-21T11:18:09+0000"
    },
    "id": "flow-1"

}
```

---

#### List Flows

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/flows`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "my first flow",
            "status": "DRAFT",
            "categories": [
                "SIGN_UP"
            ],
            "validation_errors": [],
            "id": "flow-1"
        },
        {
            "name": "my second flow",
            "status": "DRAFT",
            "categories": [
                "SIGN_UP",
                "SIGN_IN"
            ],
            "validation_errors": [
                {
                    "error": "INVALID_PROPERTY",
                    "error_type": "JSON_SCHEMA_ERROR",
                    "message": "The property \"initial-text\" cannot be specified at \"$root/screens/0/layout/children/2/children/0\".",
                    "line_start": 46,
                    "line_end": 46,
                    "column_start": 17,
                    "column_end": 30
                }
            ],
            "id": "flow-2"
        },
        {
            "name": "another flow",
            "status": "PUBLISHED",
            "categories": [
                "CONTACT_US"
            ],
            "validation_errors": [],
            "id": "flow-3"
        }
    ],
    "paging": {
        "cursors": {
            "before": "QVFIUnpKT...",
            "after": "QVFIUnZAWV..."
        }
    }
}
```

---

### Update Flow

#### Update Flow JSON

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}/assets`

**Form Data:**

- `file`: 
- `name`: flow.json
- `asset_type`: FLOW_JSON

**Example Response:**

Status: `200 OK`

```json
{
    "success": true,
    "validation_errors": [
        {
            "error": "INVALID_PROPERTY",
            "error_type": "JSON_SCHEMA_ERROR",
            "message": "The property \"initial-text\" cannot be specified at \"$root/screens/0/layout/children/2/children/0\".",
            "line_start": 46,
            "line_end": 46,
            "column_start": 17,
            "column_end": 30
        }
    ]
}
```

---

#### Publish Flow

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}/publish`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

#### Update Flow Metadata

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}`

**Form Data:**

- `name`: <NEW_FLOW_NAME>
- `categories`: ["OTHER"]
- `endpoint_uri`: https://example.com

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

#### List Assets (Get Flow JSON URL)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}/assets`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "name": "flow.json",
            "asset_type": "FLOW_JSON",
            "download_url": "https://scontent.xx.fbcdn.net/m1/v/t0.57323-24/An_Hq0jnfJ..."
        }
    ],
    "paging": {
        "cursors": {
            "before": "QVFIU...",
            "after": "QVFIU..."
        }
    }
}
```

---

#### Deprecate Flow

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}/deprecate`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

#### Delete Flow

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Setup Endpoint Encryption

#### Set Encryption Public Key

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_business_encryption`

**Form Data:**

- `business_public_key`: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
...
8QIDAQAB
-----END PUBLIC KEY-----

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

#### Get Encryption Public Key

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_business_encryption`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "business_public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqh...AQAB\n-----END PUBLIC KEY-----",
            "business_public_key_signature_status": "VALID"
        }
    ]
}
```

---

### Send Flow

#### Send Draft Flow by Name

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "recipient_type": "individual",
    "type": "interactive",
    "interactive": {
        "type": "flow",
        "header": {
            "type": "text",
            "text": "Not shown in draft mode"
        },
        "body": {
            "text": "Not shown in draft mode"
        },
        "footer": {
            "text": "Not shown in draft mode"
        },
        "action": {
            "name": "flow",
            "parameters": {
                "flow_message_version": "3",
                "flow_action": "navigate",
                "flow_token": "<FLOW_TOKEN>",
                "flow_name": "{{Flow-Name}}",
                "flow_cta": "Not shown in draft mode",
                "mode": "draft",
                "flow_action_payload": {
                    "screen": "<SCREEN_ID>",
                    "data": {
                        "<CUSTOM_KEY>": "<CUSTOM_VALUE>"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "18055555555",
            "wa_id": "18055555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgL..."
        }
    ]
}
```

---

#### Send Draft Flow by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "recipient_type": "individual",
    "type": "interactive",
    "interactive": {
        "type": "flow",
        "header": {
            "type": "text",
            "text": "Not shown in draft mode"
        },
        "body": {
            "text": "Not shown in draft mode"
        },
        "footer": {
            "text": "Not shown in draft mode"
        },
        "action": {
            "name": "flow",
            "parameters": {
                "flow_message_version": "3",
                "flow_action": "navigate",
                "flow_token": "<FLOW_TOKEN>",
                "flow_id": "{{Flow-ID}}",
                "flow_cta": "Not shown in draft mode",
                "mode": "draft",
                "flow_action_payload": {
                    "screen": "<SCREEN_ID>",
                    "data": {
                        "<CUSTOM_KEY>": "<CUSTOM_VALUE>"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "18055555555",
            "wa_id": "18055555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgL..."
        }
    ]
}
```

---

#### Send Published Flow by Name

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "recipient_type": "individual",
    "type": "interactive",
    "interactive": {
        "type": "flow",
        "header": {
            "type": "text",
            "text": "<HEADER_TEXT>"
        },
        "body": {
            "text": "<BODY_TEXT>"
        },
        "footer": {
            "text": "<FOOTER_TEXT>"
        },
        "action": {
            "name": "flow",
            "parameters": {
                "flow_message_version": "3",
                "flow_action": "navigate",
                "flow_token": "<FLOW_TOKEN>",
                "flow_name": "{{Flow-Name}}",
                "flow_cta": "Open Flow!",
                "flow_action_payload": {
                    "screen": "<SCREEN_ID>",
                    "data": {
                        "<CUSTOM_KEY>": "<CUSTOM_VALUE>"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "18055555555",
            "wa_id": "18055555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgL..."
        }
    ]
}
```

---

#### Send Published Flow by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "recipient_type": "individual",
    "type": "interactive",
    "interactive": {
        "type": "flow",
        "header": {
            "type": "text",
            "text": "<HEADER_TEXT>"
        },
        "body": {
            "text": "<BODY_TEXT>"
        },
        "footer": {
            "text": "<FOOTER_TEXT>"
        },
        "action": {
            "name": "flow",
            "parameters": {
                "flow_message_version": "3",
                "flow_action": "navigate",
                "flow_token": "<FLOW_TOKEN>",
                "flow_id": "{{Flow-ID}}",
                "flow_cta": "Open Flow!",
                "flow_action_payload": {
                    "screen": "<SCREEN_ID>",
                    "data": {
                        "<CUSTOM_KEY>": "<CUSTOM_VALUE>"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "18055555555",
            "wa_id": "18055555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgL..."
        }
    ]
}
```

---

#### Create Flow Template Message by Name

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "<TEMPLATE_NAME>",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "body",
            "text": "Check out this new offer"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "FLOW",
                    "text": "Check out this offer!",
                    "flow_name": "{{Flow-Name}}",
                    "navigate_screen": "<SCREEN_ID>",
                    "flow_action": "navigate"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "template-1",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

#### Create Flow Template Message by Flow JSON

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "<TEMPLATE_NAME>",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "body",
            "text": "Check out this new offer"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "FLOW",
                    "text": "Check out this offer!",
                    "flow_json": "{\"version\":\"5.0\",\"screens\":[{\"id\":\"WELCOME_SCREEN\",\"layout\":{\"type\":\"SingleColumnLayout\",\"children\":[{\"type\":\"TextHeading\",\"text\":\"Hello World\"},{\"type\":\"Footer\",\"label\":\"Complete\",\"on-click-action\":{\"name\":\"complete\",\"payload\":{}}}]},\"title\":\"Welcome\",\"terminal\":true,\"success\":true,\"data\":{}}]}",
                    "navigate_screen": "WELCOME_SCREEN",
                    "flow_action": "navigate"
                }
            ]
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "template-1",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

#### Create Flow Template Message by ID

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}/message_templates`

**Request Body:**

```json
{
    "name": "<TEMPLATE_NAME>",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
        {
            "type": "body",
            "text": "Check out this new offer"
        },
        {
            "type": "BUTTONS",
            "buttons": [
                {
                    "type": "FLOW",
                    "text": "Check out this offer!",
                    "flow_id": "{{Flow-ID}}",
                    "navigate_screen": "<SCREEN_ID>",
                    "flow_action": "navigate"
                }
            ]
        }
    ]
}

```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "template-1",
    "status": "PENDING",
    "category": "MARKETING"
}
```

---

#### Send Flow Template Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
        "name": "<TEMPLATE_NAME>",
        "language": {
            "code": "en_US"
        },
        "components": [
            {
                "type": "button",
                "sub_type": "flow",
                "index": "0",
                "parameters": [
                    {
                        "type": "action",
                        "action": {
                            "flow_token": "<FLOW_TOKEN>",
                            "flow_action_data": {
                                "<CUSTOM_KEY>": "<CUSTOM_VALUE>"
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "18055555555",
            "wa_id": "18055555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.HBgL..."
        }
    ]
}
```

---

### Get Endpoint Metrics

#### Get Endpoint Request Count Metric

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=metric.name(ENDPOINT_REQUEST_COUNT).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Query Parameters:**

- `fields`: `metric.name(ENDPOINT_REQUEST_COUNT).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "metric": {
        "granularity": "DAY",
        "name": "ENDPOINT_REQUEST_COUNT",
        "data_points": [
            {
                "timestamp": "2024-01-28T08:00:00+0000",
                "data": [
                    {
                        "key": "value",
                        "value": 138
                    }
                ]
            },
            {
                "timestamp": "2024-01-29T08:00:00+0000",
                "data": [
                    {
                        "key": "value",
                        "value": 361
                    }
                ]
            }
        ]
    }
}
```

---

#### Get Endpoint Request Error Metric

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=metric.name(ENDPOINT_REQUEST_ERROR).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Query Parameters:**

- `fields`: `metric.name(ENDPOINT_REQUEST_ERROR).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "metric": {
        "granularity": "DAY",
        "name": "ENDPOINT_REQUEST_ERROR",
        "data_points": [
            {
                "timestamp": "2024-01-28T08:00:00+0000",
                "data": [
                    {
                        "key": "timeout_error",
                        "value": 25
                    }
                ]
            },
            {
                "timestamp": "2024-01-29T08:00:00+0000",
                "data": [
                    {
                        "key": "timeout_error",
                        "value": 64
                    }
                ]
            }
        ]
    }
}
```

---

#### Get Endpoint Request Error Rate Metric

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=metric.name(ENDPOINT_REQUEST_ERROR_RATE).granularity(LIFETIME).since(2024-01-28).until(2024-01-30)`

**Query Parameters:**

- `fields`: `metric.name(ENDPOINT_REQUEST_ERROR_RATE).granularity(LIFETIME).since(2024-01-28).until(2024-01-30)`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "metric": {
        "granularity": "LIFETIME",
        "name": "ENDPOINT_REQUEST_ERROR_RATE",
        "data_points": [
            {
                "timestamp": "2024-01-28T08:00:00+0000",
                "data": [
                    {
                        "key": "value",
                        "value": 0.12625250501002
                    }
                ]
            }
        ]
    }
}
```

---

#### Get Endpoint Request Latencies Metric

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=metric.name(ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Query Parameters:**

- `fields`: `metric.name(ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "metric": {
        "granularity": "DAY",
        "name": "ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL",
        "data_points": [
            {
                "timestamp": "2024-01-28T08:00:00+0000",
                "data": [
                    {
                        "key": "1",
                        "value": 106
                    }
                ]
            },
            {
                "timestamp": "2024-01-29T08:00:00+0000",
                "data": [
                    {
                        "key": "1",
                        "value": 328
                    },
                    {
                        "key": "2",
                        "value": 2
                    }
                ]
            }
        ]
    }
}
```

---

#### Get Endpoint Availability Metric

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Flow-ID}}?fields=metric.name(ENDPOINT_AVAILABILITY).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Query Parameters:**

- `fields`: `metric.name(ENDPOINT_AVAILABILITY).granularity(DAY).since(2024-01-28).until(2024-01-30)`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "flow-1",
    "metric": {
        "granularity": "DAY",
        "name": "ENDPOINT_AVAILABILITY",
        "data_points": [
            {
                "timestamp": "2024-01-28T08:00:00+0000",
                "data": [
                    {
                        "key": "succeeded",
                        "value": 713
                    },
                    {
                        "key": "failed",
                        "value": 335
                    }
                ]
            },
            {
                "timestamp": "2024-01-29T08:00:00+0000",
                "data": [
                    {
                        "key": "succeeded",
                        "value": 623
                    },
                    {
                        "key": "failed",
                        "value": 2
                    }
                ]
            }
        ]
    }
}
```

---

## Media

You can use the following endpoints to upload, retrieve, or delete media:

| Endpoint       | Uses |
| ----------- | ---------- |
| [POST /{phone-number-ID}/media]() | Upload media. |
| [GET /{media-ID}]() | Retrieve the URL for a specific media item. |
| [DELETE /{media-ID}]() | Delete a specific media item. |
| [GET /{media-URL}]() | Download media from a media URL. |

#### Reminders

* To use these endpoints, you need to authenticate yourself with a system user access token with the **`whatsapp_business_messaging`** permission.
* If you need to find your phone number ID, see [Get Phone Number ID](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers).
* If you need to find your media URL, see [Retrieve Media URL](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#download-media).

#### Support Media Types
| Media       | Supported File Type(s) | Size Limit |
| ----------- | ----------------------- | ---------- |
| `audio`       | <ul><li>`audio/aac`</li><li>`audio/mp4`</li><li>`audio/mpeg`</li><li>`audio/amr`</li><li>`audio/ogg`</li></ul><br> **Note**: only opus codecs, base audio/ogg is not supported | 16MB |
| `document`    | <ul><li>`text/plain`</li><li>`application/pdf`</li><li>`application/vnd.ms-powerpoint`</li><li>`application/msword`</li><li>`application/vnd.ms-excel`</li><li>`application/vnd.openxmlformats-officedocument.wordprocessingml.document`</li><li>`application/vnd.openxmlformats-officedocument.presentationml.presentation`</li><li>`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`</li></ul> | 100MB |
| `image` | <ul><li>`image/jpeg`</li><li>`image/png`</li></ul> | 5MB |
| `sticker` | <ul><li>`image/webp`</li></ul> | 100KB |
| `video` | <ul><li>`video/mp4`</li><li>`video/3sp`</li></ul><br/>**Notes**:<ul><li>Only H.264 video codec and AAC audio codec is supported.</li><li>We support videos with a single audio stream or no audio stream.</li><ul> | 16MB |


#### Get Media ID
To complete some of the following API calls, you need to have a media ID. There are two ways to get this ID:

* **From the API call**: Once you have successfully uploaded media files to the API, the media ID is included in the response to your call.
* **From Webhooks**: When a business account receives a media message, it downloads the media and uploads it to the Cloud API automatically. That event triggers the Webhooks and sends you a notification that includes the media ID.

### Upload Image

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/media`

**Form Data:**

- `messaging_product`: whatsapp
- `file`: 

**Example Response:**

Status: `200 OK`

```json
{
    "id": "<MEDIA_ID>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "4490709327384033"
}
```

---

### Upload Sticker

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/media`

**Form Data:**

- `messaging_product`: whatsapp
- `file`: 

**Example Response:**

Status: `200 OK`

```json
{
    "id": "<MEDIA_ID>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "4490709327384033"
}
```

---

### Upload Audio

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/media`

**Request Body:**

```json
{
    "file": "@/local/path/file.ogg;type=audio/ogg",
    "messaging_product": "whatsapp"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "<MEDIA_ID>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "id": "4490709327384033"
}
```

---

### Retrieve Media URL

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Media-ID}}?phone_number_id=<PHONE_NUMBER_ID>`

**Query Parameters:**

- `phone_number_id`: `<PHONE_NUMBER_ID>` - Specifies that this action only be performed if the media belongs to the provided phone number.

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "url": "<URL>",
    "mime_type": "image/jpeg",
    "sha256": "<HASH>",
    "file_size": "303833",
    "id": "2621233374848975"
}
```

---

### Delete Media

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Media-ID}}/?phone_number_id=<PHONE_NUMBER_ID>`

**Query Parameters:**

- `phone_number_id`: `<PHONE_NUMBER_ID>` - Specifies that deletion of the media  only be performed if the media belongs to the provided phone number.

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

### Download Media

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Media-URL}}`

**Example Response:**

Status: `200 OK`

---

## Typing indicators

Guide: [Typing indicators](https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators)

### Send typing indicator and read receipt

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "status": "read",
    "message_id": "<WHATSAPP_MESSAGE_ID>",
    "typing_indicator": {
        "type": "text"
    }
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

## Business Profiles

To complete the following API calls, you need to get a business profile ID. To do that, make a **GET** call to the **`/{{Phone-Number-ID}}`** endpoint and add `business_profile` as a URL field. Within the **`business_profile`** request, you can specify what you want to know from your business.

#### Reminders

* To use this endpoint, you need to authenticate yourself with a system user access token with the **`whatsapp_business_management`** permission.

### Resumable Upload - Create an Upload Session

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/app/uploads/?file_length=<YOUR_FILE_LENGTH>&file_type=image/jpeg&file_name=myprofile.jpg`

**Headers:**

- `Authorization`: OAuth {{User-Access-Token}}

**Query Parameters:**

- `file_length`: `<YOUR_FILE_LENGTH>` - **Required**<br/>Specifies the size of your file in bytes.
- `file_type`: `image/jpeg` - **Required**<br/>Specifies the MIME type. Values are <ul><li>`image/jpeg`</li><li>`image/png`</li><li>`video/mp4`</li></ul>
- `file_name`: `myprofile.jpg` - **Optional**<br/>Specifies the file name you are using to create the session.

**Example Response:**

Status: `200 OK`

```json
{
    "id": "upload:MTphdHRhY2htZW50Ojlk2mJiZxUwLWV6MDUtNDIwMy05yTA3LWQ4ZDPmZGFkNTM0NT8=?sig=ARZqkGCA_uQMxC8nHKI"
}
```

---

### Resumable Upload - Upload File Data

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Upload-ID}}`

**Headers:**

- `Content-Type`: image/jpeg
- `file_offset`: 0
- `Authorization`: OAuth {{User-Access-Token}}

**Example Response:**

Status: `200 OK`

```json
{
    "h":"2:c2FtcGxlLm1wNA==:image/jpeg:GKAj0gAUCZmJ1voFADip2iIAAAAAbugbAAAA:e:1472075513:ARZ_3ybzrQqEaluMUdI"
}
```

---

### Resumable Upload - Query File Upload Status

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Upload-ID}}`

**Headers:**

- `Cache-Control`: no-cache
- `Authorization`: OAuth {{User-Access-Token}}

**Example Response:**

Status: `200 OK`

```json
{ 
    "id": "upload:MTphdHRhY2htZW50Ojlk2mJiZxUwLWV6MDUtNDIwMy05yTA3LWQ4ZDPmZGFkNTM0NT8=?sig=ARZqkGCA_uQMxC8nHKI", 
    "file_offset": 0 
}
```

---

### Get Business Profile

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_business_profile`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "business_profile": {
                "messaging_product": "whatsapp",
                "address": "business-address",
                "description": "business-description",
                "vertical": "business-industry",
                "about": "profile-about-text",
                "email": "business-email",
                "websites": [
                    "https://website-1",
                    "https://website-2"
                ],
                "profile_picture_url": "<PROFILE_PICTURE_URL>"                
            }
        }
    ]
}
```

---

### Update Business Profile

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_business_profile`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "address": "<business-address>",
    "description": "<business-description>",
    "vertical": "<business-industry>",
    "about": "<profile-about-text>",
    "email": "<business-email>",
    "websites": [
        "<https://website-1>",
        "<https://website-2>"
    ],
    "profile_picture_handle": "<IMAGE_HANDLE_ID>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "business_profile": {
                "messaging_product": "whatsapp",
                "address": "<business-address>",
                "description": "<business-description>",
                "vertical": "<business-industry>",
                "about": "<profile-about-text>",
                "email": "<business-email>",
                "websites": [
                    "https://website-1",
                    "https://website-2"
                ],
                "profile_picture_url": "https://pps.whatsapp.net/...",
                "id": "<business-profile-id>"
            },
            "id": "<phone-number-id>"
        }
    ]
}
```

---

## Commerce Settings

- Guide: [Sell Products & Services](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sell-products-and-services) (Cloud API)
- Guide: [Sell Products & Services](https://developers.facebook.com/docs/whatsapp/on-premises/guides/commerce-guides) (On-Premises API)

### Get commerce settings

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_commerce_settings`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "is_cart_enabled": true,
            "is_catalog_visible": true,
            "id": "527759822865714"
        }
    ]
}
```

---

### Set or update commerce settings

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/whatsapp_commerce_settings?is_cart_enabled=true&is_catalog_visible=true`

**Query Parameters:**

- `is_cart_enabled`: `true`
- `is_catalog_visible`: `true`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

## Payments API - SG

Guide: [Payments API - SG](https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-sg)

### Send Order Details Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-WA-ID}}",
    "type": "interactive",
    "interactive": {
        "type": "order_details",
        "order_details": {
            "header": {
                "type": "image",
                "image": {
                    "link": "http(s)://the-url",
                    "provider": {
                        "name": "provider-name"
                    }
                }
            },
            "body": {
                "text": "your-text-body-content"
            },
            "footer": {
                "text": "your-text-footer-content"
            },
            "action": {
                "reference_id": "unique-reference-id",
                "type": "digital-goods",
                "payment_type": "p2m-lite:stripe",
                "payment_configuration": "my-payment-config-name",
                "currency": "SGD",
                "total_amount": {
                    "value": 1000,
                    "offset": 100
                },
                "order": {
                    "status": "pending",
                    "items": [
                        {
                            "retailer_id": "1234567",
                            "name": "bread",
                            "amount": {
                                "value": 10000,
                                "offset": 100
                            },
                            "sale_amount": {
                                "value": 100,
                                "offset": 100
                            },
                            "quantity": 1
                        }
                    ],
                    "subtotal": {
                        "value": 20000,
                        "offset": 100
                    },
                    "tax": {
                        "value": 1000,
                        "offset": 100,
                        "description": "optional_text"
                    },                    
                    "shipping": {
                        "value": 1000,
                        "offset": 100,
                        "description": "optional_text"
                    },
                    "discount": {
                        "value": 1000,
                        "offset": 100,
                        "description": "optional_text",
                        "discount_program_name": "optional_text"
                    },
                    "catalog_id": "optional-catalog_id",
                    "expiration": {
                        "timestamp": "utc_timestamp_in_seconds",
                        "description": "cancellation-explanation"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}
```

---

### Send Order Status Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-WA-ID}}",
    "type": "interactive",
    "interactive": {
        "type": "order_status",
        "body": {
            "text": "your-text-body-content"
        },
        "action": {
            "name": "review_order",
            "parameters": {
                "reference_id": "unique-reference-id-from-order-details-msg",
                "order": {
                    "status": "processing",
                    "description": "optional-text"
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}
```

---

## Payments API - IN

**These APIs are in beta. Please reach out to Meta Business Engineering teams with your WABA ID to gain access.**

Guide: [Payments API - IN](https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-in)

### Send Order Details Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-WA-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "order_details",
        "header": {
            "type": "image",
            "image": {
                "link": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Home_made_sour_dough_bread.jpg/640px-Home_made_sour_dough_bread.jpg"
            }
        },
        "body": {
            "text": "your-text-body-content"
        },
        "footer": {
            "text": "your-text-footer-content"
        },
        "action": {
            "name": "review_and_pay",
            "parameters": {
                "reference_id": "unique-reference-id",
                "type": "digital-goods",
                "payment_type": "upi",
                "payment_configuration": "my-payment-config-name",
                "currency": "INR",
                "total_amount": {
                    "value": 1100,
                    "offset": 100
                },
                "order": {
                    "status": "pending",
                    "items": [
                        {
                            "retailer_id": "1234567",
                            "name": "bread",
                            "amount": {
                                "value": 1500,
                                "offset": 100
                            },
                            "sale_amount": {
                                "value": 1000,
                                "offset": 100
                            },
                            "quantity": 1
                        }
                    ],
                    "subtotal": {
                        "value": 1000,
                        "offset": 100
                    },
                    "tax": {
                        "value": 100,
                        "offset": 100,
                        "description": "optional_text"
                    },
                    "shipping": {
                        "value": 100,
                        "offset": 100,
                        "description": "optional_text"
                    },
                    "discount": {
                        "value": 100,
                        "offset": 100,
                        "description": "optional_text",
                        "discount_program_name": "optional_text"
                    }
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}
```

---

### Send Order Status Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "{{Recipient-WA-Phone-Number}}",
    "type": "interactive",
    "interactive": {
        "type": "order_status",
        "body": {
            "text": "your-text-body-content"
        },
        "action": {
            "name": "review_order",
            "parameters": {
                "reference_id": "unique-reference-id",
                "order": {
                    "status": "processing",
                    "description": "optional-text"
                }
            }
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "+1-631-555-5555",
            "wa_id": "16315555555"
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
        }
    ]
}
```

---

## QR codes

- Guide: [QR Codes](https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes)

### Get QR code

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls/<QR_CODE_ID>`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "code": "ANED2T5QRU7HG1",
            "prefilled_message": "Show me Cyber Monday deals!",
            "deep_link_url": "https://wa.me/message/ANED2T5QRU7HG1"
        }
    ]
}
```

---

### Get all QR codes (default fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "code": "5QBPAD2DC6L5A1",
            "prefilled_message": "Show me Cyber Tuesday deals!",
            "deep_link_url": "https://wa.me/message/5QBPAD2DC6L5A1"
        },
        {
            "code": "ANED2T5QRU7HG1",
            "prefilled_message": "Show me Cyber Monday deals!",
            "deep_link_url": "https://wa.me/message/ANED2T5QRU7HG1"
        },
        {
            "code": "WOMVT6TJ2BP7A1",
            "prefilled_message": "Tell me more about your production workshop",
            "deep_link_url": "https://wa.me/message/WOMVT6TJ2BP7A1"
        }
    ]
}
```

---

### Get all QR codes (specific fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls?fields=code,prefilled_message,qr_image_url.format(SVG)`

**Query Parameters:**

- `fields`: `code,prefilled_message,qr_image_url.format(SVG)` - .format can be SVG or PNG

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "code": "5QBPAD2DC6L5A1",
            "prefilled_message": "Show me Cyber Tuesday deals!",
            "qr_image_url": "https://scontent-iad3-2.xx.fbcdn.net/m1/v/t6/An_CaBAHoMypun-kUZsZ88eIZjmnyD0deR9jzkE0BAIjUN_irRtfWqrwFo1fj6uZCbVss_DmlCPf121K_Ik8k-r-Mc9tEaWnD2nNX4YcrVPXW97-EtSR4ISGmaYNjNg0s5n08DtkYwh5?ccb=10-5&oh=00_AfCr-w29t9Qfe66xM5H9dJu2SKKBVJmXfC2WatMB_m1FNQ&oe=64DCF088&_nc_sid=5a413f"
        },
        {
            "code": "ANED2T5QRU7HG1",
            "prefilled_message": "Show me Cyber Monday deals!",
            "qr_image_url": "https://scontent-iad3-2.xx.fbcdn.net/m1/v/t6/An-psFmLBls2NFXnhhkSVqwIHEqCTQoNKTLxxlOeci0Wbsukd2RLiwZalHrXwqT5RTFSzOhyw6OLvJJO0itaQtJI1BS2WkNcV67wR3GNx7ZX1tFSNCbpo1e6KPptKF1GbVGzmUfkgSPX?ccb=10-5&oh=00_AfD8UP3gI1a7r0swztpJJ9zcIoVDwX1m888-f-9MPMVTFA&oe=64DD0736&_nc_sid=5a413f"
        },
        {
            "code": "WOMVT6TJ2BP7A1",
            "prefilled_message": "Tell me more about your production workshop",
            "qr_image_url": "https://scontent-iad3-2.xx.fbcdn.net/m1/v/t6/An9kdIj-mOc6-m33Q103wyA8zeTsGizIhQ1Xg-rVaKzSIUUnz2azOlTNj2bjqhzomkdvN92Hz2yp4kgWrWhgUBFlT5aHLpc7mB9fu8MlD1QIxnQNE0Oby2L1yBO2TGmQy7i-wjhk_NwC?ccb=10-5&oh=00_AfAyxB3EVjmtOmnuizSVDTmr78SNAxxCJqn7MVEgkZ5dUQ&oe=64DCF966&_nc_sid=5a413f"
        }
    ]
}
```

---

### Get QR code SVG image URL

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls?fields=prefilled_message,deep_link_url,qr_image_url.format(SVG)&code=<QR_CODE_ID>`

**Query Parameters:**

- `fields`: `prefilled_message,deep_link_url,qr_image_url.format(SVG)`
- `code`: `<QR_CODE_ID>`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "prefilled_message": "Tell me more about your event planning packages",
            "deep_link_url": "https://wa.me/message/FO7JXE4BG3RFG1",
            "qr_image_url": "https://scontent-iad3-1.xx.fbcdn.net/m1/v/t6/An_tlxnbh51qOQehAUw8o0lv9rIJm0PwPYsk4HCQkovoSsA_FT8WA56FVpe-lzURBxjngRUxWsHyMzvFb35K6DVrJGNqTsuWvjgL7G8K2SmHDsnnBiWqqm3GPmXlLWs9Ct_ok4tQM3YR?ccb=10-5&oh=00_AfBNcOAJ7gT1uXGqBfZFOv-wppQjBZFJAOJU59Ybe-V4sQ&oe=6455097A&_nc_sid=f36290"
        }
    ]
}
```

---

### Get QR code PNG image URL

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls?fields=prefilled_message,deep_link_url,qr_image_url.format(PNG)&code=<QR_CODE_ID>`

**Query Parameters:**

- `fields`: `prefilled_message,deep_link_url,qr_image_url.format(PNG)`
- `code`: `<QR_CODE_ID>`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "prefilled_message": "Tell me more about your event planning packages",
            "deep_link_url": "https://wa.me/message/FO7JXE4BG3RFG1",
            "qr_image_url": "https://scontent-iad3-1.xx.fbcdn.net/m1/v/t6/An-H7T8OyTqO07lcRGHlKteuPMKDnx07nua3dGb4i560bVxDscweOV4KoKD_4wCDFoHR_C5LyVjxQISKPxwora1bbFhUEo2nA19ZPLBUVoQSmV12l1x-nuu312jKty-5rmojmde_a0g?ccb=10-5&oh=00_AfASq_vjojFza_9A-HDeRgHM3wZ8yjNprpYBjNKOn8RkSg&oe=64550A9E&_nc_sid=f36290"
        }
    ]
}
```

---

### Create QR code

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls`

**Request Body:**

```json
{
    "prefilled_message": "<PREFILLED_MESSAGE>",
    "generate_qr_image": "<GENERATE_QR_IMAGE>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "code": "ANED2T5QRU7HG1",
    "prefilled_message": "Show me Cyber Monday deals!",
    "deep_link_url": "https://wa.me/message/ANED2T5QRU7HG1",
    "qr_image_url": "https://scontent-iad3-2.xx.fbcdn.net/m1/v/t6/An-psFmLBls2NFXnhhkSVqwIHEqCTQoNKTLxxlOeci0Wbsukd2RLiwZalHrXwqT5RTFSzOhyw6OLvJJO0itaQtJI1BS2WkNcV67wR3GNx7ZX1tFSNCbpo1e6KPptKF1GbVGzmUfkgSPX?ccb=10-5&oh=00_AfAOAr6oRA2OKV_Ur3GUh4em57sACxUkfhXHsObiFrxOsA&oe=64DCCEF6&_nc_sid=5a413f"
}
```

---

### Update Message QR Code.

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "prefilled_message": "<PREFILLED_MESSAGE>",
    "code": "<CODE>"
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "code": "WOMVT6TJ2BP7A1",
    "prefilled_message": "Tell me about your new workshops",
    "deep_link_url": "https://wa.me/message/WOMVT6TJ2BP7A1"
}
```

---

### Delete QR code

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/message_qrdls/<QR_CODE_ID>`

**Example Response:**

Status: `200 OK`

```json
{
    "success": true
}
```

---

## Business Portfolio

### Get Business Portfolio (Specific Fields)

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Business-ID}}?fields=id,name,timezone_id`

**Query Parameters:**

- `fields`: `id,name,timezone_id`

**Example Response:**

Status: `200 OK`

```json
{
    "id": "506914307656634",
    "name": "Lucky Shrub",
    "timezone_id": 0
}
```

---

## Analytics

- Guide: [Analytics](https://developers.facebook.com/docs/whatsapp/business-management-api/analytics)

### Get analytics

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}?fields=analytics.start(1680503760).end(1680564980).granularity(DAY).phone_numbers([]).country_codes(["US", "BR"])`

**Query Parameters:**

- `fields`: `analytics.start(1680503760).end(1680564980).granularity(DAY).phone_numbers([]).country_codes(["US", "BR"])`

**Example Response:**

Status: `200 OK`

```json
{
    "analytics": {
        "phone_numbers": [
            "16505550111",
            "16505550112",
            "16505550113"
        ],
        "country_codes": [
            "US",
            "BR"
        ],
        "granularity": "DAY",
        "data_points": [
            {
                "start": 1543543200,
                "end": 1543629600,
                "sent": 196093,
                "delivered": 179715
            },
            {
                "start": 1543629600,
                "end": 1543716000,
                "sent": 147649,
                "delivered": 139032
            },
            {
                "start": 1543716000,
                "end": 1543802400,
                "sent": 61988,
                "delivered": 58830
            },
            {
                "start": 1543802400,
                "end": 1543888800,
                "sent": 132465,
                "delivered": 124392
            },
            {
                "start": 1543888800,
                "end": 1543975200,
                "sent": 181002,
                "delivered": 167335
            },
            {
                "start": 1543975200,
                "end": 1544061600,
                "sent": 168687,
                "delivered": 157838
            },
            {
                "start": 1544061600,
                "end": 1544148000,
                "sent": 161832,
                "delivered": 152383
            }
        ]
    },
    "id": "952305634918047"
}
```

---

### Get conversation analytics

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{WABA-ID}}?fields=conversation_analytics.start(1656661480).end(1674859480).granularity(MONTHLY).conversation_directions(["business_initiated"]).dimensions(["conversation_type", "conversation_direction"])`

**Query Parameters:**

- `fields`: `conversation_analytics.start(1656661480).end(1674859480).granularity(MONTHLY).conversation_directions(["business_initiated"]).dimensions(["conversation_type", "conversation_direction"])`

**Example Response:**

Status: `200 OK`

```json
{
    "analytics": {
        "phone_numbers": [
            "16505550111",
            "16505550112",
            "16505550113"
        ],
        "country_codes": [
            "US",
            "BR"
        ],
        "granularity": "DAY",
        "data_points": [
            {
                "start": 1543543200,
                "end": 1543629600,
                "sent": 196093,
                "delivered": 179715
            },
            {
                "start": 1543629600,
                "end": 1543716000,
                "sent": 147649,
                "delivered": 139032
            },
            {
                "start": 1543716000,
                "end": 1543802400,
                "sent": 61988,
                "delivered": 58830
            },
            {
                "start": 1543802400,
                "end": 1543888800,
                "sent": 132465,
                "delivered": 124392
            },
            {
                "start": 1543888800,
                "end": 1543975200,
                "sent": 181002,
                "delivered": 167335
            },
            {
                "start": 1543975200,
                "end": 1544061600,
                "sent": 168687,
                "delivered": 157838
            },
            {
                "start": 1544061600,
                "end": 1544148000,
                "sent": 161832,
                "delivered": 152383
            }
        ]
    },
    "id": "952305634918047"
}
```

---

## Billing

- Help Center Article: [About billing for your WhatsApp Business Account](https://www.facebook.com/business/help/2225184664363779)

### Get credit lines

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Business-ID}}/extendedcredits`

**Example Response:**

Status: `200 OK`

```json
{
  "data": [
    {
      "id": "1972385232742146",    
      "legal_entity_name": "Lucky Shrub"
    }
  ]
}

```

---

## OnPrem Account Migration

Use the **`/{{Phone-Number-ID}}/register`** endpoint to migrate your WhatsApp Business Accounts from your current on-premise deployment to the new Cloud-Based API. 

#### Reminders

* To use this endpoint, you need to authenticate yourself with a system user access token with the **`whatsapp_business_management`** permission.

* If you need to find your phone number ID, see [Get Phone Number ID](#c72d9c17-554d-4ae1-8f9e-b28a94010b28).

### Migrate Account

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/register`

**Headers:**

- `Content-Type`: application/json

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "pin": "6-digit-pin",
    "backup": {
        "data": "backup_data",
        "password": "password"
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "success": "true"
}
```

---

## Block Users

Guide: [Block Users](https://developers.facebook.com/docs/whatsapp/cloud-api/block-users)

### Get blocked users

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/block_users`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "messaging_product": "whatsapp",
            "wa_id": "16505551234"
        }
    ],
    "paging": {
        "cursors": {
            "before": "eyJvZAmZAzZAXQiOjAsInZAlcnNpb25JZACI6IjE3Mzc2Nzk2ODgzODM1ODQifQZDZD",
            "after": "eyJvZAmZAzZAXQiOjAsInZAlcnNpb25JZACI6IjE3Mzc2Nzk2ODgzODM1ODQifQZDZD"
        }
    }
}
```

---

### Block user(s)

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/block_users`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "block_users": [
        {
            "user": "{{Recipient-Phone-Number}}"
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "block_users": {
        "added_users": [
            {
                "input": "+16505551234",
                "wa_id": "16505551234"
            }
        ]
    }
}
```

---

### Unblock user(s)

**Method:** `DELETE`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/block_users`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "block_users": [
        {
            "user": "{{Recipient-Phone-Number}}"
        }
    ]
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "block_users": {
        "removed_users": [
            {
                "input": "+16505551234",
                "wa_id": "16505551234"
            }
        ]
    }
}
```

---

## Business Compliance

### Get India-based business compliance info

**Method:** `GET`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/business_compliance_info`

**Example Response:**

Status: `200 OK`

```json
{
    "data": [
        {
            "entity_name": "Lucky Shrub",
            "entity_type": "Partnership",
            "is_registered": true,
            "grievance_officer_details": {
                "name": "Chandravati P.",
                "email": "chandravati@luckyshrub.com",
                "landline_number": "+913857614343",
                "mobile_number": "+913854559033"
            },
            "customer_care_details": {
                "email": "support@luckyshrub.com",
                "landline_number": "+913857614343",
                "mobile_number": "+913854559033"
            },
            "messaging_product": "whatsapp"
        }
    ]
}
```

---

### Add India-based business compliance info

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/business_compliance_info`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "entity_name": "<ENTITY_NAME>",
    "entity_type": "<ENTITY_TYPE>",
    "is_registered": <IS_REGISTERED>,
    "grievance_officer_details": {
        "name": "<GRIEVANCE_OFFER_NAME>",
        "email": "<GRIEVANCE_OFFER_EMAIL>",
        "landline_number": "<GRIEVANCE_OFFER_LANDLINE_NUMBER>",
        "mobile_number": "<GRIEVANCE_OFFER_MOBILE_NUMBER>"
    },
    "customer_care_details": {
        "email": "<CUSTOMER_CARE_EMAIL>",
        "landline_number": "<CUSTOMER_CARE_LANDLINE_NUMBER>",
        "mobile_number": "<CUSTOMER_CARE_MOBILE_NUMBER>"
    }
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

## Examples

### Send Sample Text Message

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-WA-ID}}",
    "type": "template",
    "template": {
        "name": "hello_world",
        "language": {
            "code": "en_US"
        }
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Sample Shipping Confirmation Template

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
    "messaging_product": "whatsapp",
    "to": "{{Recipient-Phone-Number}}",
    "type": "template",
    "template": {
       "name": "sample_shipping_confirmation",
       "language": {
           "code": "en_US",
           "policy": "deterministic"
       },
       "components": [
         {
           "type": "body",
           "parameters": [
               {
                   "type": "text",
                   "text": "2"
               }
           ]
         }
       ]
    }
}
```

**Example Response:**

Status: `200 OK`

```json
{
    "messaging_product": "whatsapp",
    "contacts": [
        {
            "input": "48XXXXXXXXX",
            "wa_id": "48XXXXXXXXX "
        }
    ],
    "messages": [
        {
            "id": "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
        }
    ]
}
```

---

### Send Sample Issue Resolution Template

**Method:** `POST`

**Endpoint:** `https://graph.facebook.com/{{Version}}/{{Phone-Number-ID}}/messages`

**Request Body:**

```json
{
   "messaging_product": "whatsapp",
   "to": "{{Recipient-Phone-Number}}",
   "type": "template",
   "template": {
       "name": "sample_issue_resolution",
       "language": {
           "code": "en_US",
           "policy": "deterministic"
       },
       "components": [
           {
               "type": "body",
               "parameters": [
                   {
                       "type": "text",
                       "text": "*Mr. Jones*"
                   }
               ]
           },
           {
               "type": "button",
               "sub_type": "quick_reply",
               "index": 0,
               "parameters": [
                   {
                       "type": "text",
                       "text": "Yes"
                   }
               ]
           },
           {
               "type": "button",
               "sub_type": "quick_reply",
               "index": 1,
               "parameters": [
                   {
                       "type": "text",
                       "text": "No"
                   }
               ]
           }
       ]
   }
}
```

**Example Response:**

Status: `200 OK`

---

