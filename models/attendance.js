const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workSessionSchema = new mongoose.Schema({
    userId: {
      type:String,
      required: true
    },
    startTime: Date,
    endTime: Date
  });

  const WorkSession = mongoose.model('WorkSession', workSessionSchema);

  module.exports = WorkSession;