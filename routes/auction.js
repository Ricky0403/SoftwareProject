const express = require('express');
const router = express.Router();
const Auction = require('../models/auction');

// Middleware to ensure user is authenticated (add this if you have authentication)
const isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Route to create a new auction (using user email for reference)
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { productName, description, startingPrice } = req.body;
    const createdBy = req.user.email;  // Assume user email is stored in session (req.user.email)

    const newAuction = new Auction({
      productName,
      description,
      startingPrice,
      createdBy
    });

    await newAuction.save();  // Save the auction to MongoDB
    res.status(200).send('Auction created successfully');  // Send success response
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).send('Failed to create auction');
  }
});

module.exports = router;
