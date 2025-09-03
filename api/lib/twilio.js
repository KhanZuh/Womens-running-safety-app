const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilio_number = process.env.TWILIO_PHONE_NUMBER;

// const emergencyNumber = "+19173528634"; // This can now be deleted, leaving it for now in case anyone needs as reference

async function sendSMS(to, message) {
  try {
    return await client.messages.create({
      body: message,
      from: twilio_number,
      to,
    });
  } catch (error) {
    console.error("Twilio SMS error:", error);
    throw error;
  }
}

// Send notification when starting session 
async function sendSessionStartNotifications(user, session) {
  const message = `${user.fullname} started a run using SafeRun. They plan to run for ${session.duration} minutes. You'll be notified again when they confirm they're safe.`;

  try {
    const result = await sendSMS(user.emergencyContact.phoneNumber, message);
    console.log("SMS sent successfully.");
    return result;
  } catch (error) {
    console.error(`Failed to send SMS. Error: ${error.message}`);
  }
}

// Send notification when ending session 
async function sendSessionEndNotifications(user, session) {
    const message = `Update: ${user.fullname} has safely finished their SafeRun at ${session.actualEndTime.toLocaleTimeString()}. All is well!`;

    try {
        const result = await sendSMS(user.emergencyContact.phoneNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}


// Send notification when extending session 
async function sendSessionExtensionNotifications(user, session) {
    const message = `Update: ${user.fullname} has extended the session by 15 minutes. They should finish their SafeRun at ${session.scheduledEndTime.toLocaleTimeString()}.`;

    try {
        const result = await sendSMS(user.emergencyContact.phoneNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}

// Send notification when session is overdue (user hasn't checked in at the expected time) 
async function sendSessionOverdueNotifications(user, session) {
    const message = `Alert: ${user.fullname} has not confirmed they are safe after their running session! Session was scheduled to end at ${session.scheduledEndTime.toLocaleTimeString()}. Please contact them immediately.`;

    try {
        const result = await sendSMS(user.emergencyContact.phoneNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}


// Send notification when user presses panic button in the active page
async function sendPanicButtonNotificationsActivePage(user) {
  const message = `Alert: ${user.fullname} pressed the panic button during the SafeRun. Please check in with them immediately.`;
  try {
    const result = await sendSMS(user.emergencyContact.phoneNumber, message);
    console.log('SMS sent successfully');
    return result;
  } catch(error) {
    console.error(`Failed to send SMS. Error: ${error.message}`)
  }
}

module.exports = { 
    sendSMS, 
    sendSessionStartNotifications, 
    sendSessionEndNotifications,
    sendSessionExtensionNotifications, 
    sendSessionOverdueNotifications, 
    sendPanicButtonNotificationsActivePage
};
