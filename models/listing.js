const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for listings
const listingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  img: { 
    type: String,
    required: true
  },
  expenditure: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

// Create a model using the schema
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
