import { request } from "http";

const fetchMessagesOptions = {
  hostname: "localhost",
  port: 3001,
  path: "/fetch-messages/user1-user2",
  method: "GET",
};

const fetchMessagesReq = request(fetchMessagesOptions, (res) => {
  console.log(`fetch-messages API status: ${res.statusCode}`);
  // console.log(res);
});

fetchMessagesReq.end();
