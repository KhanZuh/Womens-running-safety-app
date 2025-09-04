const LocationSafetySession = require("../models/locationSafetySession");
const User = require("../models/user");
const {sendSessionStartNotifications, sendSessionEndNotifications, sendPanicButtonNotificationsActivePage} = require("../lib/twilio")

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper function to calculate next check-in time
const calculateNextCheckIn = (sessionStart, checkInCount) => {
  const now = new Date();
  const sessionStartTime = new Date(sessionStart);

  let nextCheckInMinutes;
  // TESTING VERSION: DELTE AFTER
  if (checkInCount === 0) {
    nextCheckInMinutes = 1; //
  } else {
    nextCheckInMinutes = 1 + checkInCount * 2;
  }

  // REAL VERSION - Commented out for testing - replace the test version with this once test complete
  // if (checkInCount === 0) {
  //   // First check-in after 1 hour
  //   nextCheckInMinutes = 60;
  // } else {
  //   // Subsequent check-ins every 45 minutes
  //   nextCheckInMinutes = 60 + checkInCount * 45;
  // }

  return new Date(sessionStartTime.getTime() + nextCheckInMinutes * 60 * 1000);
};

const LocationSafetySessionController = {
  // Create new location safety session
  create: async (req, res) => {
    try {
      const { userId, startCoords, endCoords } = req.body;

      console.log("Creating location safety session:", {
        userId,
        startCoords,
        endCoords,
      });

      // Calculate estimated distance
      const distance = calculateDistance(
        startCoords.latitude,
        startCoords.longitude,
        endCoords.latitude,
        endCoords.longitude
      );

      // Estimate duration (assume 10 min/km running pace)
      const estimatedDuration = Math.ceil(distance * 10);

      // Calculate first check-in time (1 hour from now)
      const nextCheckInDue = calculateNextCheckIn(new Date(), 0);

      const locationSafetySession = new LocationSafetySession({
        userId,
        startCoords,
        endCoords,
        estimatedDistance: distance,
        estimatedDuration,
        nextCheckInDue,
      });

      await locationSafetySession.save();

      console.log(
        "Location safety session created:",
        locationSafetySession._id
      );

      try {
        const user = await User.findById(userId);
        const sessionForNotification = {
          duration: estimatedDuration
        }
        const smsResult = await sendSessionStartNotifications(user, sessionForNotification)
        res.status(201).json({
          message: "Location safety session created successfully",
          sessionId: locationSafetySession._id,
          safetySession: locationSafetySession,
          smsSent: smsResult,
        });
      } catch (smsError) {
        console.error("SMS notification error", smsError)
         res.status(201).json({
          message: "Location safety session created successfully, but notification failed",
          sessionId: locationSafetySession._id,
          safetySession: locationSafetySession,
          notificationError: "SMS notification failed",
        });
      }
    } catch (error) {
      console.error("Error creating location safety session:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get session by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const session = await LocationSafetySession.findById(id);

      if (!session) {
        return res
          .status(404)
          .json({ message: "Location safety session not found" });
      }

      res.status(200).json({
        message: "Location safety session retrieved successfully",
        safetySession: session,
      });
    } catch (error) {
      console.error("Error retrieving location safety session:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Update current position
  updatePosition: async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      const session = await LocationSafetySession.findById(id);

      if (!session) {
        return res
          .status(404)
          .json({ message: "Location safety session not found" });
      }

      // Update current position
      session.currentPosition = {
        latitude,
        longitude,
        timestamp: new Date(),
      };

      // Check if user has reached destination (within 100m)
      const distanceToEnd = calculateDistance(
        latitude,
        longitude,
        session.endCoords.latitude,
        session.endCoords.longitude
      );

      const hasReachedDestination = distanceToEnd <= 0.1; // 100 meters = 0.1 km

      if (hasReachedDestination && !session.reachedDestination) {
        session.reachedDestination = true;
        session.status = "completed";
        session.endTime = new Date();
        console.log(`Session ${id} completed - user reached destination`);
      }

      await session.save();

      res.status(200).json({
        message: "Position updated successfully",
        safetySession: session,
        distanceToDestination: distanceToEnd,
        reachedDestination: hasReachedDestination,
      });
    } catch (error) {
      console.error("Error updating position:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Handle check-in
  checkIn: async (req, res) => {
    try {
      const { id } = req.params;
      const { checkInType = "safe" } = req.body; // "safe" or "emergency"

      const session = await LocationSafetySession.findById(id);

      if (!session) {
        return res
          .status(404)
          .json({ message: "Location safety session not found" });
      }

      if (checkInType === "emergency") {
        session.status = "emergency";
        session.emergencyAlertSent = true;
        session.emergencyAlertTime = new Date();
        console.log(`Emergency alert triggered for session ${id}`);

        // TODO: Send emergency notification to contacts - through twilio
        // Need to create function in twilio.js --> then call function here within a try catch block awaiting that function call
      } else {
        // Safe check-in
        session.checkInCount += 1;
        session.lastCheckIn = new Date();
        session.nextCheckInDue = calculateNextCheckIn(
          session.startTime,
          session.checkInCount
        );

        console.log(`Safe check-in #${session.checkInCount} for session ${id}`);
      }

      await session.save();

      res.status(200).json({
        message: `${
          checkInType === "emergency"
            ? "Emergency alert sent"
            : "Check-in recorded"
        } successfully`,
        safetySession: session,
      });
    } catch (error) {
      console.error("Error processing check-in:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Manual session end
  endSession: async (req, res) => {
    try {
      const { id } = req.params;

      const session = await LocationSafetySession.findById(id);

      if (!session) {
        return res
          .status(404)
          .json({ message: "Location safety session not found" });
      }

      session.status = "completed";
      session.endTime = new Date();

      try {
        const user = await User.findById(session.userId);
        const sessionForNotification = {
          actualEndTime: session.endTime,
        };
        const smsResult = await sendSessionEndNotifications(user, sessionForNotification);
        await session.save();
        console.log(`Location safety session ${id} ended manually`);
  
        res.status(200).json({
          message: "Location safety session ended successfully",
          safetySession: session,
          smsSent: smsResult,
        });
      } catch (smsError) {
        console.error("SMS notification error: ", smsError);
        await session.save();
        res.status(200).json({
          message: "Location safety session ended successfully, but notification failed",
          safetySession: session,
          notificationError: "SMS notification failed",
        })
      }


    } catch (error) {
      console.error("Error ending location safety session:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = LocationSafetySessionController;
