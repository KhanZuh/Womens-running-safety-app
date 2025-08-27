const EmergencyContact = require("../models/emergencyContact");

async function createEmergencyContact(req, res) {
  try {
    const { userId, name, email } = req.body;

    const emergencyContact = new EmergencyContact({
      userId,
      name,
      email,
    });

    const contact = await emergencyContact.save();

    console.log("Emergency contact created, id:", contact._id.toString());
    res.status(201).json({
      message: "Emergency contact created successfully",
      emergencyContact: contact,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create emergency contact" });
  }
}

const EmergencyContactsController = {
  createEmergencyContact: createEmergencyContact,
};

module.exports = EmergencyContactsController;
