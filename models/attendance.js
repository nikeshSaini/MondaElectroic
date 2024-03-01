const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workSessionSchema = new mongoose.Schema({
    userId: {
      type:String,
      required: true
    },
    startTime: Date,
    endTime: Date,
    location: {
      type: {
        type: String, // Specify the type of geometry
        enum: ['Point'], // Specify the type of geometry as 'Point'
      },
      coordinates: {
        type: [Number], // Array of numbers
      }
    }
  });

  const WorkSession = mongoose.model('WorkSession', workSessionSchema);

  module.exports = WorkSession;