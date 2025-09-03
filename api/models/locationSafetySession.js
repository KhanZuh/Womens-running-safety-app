const mongoose = require("mongoose");

const LocationSafetySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  // Location-specific fields
  startCoords: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },

  endCoords: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },

  // Session status
  status: {
    type: String,
    enum: ["active", "completed", "emergency"],
    default: "active",
  },

  // Timing
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },

  // Check-in tracking
  checkInCount: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  nextCheckInDue: { type: Date },

  // Emergency tracking
  emergencyAlertSent: { type: Boolean, default: false },
  emergencyAlertTime: { type: Date },

  // Current position tracking
  currentPosition: {
    latitude: { type: Number },
    longitude: { type: Number },
    timestamp: { type: Date },
  },

  // Metadata
  estimatedDistance: { type: Number }, // in kilometers
  estimatedDuration: { type: Number }, // in minutes
  reachedDestination: { type: Boolean, default: false },
});

const LocationSafetySession = mongoose.model(
  "LocationSafetySession",
  LocationSafetySessionSchema
);

module.exports = LocationSafetySession;
