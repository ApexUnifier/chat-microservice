import { request } from "http";

const createConversationData = JSON.stringify({
  user1: "user1",
  user2: "user2",
});

const createConversationOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/create-conversation",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": createConversationData.length,
  },
};

const createConversationReq = request(createConversationOptions, (res) => {
  console.log(
    `create-conversation API status: ${res.statusMessage} ${res.statusCode}`
  );
});

createConversationReq.write(createConversationData);
createConversationReq.end();
