// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    bidTime: {
        type: Date,
        default: Date.now,
        index: true
    }
});

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    phone: {
        type: String,
        required: true,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    userType: {
        type: String,
        enum: ['Client', 'Admin'],
        default: 'Client'
    },
    auctions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction'
    }],
    bids: [bidSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1, status: 1 });
userSchema.index({ userId: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Prevent duplicate email (case insensitive)
userSchema.pre('save', async function(next) {
    if (this.isModified('email')) {
        const existingUser = await this.constructor.findOne({
            email: new RegExp(`^${this.email}$`, 'i'),
            _id: { $ne: this._id }
        });
        if (existingUser) {
            throw new Error('Email already exists');
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
