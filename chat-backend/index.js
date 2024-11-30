const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

// Setup CORS for WebSocket connections
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (needed for local testing or different domains)
        methods: ["GET", "POST"]
    }
});

// Define some predefined usernames for your chat
const predefinedUsernames = ['Sara', 'Eva', 'Lum'];
let users = {};

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user sends a message
    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        socket.broadcast.emit('receive_message', data); // Broadcast message to all clients except sender
    });

    // When a user sets a username
    socket.on('set_username', (username) => {
        if (predefinedUsernames.includes(username) && !Object.values(users).includes(username)) {
            users[socket.id] = username;
            io.emit('user_list', Object.values(users)); // Broadcast updated user list to all users
        } else {
            socket.emit('username_taken'); // Notify user if username is invalid or taken
        }
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user_list', Object.values(users)); // Update user list when someone disconnects
    });
});

// Listen on dynamic port for Render
const port = process.env.PORT || 5000; // Render assigns a dynamic port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

