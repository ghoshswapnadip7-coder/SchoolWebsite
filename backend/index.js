const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const topperRoutes = require('./routes/toppers');

const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/Chat');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true, // Allow any origin dynamically (for local network access)
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Global Request Logger (Disabled for cleaner logs)
// app.use((req, res, next) => {
//     console.log(`[REQ] ${req.method} ${req.url}`);
//     next();
// });

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: true, // Allow matching client origin
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('io', io);

io.on('connection', (socket) => {
    // console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        // console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    const BANNED_WORDS = ['badword', 'abuse', 'kill', 'stupid', 'idiot', 'uck']; // Add more real words as needed

    socket.on('send_message', async (data, callback) => {
        // data: { room, author, message, type }
        // console.log("Message Received:", data);
        
        let isFlagged = false;
        let violationReason = null;
        let mentions = [];

        // 1. Text Filter
        if (data.message) {
            const lowerMsg = data.message.toLowerCase();
            if (BANNED_WORDS.some(word => lowerMsg.includes(word))) {
                isFlagged = true;
                violationReason = 'profanity';
            }

            // 2. Mention Parsing
            const mentionMatches = data.message.match(/@(\w+)/g);
            if (mentionMatches) {
                mentions = mentionMatches.map(m => m.substring(1)); // Remove @
            }
        }

        // Save to DB
        try {
            if (data.author && data.room) {
                 const user = await require('./models/User').findById(data.authorId);
                 const role = user ? user.role : 'STUDENT';

                 const newMessage = new Chat({
                    room: data.room,
                    sender: data.authorId, 
                    senderName: data.author,
                    senderRole: role,
                    content: data.message,
                    type: data.type || 'TEXT',
                    timestamp: new Date(),
                    isPinned: false,
                    isFlagged,
                    violationReason,
                    mentions
                });
                const savedMsg = await newMessage.save(); // Save to get ID
                
                // Augment data
                data.senderRole = role; 
                data.isFlagged = isFlagged;
                data.id = savedMsg._id;
                data.mentions = mentions;
                
                if (isFlagged) {
                    // Notify Sender only
                    socket.emit('message_flagged', { 
                        message: "Your message has been flagged for review due to inappropriate content.",
                        msgId: savedMsg._id 
                    });
                    // Also Notify Admins (if any connected) - can implement separate room for admins
                    // For now, just save it.
                } else {
                    // Broadcast to Room (exclude sender)
                    socket.to(data.room).emit('receive_message', data);
                }

                // Acknowledge to Sender
                if (typeof callback === 'function') {
                    callback(data);
                }
            }
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on('disconnect', () => {
        // console.log("User Disconnected", socket.id);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/toppers', topperRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/public', require('./routes/public'));

app.use('/api/upload', require('./routes/upload'));

// Serve Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('School Backend is Running');
});

server.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});
