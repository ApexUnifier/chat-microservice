# Answer

# API Documentation

## Overview

This API is used for managing conversations between users. It allows creating new conversations, sending messages, fetching messages, and fetching conversations.

## Base URL

The base URL for all endpoints is `http://localhost:3001/api`.

## Endpoints

### POST `/create-conversation`

Creates a new conversation between two users.

#### Request

Body parameters:

- `user1` (string): The ID of the first user.
- `user2` (string): The ID of the second user.

#### Response

Returns the MongoDB `_id` of the created or existing conversation.

### POST `/send-message`

Sends a message in a conversation.

#### Request

Body parameters:

- `conversationId` (string): The ID of the conversation.
- `user` (string): The ID of the user sending the message.
- `message` (string): The content of the message.

#### Response

Returns a status message indicating whether the message was sent or the conversation was not found.

### GET `/fetch-messages/:conversationId`

Fetches the last 10 messages from a conversation.

#### Request

Path parameters:

- `conversationId` (string): The ID of the conversation.

#### Response

Returns an array of the last 10 messages in the conversation, or a status message if the conversation was not found.

### GET `/fetch-conversations/:userId`

Fetches all conversations involving a specific user.

#### Request

Path parameters:

- `userId` (string): The ID of the user.

#### Response

Returns an array of objects, each containing the ID of a conversation and the last message in that conversation, or a status message if no conversations were found.

## Error Handling

In case of an error, the API will return a JSON object with a `status` property containing a description of the error.
