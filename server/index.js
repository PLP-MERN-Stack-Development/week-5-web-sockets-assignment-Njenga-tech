const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Make sure this matches your frontend URL
    methods: ["GET", "POST"]
  }
});

// 👇 Socket.io setup
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Receive a message and broadcast to everyone
  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  // ✅ Typing event support
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username); // Send to others except sender
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// Root route
app.get('/', (req, res) => res.send('Server running'));

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
