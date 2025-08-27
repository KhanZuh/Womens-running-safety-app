const express = require("express");
const router = express.Router();
const SafetySessionController = require("../controllers/safetySession");

router.post("/", SafetySessionController.createSafetySession); //creates a new safety session
router.patch("/:id/checkin", SafetySessionController.checkIn);

module.exports = router;
