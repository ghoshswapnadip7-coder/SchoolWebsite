const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const RoomSettings = require('../models/RoomSettings');

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Middleware: Authenticate
const authenticate = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Check block status
        const user = await User.findById(decoded.userId);
        if (user && user.isBlocked) {
            return res.status(403).json({ error: 'Account Restricted', isBlocked: true });
        }
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware: Admin Only
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// GET /history/:room - Get last 50 messages
router.get('/history/:room', authenticate, async (req, res) => {
    try {
        const { room } = req.params;
        // Filter out deleted and flagged (under review) messages
        // But maybe show YOUR OWN flagged messages? For now, keep simple: hide all flagged.
        const messages = await Chat.find({ 
            room, 
            isDeleted: false,
            isFlagged: false 
        })
            .sort({ timestamp: 1 }) 
            .limit(100); 
            
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /pinned/:room - Get Pinned Messages (Exclude deleted)
router.get('/pinned/:room', authenticate, async (req, res) => {
    try {
        const { room } = req.params;
        const pinned = await Chat.find({ room, isPinned: true, isDeleted: false }).sort({ timestamp: 1 });
        res.json(pinned);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pinned' });
    }
});

// POST /delete - Soft Delete Message
router.post('/delete', authenticate, async (req, res) => {
    try {
        const { messageId } = req.body;
        const message = await Chat.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        // Permission: Admin can delete any. Teacher can delete Student messages.
        const canDelete = req.user.role === 'ADMIN' || 
                         (req.user.role === 'TEACHER' && message.senderRole === 'STUDENT');

        if (!canDelete) {
            return res.status(403).json({ error: 'Unauthorized to delete this message' });
        }

        message.isDeleted = true;
        message.deletedBy = req.user.userId;
        await message.save();

        // Emit socket event to remove from UI instantly
        const io = req.app.get('io');
        if (io) {
            io.to(message.room).emit('message_deleted', { messageId });
        }

        res.json({ success: true, messageId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// GET /flagged - Get Flagged Messages (Admin Only)
router.get('/flagged', authenticateAdmin, async (req, res) => {
    try {
        const flagged = await Chat.find({ isFlagged: true, isDeleted: false }).sort({ timestamp: -1 });
        res.json(flagged);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch flagged messages' });
    }
});

// POST /resolve - Resolve Flagged Message (Admin Only)
router.post('/resolve', authenticateAdmin, async (req, res) => {
    try {
        const { messageId, action } = req.body; // action: 'approve' or 'reject'
        const message = await Chat.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        if (action === 'approve') {
            message.isFlagged = false; // Make it visible
            await message.save();
             // Broadcast it now as if it was just received
             const io = req.app.get('io');
             if (io) {
                 io.to(message.room).emit('receive_message', {
                     ...message.toObject(),
                     author: message.senderName, // Ensure format matches frontend expectation
                     authorId: message.sender,
                     authorRole: message.senderRole,
                     message: message.content,
                     time: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                 });
             }
        } else if (action === 'reject') {
            message.isDeleted = true; // Soft delete (stays in DB but hidden)
            message.deletedBy = req.user.userId;
            await message.save();
        }

        res.json({ success: true, messageId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve message' });
    }
});

// POST /pin - Toggle Pin Status (Teacher/Admin) - Using Admin Middleware? Or Custom?
// Teachers should also be able to pin.
router.post('/pin', authenticate, async (req, res) => {
    try {
        const { messageId } = req.body;
        
        // Check Role
        if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
             return res.status(403).json({ error: 'Only Teachers and Admins can pin messages.' });
        }

        const message = await Chat.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        message.isPinned = !message.isPinned;
        await message.save();
        
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle pin' });
    }
});

// GET /status/:room - Get room settings (enabled/disabled)
router.get('/status/:room', authenticate, async (req, res) => {
    try {
        const { room } = req.params;
        const settings = await RoomSettings.findOne({ room });
        res.json(settings || { room, isDisabled: false });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// POST /toggle - Toggle Room Status (Admin)
router.post('/toggle', authenticateAdmin, async (req, res) => {
    try {
        const { room } = req.body;
        let settings = await RoomSettings.findOne({ room });
        
        if (!settings) {
            settings = await RoomSettings.create({ room, isDisabled: true });
        } else {
            settings.isDisabled = !settings.isDisabled;
            await settings.save();
        }
        
        // Instant Action: emit event to all clients in that room (or all clients?)
        // Room status affects specific room, so emit to room.
        // Wait, clients might not be joined if disabled? 
        // Clients are joined to the room string.
        const io = req.app.get('io');
        if (io) {
            io.to(room).emit('room_status_update', { room, isDisabled: settings.isDisabled });
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle room' });
    }
});

module.exports = router;
