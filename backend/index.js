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

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true, // Allow any origin dynamically (for local network access)
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/toppers', topperRoutes);
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/public', require('./routes/public'));

app.use('/api/upload', require('./routes/upload'));

// Serve Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('School Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
