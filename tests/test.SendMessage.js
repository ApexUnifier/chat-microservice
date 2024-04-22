import { request } from "http";

const sendMessageData = JSON.stringify({
  conversationId: "user1-user2",
  user: "user1",
  message: "Hello, user2!",
});

const sendMessageOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/send-message",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": sendMessageData.length,
  },
};

const sendMessageReq = request(sendMessageOptions, (res) => {
  console.log(`send-message API status: ${res.statusCode}`);
});

sendMessageReq.write(sendMessageData);
sendMessageReq.end();
