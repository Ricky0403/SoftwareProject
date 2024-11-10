const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  auctioneer: { type: String, required: true },
  bidder: { type: String },
  status: { type: String, default: "open" },
});

module.exports = mongoose.model('Bid', bidSchema);
