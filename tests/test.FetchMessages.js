import { request } from "http";
import { testData } from "./testdata.js";

const fetchMessagesOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/api/fetch-messages/" + testData.conversationId,
  method: "GET",
};

const fetchMessagesReq = request(fetchMessagesOptions, (res) => {
  console.log(
    `fetch-messages API status: ${res.statusMessage} ${res.statusCode}`
  );
});

fetchMessagesReq.end();
