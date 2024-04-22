import { request } from "http";
import { testData } from "./testdata.js";

const createConversationData = JSON.stringify({
  user1: testData.IdUser1,
  user2: testData.IdUser2,
});

const createConversationOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/api/create-conversation",
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
