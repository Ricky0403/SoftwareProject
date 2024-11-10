const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Function to generate userId
const generateUserId = async () => {
    const prefix = 'USER';
    const count = await User.countDocuments();
    const paddedCount = String(count + 1).padStart(4, '0');
    return `${prefix}${paddedCount}`;
};

// Handle user registration
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, phone, city } = req.body;
        
        // Validate input
        if (!email || !username || !password || !phone || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Generate userId
        const userId = await generateUserId();
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({
            userId,
            email,
            username,
            password: hashedPassword,
            phone,
            city,
            userType: 'Client',
            auctions: [],
            bids: []
        });
        
        await newUser.save();
        res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Handle user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Set user session
        req.session.user = {
            id: user._id,
            userId: user.userId,
            email: user.email,
            username: user.username,
            userType: user.userType
        };
        
        res.json({ success: true, redirect: '/auction' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Add bid to user's bids array
router.post('/add-bid', async (req, res) => {
    try {
        const { auctionId, amount } = req.body;
        const userId = req.session.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.bids.push({
            auctionId,
            amount
        });

        await user.save();
        res.json({ success: true, message: 'Bid added successfully' });
    } catch (err) {
        console.error('Add bid error:', err);
        res.status(500).json({ error: 'Server error while adding bid' });
    }
});

// Add auction to user's auctions array
router.post('/add-auction', async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.session.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.auctions.includes(auctionId)) {
            user.auctions.push(auctionId);
            await user.save();
        }

        res.json({ success: true, message: 'Auction added successfully' });
    } catch (err) {
        console.error('Add auction error:', err);
        res.status(500).json({ error: 'Server error while adding auction' });
    }
});

// Get user's bids
router.get('/my-bids', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).populate('bids.auctionId');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, bids: user.bids });
    } catch (err) {
        console.error('Get bids error:', err);
        res.status(500).json({ error: 'Server error while fetching bids' });
    }
});

// Get user's auctions
router.get('/my-auctions', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).populate('auctions');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, auctions: user.auctions });
    } catch (err) {
        console.error('Get auctions error:', err);
        res.status(500).json({ error: 'Server error while fetching auctions' });
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.json({ success: true, redirect: '/login' });
    });
});

module.exports = router;