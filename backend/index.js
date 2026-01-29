const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const eventRoutes = require('./routes/events');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
    res.send('School Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
