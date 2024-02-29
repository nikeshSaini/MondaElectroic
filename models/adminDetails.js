const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures email is unique
      // You can add additional validation for email format using regex or custom validation functions
    },
    password: {
      type: String,
      required: true
      // You can add additional validation for password strength if needed
    }
  });


  const adminDetails = mongoose.model('adminDetails', adminSchema);

module.exports = adminDetails;