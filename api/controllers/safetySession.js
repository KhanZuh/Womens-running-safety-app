const SafetySession = require("../models/safetySession");
const User = require("../models/user");

const {sendSessionStartNotifications, sendSessionEndNotifications, sendSessionExtensionNotifications, sendSessionOverdueNotifications } = require("../lib/twilio")

async function getSafetySession(req, res) {
  try {
    const sessionId = req.params.id;
    const session = await SafetySession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Safety session not found" });
    }

    res.status(200).json({
      message: "Safety session retrieved successfully",
      safetySession: session,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to retrieve safety session" });
  }
}

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

    let user;
    try {
      user = await User.findById(userId).populate("emergencyContact");

      const smsResult = await sendSessionStartNotifications(user, savedSession);

      res.status(201).json({
        message: "Safety session started successfully",
        sessionId: savedSession._id,
        safetySession: savedSession,
        smsSent: smsResult
      });
    } catch (smsError) {
      console.error("SMS notification error: ", smsError);

      res.status(201).json({
        message: "Safety session started successfully, but notification failed",
        sessionId: savedSession._id, //bug fix - needed to include sessionId
        safetySession: savedSession,
        notificationError: "SMS notification failed",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create safety session" });
  }
}

async function checkIn(req, res) {
  try {
    const sessionId = req.params.id;
    const {userId} = req.body;

    const session = await SafetySession.findByIdAndUpdate(
      sessionId,
      { actualEndTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Safety session not found" });
    }

    let user;
    try {
      user = await User.findById(userId).populate('emergencyContact');
      const smsResult = await sendSessionEndNotifications(user, session)

      res.status(200).json({
        message: "Check-in successful! You're safe.",
        safetySession: session,
        smsSent: smsResult
    });
    } catch (smsError) {
      console.error('SMS notification error: ', smsError)
      res.status(200).json({
        message: "Check-in successful! You're safe.",
        safetySession: session,
        notificationError: "SMS notification failed"
      });
    }

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to check in" });
  }
}

async function extendSession(req, res) {
  try {
    const sessionId = req.params.id;
    const { additionalMinutes = 15 } = req.body;
    const {userId} = req.body;

    const session = await SafetySession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Safety session not found" });
    }

    // Extend the scheduledEndTime
    const newEndTime = new Date(
      session.scheduledEndTime.getTime() + additionalMinutes * 60 * 1000
    );

    const updatedSession = await SafetySession.findByIdAndUpdate(
      sessionId,
      { scheduledEndTime: newEndTime },
      { new: true }
    );
    let user;
    try {
      user = await User.findById(userId).populate('emergencyContact');
      const smsResult = await sendSessionExtensionNotifications(user, session)
      res.status(200).json({
        message: `Session extended by ${additionalMinutes} minutes`,
        safetySession: updatedSession,
        smsSent: smsResult
    });
    } catch (smsError) {
      console.error('SMS notification error: ', smsError)
      res.status(200).json({
        message: `Session extended by ${additionalMinutes} minutes`, 
        safetySession: updatedSession,
        smsSent: smsResult
      })
    }

    
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to extend session" });
  }
}

const SafetySessionController = {
  createSafetySession,
  checkIn,
  getSafetySession,
  extendSession,
};

module.exports = SafetySessionController;
