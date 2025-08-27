const SafetySession = require("../models/safetySession");

async function createSafetySession(req, res) {
  try {
    const { userId, duration } = req.body;

    const startTime = new Date();
    const scheduledEndTime = new Date(
      startTime.getTime() + duration * 60 * 1000
    );

    const safetySession = new SafetySession({
      userId,
      duration,
      startTime,
      scheduledEndTime,
    });

    const savedSession = await safetySession.save();
    console.log("Safety session created, id:", savedSession._id.toString());

    res.status(201).json({
      message: "Safety session started successfully",
      safetySession: savedSession,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create safety session" });
  }
}

async function checkIn(req, res) {
  try {
    const sessionId = req.params.id;

    const session = await SafetySession.findByIdAndUpdate(
      sessionId,
      { actualEndTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Safety session not found" });
    }

    res.status(200).json({
      message: "Check-in successful! You're safe.",
      safetySession: session,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to check in" });
  }
}

const SafetySessionController = {
  createSafetySession,
  checkIn,
};

module.exports = SafetySessionController;
