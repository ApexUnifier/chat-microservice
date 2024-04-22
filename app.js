import express from 'express'; 
import http from 'http';
import { Server } from 'socket.io'; 
import dotenv from 'dotenv'; 
import cors from 'cors'; 

import './db/connection.js';

import axios from 'axios';

import Conversations from './models/Conversations.js';
import Messages from './models/Messages.js'; 

dotenv.config(); 

const frontPort = process.env.FRONTPORT; // Getting frontend port from environment variables
const port = process.env.PORT || 8000; // Setting the server port, default to 8000 if not specified in environment variables

const app = express(); 
const httpServer = http.createServer(app); // Creating an HTTP server using Express app



const io = new Server(httpServer, { // Creating a Socket.IO server instance
    cors: {
        origin: `http://localhost:${frontPort}`, // Allowing CORS for frontend port
    }
});


app.use(express.json()); // Middleware to parse JSON bodies in requests
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies in requests
app.use(cors()); // Using CORS middleware to handle CORS headers



let users = []; // Array to store connected users

// defining function for getting data
const backendUrl = process.env.BACKENDURL;
const getData =async (userId) =>{
    return await axios.get(`${backendUrl}/api/user/${userId}`)
    .catch(error => {
        console.error(`Error: ${error}`);
    });
}

io.on('connection', socket => { // Event listener for new socket connections
    console.log('User connected', socket.id);

    socket.on('addUser', userId => { // Event listener for adding new user
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => { // Event listener for sending messages
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await getData(senderId);// use axios to fetch user by userid.
        
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', { // Emitting message to sender and receiver
                senderId,
                message,
                conversationId,
                receiverId,
                user: { _id: user._id, name: user.name, email: user.email }
            });
        } else {
            io.to(sender.socketId).emit('getMessage', { // Emitting message to sender only
                senderId,
                message,
                conversationId,
                receiverId,
                user: { _id: user._id, name: user.name, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => { // Event listener for socket disconnection
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});

app.get('/', (req, res) => { // Route for root endpoint
    res.send('<h1>Welcome to Chat Server<h1>');
});

app.post('/api/conversation', async (req, res) => { // Route for creating conversation
    try {
        const { senderId, receiverId } = req.body;
        const newCoversation = new Conversations({ members: [senderId, receiverId] });
        await newCoversation.save();
        res.status(200).send('Conversation created successfully');
    } catch (error) {
        console.log(error, 'Error')
    }
});

app.get('/api/conversations/:userId', async (req, res) => { // Route for getting conversations
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await getData(receiverId); //change
            return { user: { receiverId: user._id, email: user.email, name: user.name }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData);
    } catch (error) {
        console.log(error, 'Error')
    }
});

app.post('/api/message', async (req, res) => { // Route for sending messages
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if (!senderId || !message) return res.status(400).send('Please fill all required fields')
        if (conversationId === 'new' && receiverId) {
            const newCoversation = new Conversations({ members: [senderId, receiverId] });
            await newCoversation.save();
            const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields')
        }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.log(error, 'Error')
    }
});

app.get('/api/message/:conversationId', async (req, res) => { // Route for getting messages
    try {
        const checkMessages = async (conversationId) => {
            console.log(conversationId, 'conversationId');
            const messages = await Messages.findById( {conversationId});
            console.log(messages.body);
            // const messageUserData = Promise.all(messages.body.map(async (message) => {
            //     try {
            //         const user = await getData(message.senderId);
            //         if (user && user._id) {
            //             return { user: { id: user._id, email: user.email, name: user.name }, message: message.message };
            //         } else {
            //             console.error("User or user._id is undefined");
            //             return null; // or handle the case where user or user._id is undefined
            //         }
            //     } catch (error) {
            //         console.error("Error fetching user data:", error);
            //         return null; // or handle the error
            //     }
            // }));
            res.status(200).json(await messageUserData);
        };
        
        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId);
        }
    } catch (error) {
        console.log('Error', error)
    }
});

// app.get('/api/users/:userId', async (req, res) => { // Route for getting users
//     try {
//         const userId = req.params.userId;
//         const users = await getData(userId);
//         const usersData = Promise.all(users.map(async (user) => {
//             return { user: { email: user.email, name: user.name, receiverId: user._id } }
//         }))
//         res.status(200).json(await usersData);
//     } catch (error) {
//         console.log('Error', error)
//     }
// });

httpServer.listen(port, () => { // Starting the server
    console.log('listening on port ' + port);
});
