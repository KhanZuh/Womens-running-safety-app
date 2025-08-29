const twilio = require('twilio');

const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const twilio_number = process.env.TWILIO_PHONE_NUMBER;

const emergencyNumber = '+19173528634';// hardcoded number - this will need to change


async function sendSMS(to, message) {
    try {
        return await client.messages.create({
            body: message,
            from: twilio_number,
            to,
        });
    } catch (error) {
        console.error('Twilio SMS error:', error);
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

module.exports = { sendSMS, sendSessionStartNotifications };