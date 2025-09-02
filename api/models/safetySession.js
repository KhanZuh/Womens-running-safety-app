const mongoose = require("mongoose");

// A Schema defines the "shape" of entries in a collection. This is similar to
// defining the columns of an SQL Database.
const SafetySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  duration: { type: Number, required: true },
  startTime: { type: Date, required: true },
  scheduledEndTime: { type: Date, required: true },
  actualEndTime: { type: Date },
  overdueNotificationSent: {type: Boolean, default: false},
  panicButtonPressed: {type: Boolean, default: false},
  // can have an enum for status, type string, "active, completed, overdue"
});

// Maybe need emergnecy contact id and for post MVP location references

const SafetySession = mongoose.model("SafetySession", SafetySessionSchema);

// const dateTimeString = new Date().toLocaleString("en-GB");
// new Post({ message: `Test message, created at ${dateTimeString}` }).save();

module.exports = SafetySession;
