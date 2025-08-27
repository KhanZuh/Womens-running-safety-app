const express = require("express");
const router = express.Router();
const EmergencyContactsController = require("../controllers/emergencyContacts");

router.post("/", EmergencyContactsController.createEmergencyContact);

module.exports = router;
