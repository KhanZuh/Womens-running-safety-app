const express = require("express");
const router = express.Router();
const SafetySessionController = require("../controllers/safetySession");

router.post("/", SafetySessionController.createSafetySession);
router.patch("/:id/checkin", SafetySessionController.checkIn);

module.exports = router;
