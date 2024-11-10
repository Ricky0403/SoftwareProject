require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Serve static files
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/bidding',
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/auth', authLimiter);

// Load routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bidRoutes = require('./routes/bid');
const auctionRoutes = require('./routes/auction');

// Authentication middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user && 
        !req.path.startsWith('/auth') && 
        !req.path.startsWith('/login') && 
        !req.path.startsWith('/register')) {
        return res.redirect('/login');
    }
    next();
};

// Basic routes - IMPORTANT: These need to be before the API routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/auction');
    }
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/auction');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// API routes
app.use('/auth', authRoutes);
app.use('/user', checkAuth, userRoutes);
app.use('/bid', checkAuth, bidRoutes);
app.use('/auction', checkAuth, auctionRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - This should be the last middleware
app.use((req, res) => {
    res.status(404).json({ error: 'Page not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bidding', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;