const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilio_number = process.env.TWILIO_PHONE_NUMBER;

const emergencyNumber = "+191735286346"; // hardcoded number - this will need to change - added a six so that this feature doesn't work for rate limiting purposes

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

// Send notification when starting session - will need to get the user name from the users once it's done
async function sendSessionStartNotifications(user, session) {
  const message = `Elena started a run using SafeRun. They plan to run for ${session.duration} minutes. You'll be notified again when they confirm they're safe.`;

  try {
    const result = await sendSMS(emergencyNumber, message);
    console.log("SMS sent successfully.");
    return result;
  } catch (error) {
    console.error(`Failed to send SMS. Error: ${error.message}`);
  }
}

// Send notification when ending session - will need to get the user name from the users once it's done
async function sendSessionEndNotifications(user, session) {
    const message = `Update: Elena has safely finished their SafeRun at ${session.actualEndTime.toLocaleTimeString()}. All is well!`;

    try {
        const result = await sendSMS(emergencyNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}


// Send notification when extending session - will need to get the user name from the users once it's done
async function sendSessionExtensionNotifications(user, session) {
    const message = `Update: Elena has extended the session by 15 minutes. They should finish their SafeRun at ${session.scheduledEndTime.toLocaleTimeString()}.`;

    try {
        const result = await sendSMS(emergencyNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}

// Send notification when session is overdue - will need to get the user name from the users once it's done
async function sendSessionOverdueNotifications(user, session) {
    const message = `Alert: Elena has not confirmed they are safe after their running session! Session was scheduled to end at ${session.scheduledEndTime.toLocaleTimeString()}. Please contact them immediately.`;

    try {
        const result = await sendSMS(emergencyNumber, message);
        console.log("SMS sent successfully.");
        return result;

    } catch (error) {
        console.error(`Failed to send SMS. Error: ${error.message}`);
    }
}

module.exports = { 
    sendSMS, 
    sendSessionStartNotifications, 
    sendSessionEndNotifications,
    sendSessionExtensionNotifications, 
    sendSessionOverdueNotifications
};
