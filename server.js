import express, { json } from "express";
import { writeFileSync, readFileSync } from "fs";
const app = express();
app.use(json());

let conversations = [];

// API to create a conversation ID for two users
app.post("/create-conversation", (req, res) => {
  const { user1, user2 } = req.body;
  const conversationId = `${user1}-${user2}`;
  conversations.push({ conversationId, messages: [] });
  writeFileSync("conversations.json", JSON.stringify(conversations));
  res.json({ conversationId });
});

// API for a user to send a message
app.post("/send-message", (req, res) => {
  const { conversationId, user, message } = req.body;
  conversations = JSON.parse(readFileSync("conversations.json"));
  const conversation = conversations.find(
    (c) => c.conversationId === conversationId
  );
  if (conversation) {
    conversation.messages.push({ user, message });
    writeFileSync("conversations.json", JSON.stringify(conversations));
    res.json({ status: "Message sent" });
  } else {
    res.json({ status: "Conversation not found" });
  }
});

// API to fetch all messages in a conversation
app.get("/fetch-messages/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  conversations = JSON.parse(readFileSync("conversations.json"));
  const conversation = conversations.find(
    (c) => c.conversationId === conversationId
  );
  if (conversation) {
    res.json(conversation.messages);
  } else {
    res.json({ status: "Conversation not found" });
  }
});

app.listen(3001, () => console.log("Server running on port 3000"));
