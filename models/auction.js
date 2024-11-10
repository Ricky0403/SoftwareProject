// models/auction.js
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    startingPrice: {
        type: Number,
        required: true,
        min: [0, 'Starting price cannot be negative']
    },
    currentPrice: {
        type: Number,
        required: true,
        min: [0, 'Current price cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
        type: Date,
        required: true,
        index: true,
        validate: {
            validator: function(v) {
                return v > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'ended', 'cancelled'],
        default: 'upcoming',
        index: true
    },
    bids: [{
        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Bid amount cannot be negative']
        },
        time: {
            type: Date,
            default: Date.now,
            index: true
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    minimumBidIncrement: {
        type: Number,
        default: 1,
        min: [0, 'Minimum bid increment cannot be negative']
    },
    categories: [{
        type: String,
        trim: true
    }],
    images: [{
        url: String,
        caption: String
    }]
}, {
    timestamps: true
});

// Indexes
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ itemName: 'text', description: 'text' });
auctionSchema.index({ 'bids.time': -1 });

// Middleware to update status based on time
auctionSchema.pre('save', function(next) {
    const now = new Date();
    if (this.startTime > now) {
        this.status = 'upcoming';
    } else if (this.endTime < now) {
        this.status = 'ended';
    } else {
        this.status = 'active';
    }
    next();
});

// Validation middleware for bids
auctionSchema.pre('save', function(next) {
    if (this.isModified('bids')) {
        const lastBid = this.bids[this.bids.length - 1];
        if (lastBid) {
            if (lastBid.amount <= this.currentPrice) {
                throw new Error('Bid amount must be higher than current price');
            }
            if (lastBid.amount < this.currentPrice + this.minimumBidIncrement) {
                throw new Error(`Minimum bid increment is ${this.minimumBidIncrement}`);
            }
            this.currentPrice = lastBid.amount;
        }
    }
    next();
});

module.exports = mongoose.model('Auction', auctionSchema);