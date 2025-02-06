require('dotenv').config(); // Ensure dotenv is loaded first to access environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
/*const authenticate = require('./middleware/authenticate'); */// Import the authenticate middleware
const authenticate = require('./middleware/authenticate');

// Initialize the app and create an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL (adjust accordingly in production)
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Ensure authorization headers are allowed
  })
);
app.use(bodyParser.json());

// Store connected users in a Map
const onlineUsers = new Map();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user connection with userId
  socket.on('userConnected', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    } else {
      console.error('No userId provided for userConnected event.');
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/profile', authenticate, profileRoutes); // Protect profile routes with middleware

// Utility function to send notifications
const sendNotificationByAgeCategory = async (ageCategory, message) => {
  try {
    const User = require('./modules/User'); // Make sure the path to the User model is correct
    const users = await User.find({ ageCategory });

    if (!users || users.length === 0) {
      console.warn(`No users found for age category: ${ageCategory}`);
      return;
    }

    users.forEach((user) => {
      const socketId = onlineUsers.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit('notification', message); // Emit notification
      }
    });
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

// Example route to trigger notifications
app.post('/send-notification', authenticate, async (req, res) => {
  const { ageCategory, message } = req.body;

  if (!ageCategory || !message) {
    return res.status(400).json({ message: 'Age category and message are required' });
  }

  try {
    await sendNotificationByAgeCategory(ageCategory, message);
    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (err) {
    console.error('Error in /send-notification route:', err);
    res.status(500).json({ message: 'Error sending notifications' });
  }
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
