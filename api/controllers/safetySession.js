const SafetySession = require("../models/safetySession");
const User = require("../models/user");

const {sendSessionStartNotifications, sendSessionEndNotifications, sendSessionExtensionNotifications, sendSessionOverdueNotifications, sendPanicButtonNotificationsActivePage } = require("../lib/twilio");
const EmergencyContact = require("../models/emergencyContact");

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
      user = await User.findById(userId);

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
      user = await User.findById(userId);
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
      user = await User.findById(userId);
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


async function overDueSession() {
  try {
    const current_date = new Date();
    const fiveMinuteAgo = new Date(current_date.getTime() - (1 * 60 * 1000)); // to be changed to 5 minutes, it's 1minute at the moment

    const overdueSessions = await SafetySession.find({
      scheduledEndTime: { $lt: fiveMinuteAgo }, // before five minutes
      actualEndTime: null, 
      overdueNotificationSent: { $ne: true } // not true
    });

    for (const session of overdueSessions) {
      try {
        const user = await User.findById(session.userId);
        await sendSessionOverdueNotifications(user, session);
        await SafetySession.findByIdAndUpdate(session._id, { overdueNotificationSent: true });
      } catch (error) {
        console.error(`Failed to send alert for session ${session._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in checkAllOverDueSession:', error);
  }
}

async function panicButtonActivePage(req, res) {
  try {
    const sessionId = req.params.id;
    const {userId} = req.body;

    const session = await SafetySession.findById(sessionId)

    if (!session) {
      return res.status(404).json({ message: "Safety session not found" });
    }
  let user;
    try {
      user = await User.findById(userId);
      const smsResult = await sendPanicButtonNotificationsActivePage(user, session)
      await SafetySession.findByIdAndUpdate(sessionId, {panicButtonPressed: true})
      res.status(200).json({
        message: `User pressed the panic button during the SafeRun.`,
        smsSent: smsResult
    });
    } catch (smsError) {
      console.error('SMS notification error: ', smsError)
      await SafetySession.findByIdAndUpdate(sessionId, {panicButtonPressed: true})
      res.status(200).json({
        message: `User pressed the panic button during the SafeRun.`, 
        smsSent: smsError.message
      })
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to activate panic button." });
  }
}


const SafetySessionController = {
  createSafetySession,
  checkIn,
  getSafetySession,
  extendSession,
  overDueSession, 
  panicButtonActivePage
};

module.exports = SafetySessionController;
