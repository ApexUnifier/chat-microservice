import { request } from "http";
import { testData } from "./testdata.js";

const sendMessageData = JSON.stringify({
  conversationId: testData.conversationId,
  user: testData.IdUser1,
  message: testData.message,
});

const sendMessageOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/api/send-message",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": sendMessageData.length,
  },
};

const sendMessageReq = request(sendMessageOptions, (res) => {
  console.log(
    `send-message API status: ${res.statusMessage} ${res.statusCode}`
  );
});

sendMessageReq.write(sendMessageData);
sendMessageReq.end();
