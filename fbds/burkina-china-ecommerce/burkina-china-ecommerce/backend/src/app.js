const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Socket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join user-specific room for personalized updates
  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in controllers
module.exports = { app, server, io };