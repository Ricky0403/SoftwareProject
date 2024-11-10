const express = require('express');
const router = express.Router();
const Bid = require('../models/bid');

// Create bid
router.post('/create', async (req, res) => {
  const { itemName, price, auctioneer } = req.body;
  const newBid = new Bid({ itemName, price, auctioneer });
  await newBid.save();
  res.redirect('/bid');
});

module.exports = router;
