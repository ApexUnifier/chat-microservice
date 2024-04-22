import { request } from "http";

const Ids = {
  user1: "65d1210bc1e18100fbef906f",
  user2: "65d15476539858a5fff8e987",
  conversationId: "66256a9b8c22d51cbfd53da5",
};

const options = [
  {
    hostname: "localhost",
    port: 3001,
    path: "/",
    method: "GET",
  },
  {
    hostname: "localhost",
    port: 3001,
    path: "/api/conversation",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    hostname: "localhost",
    port: 3001,
    path: "/api/conversations/" + Ids.user1,
    method: "GET",
  },
  {
    hostname: "localhost",
    port: 3001,
    path: "/api/message",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    hostname: "localhost",
    port: 3001,
    path: "/api/message/" + Ids.conversationId,
    method: "GET",
  },
];

// Define the data for the POST requests
const data = [
  {},
  {
    senderId: Ids.user1,
    receiverId: Ids.user2,
  },
  {},
  {
    conversationId: Ids.conversationId,
    receiverId: Ids.user1,
    text: "Hello, world!",
  },
  {},
];

// Make the requests
for (let i = 0; i < options.length; i++) {
  const req = request(options[i], (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  if (options[i].method === "POST") {
    req.write(JSON.stringify(data[i]));
  }

  req.end();
}
