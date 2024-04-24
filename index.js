import express, { json } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

const app = express();

app.use(json());
app.use(bodyParser.json());

// Define the schema for a conversation
const conversationSchema = new mongoose.Schema({
  conversationId: String,
  user1: String,
  user2: String,
  messages: [
    {
      user: String,
      message: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Create a model from the schema
const Conversation = mongoose.model("Conversation", conversationSchema);

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://Hirez:PHTM@hirez.g3zvonv.mongodb.net/?retryWrites=true&w=majority"
);

app.post("/api/create-conversation", async (req, res) => {
  const { user1, user2 } = req.body;
  const conversationId = `${user1}-${user2}`;
  const conversationId2 = `${user2}-${user1}`;

  // Check if conversation already exists
  const existingConversation = await Conversation.findOne({
    $or: [{ conversationId }, { conversationId: conversationId2 }],
  });

  if (existingConversation) {
    // If conversation already exists, return existing conversation's MongoDB _id
    res.send({ _id: existingConversation._id });
  } else {
    // If conversation does not exist, create new conversation and return new conversation's MongoDB _id
    const conversation = new Conversation({
      conversationId,
      user1,
      user2,
      messages: [],
    });
    await conversation.save();
    res.send({ _id: conversation._id });
  }
});

app.post("/api/send-message", async (req, res) => {
  const { conversationId, user, message } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (conversation) {
    conversation.messages.push({ user, message: message });
    await conversation.save();
    res.send({ status: "Message sent" });
  } else {
    res.send({ status: "Conversation not found" });
  }
});

app.get("/api/fetch-messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (conversation) {
    // Fetch only the last 10 messages
    const messages = conversation.messages.slice(-10);
    res.send(messages);
  } else {
    res.send({ status: "Conversation not found" });
  }
});

app.get("/api/fetch-conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  const conversations = await Conversation.find({
    $or: [{ user1: userId }, { user2: userId }],
  });

  if (conversations) {
    // Send the conversationIds along with the last message of each conversation
    const conversationData = conversations.map((conversation) => {
      return {
        conversationId: conversation._id,
        lastMessage: conversation.messages.slice(-1)[0],
      };
    });
    res.send(conversationData);
  } else {
    res.send({ status: "No conversations found" });
  }
});

// requset should be like this
// {
//   "users": ["user1", "user2", "user3"],
//   "message": "Hello, this is a message from AI2"
// }

app.post("/api/message-from-ai", async (req, res) => {
  const { users, message } = req.body;
  const aiId = "662926a964eb192f681f3c41";
  let results = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const conversationId = `${aiId}-${user}`;
    const conversationId2 = `${user}-${aiId}`;

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      $or: [{ conversationId }, { conversationId: conversationId2 }],
    });
    if (existingConversation) {
      // If conversation already exists, return existing conversation's MongoDB _id
      existingConversation.messages.push({ aiId, message });
      const result = await existingConversation.save();
      results.push({ status: "Message sent", result });
    } else {
      // If conversation does not exist, create new conversation and return new conversation's MongoDB _id
      const conversation = new Conversation({
        conversationId,
        aiId,
        user,
        messages: [{ aiId, message }],
      });
      const result = await conversation.save();
      results.push({ status: "Message sent", result });
    }
  }
  res.send(results);
});

app.listen(3001, () => console.log("Server running on port 3001"));
