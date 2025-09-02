const express = require("express");
const router = express.Router();
const SafetySessionController = require("../controllers/safetySession");

router.get("/:id", SafetySessionController.getSafetySession); // GET /safetySessions/:id - Get specific safety session
router.post("/", SafetySessionController.createSafetySession); //creates a new safety session
router.patch("/:id/checkin", SafetySessionController.checkIn); // PATCH /safetySessions/:id/checkin - Check in
router.patch("/:id/extend", SafetySessionController.extendSession);
router.post("/:id/panic", SafetySessionController.panicButtonActivePage);

module.exports = router;
