import express, { json } from "express";
import { writeFileSync, readFileSync } from "fs";
const app = express();
app.use(json());

let conversations = [];

app.post("/create-conversation", (req, res) => {
  const { user1, user2 } = req.body;
  const conversationId = `${user1}-${user2}`;

  // Check if conversation already exists
  const existingConversation = conversations.find(
    (c) => c.conversationId === conversationId
  );

  if (existingConversation) {
    // If conversation already exists, return existing conversation ID
    res.send({ conversationId: existingConversation.conversationId });
  } else {
    // If conversation does not exist, create new conversation and return new conversation ID
    conversations.push({ conversationId, messages: [] });
    writeFileSync("./data/conversations.json", JSON.stringify(conversations));
    res.send({ conversationId });
  }
});

// API for a user to send a message
app.post("/send-message", (req, res) => {
  const { conversationId, user, message } = req.body;
  conversations = JSON.parse(readFileSync("./data/conversations.json"));
  const conversation = conversations.find(
    (c) => c.conversationId === conversationId
  );
  if (conversation) {
    conversation.messages.push({ user, message });
    writeFileSync("./data/conversations.json", JSON.stringify(conversations));
    res.send({ status: "Message sent" });
  } else {
    res.send({ status: "Conversation not found" });
  }
});

// API to fetch all messages in a conversation
app.get("/fetch-messages/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  conversations = JSON.parse(readFileSync("./data/conversations.json"));
  const conversation = conversations.find(
    (c) => c.conversationId === conversationId
  );
  if (conversation) {
    res.send(conversation.messages);
  } else {
    res.send({ status: "Conversation not found" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
