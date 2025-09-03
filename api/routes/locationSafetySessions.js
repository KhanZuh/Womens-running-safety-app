const express = require("express");
const router = express.Router();

const LocationSafetySessionController = require("../controllers/locationSafetySession");

// POST /locationSafetySessions - Create new location safety session
router.post("/", LocationSafetySessionController.create);

// GET /locationSafetySessions/:id - Get session by ID
router.get("/:id", LocationSafetySessionController.getById);

// PATCH /locationSafetySessions/:id/position - Update current position
router.patch("/:id/position", LocationSafetySessionController.updatePosition);

// PATCH /locationSafetySessions/:id/checkin - Handle check-in (safe or emergency)
router.patch("/:id/checkin", LocationSafetySessionController.checkIn);

// PATCH /locationSafetySessions/:id/end - End session manually
router.patch("/:id/end", LocationSafetySessionController.endSession);

module.exports = router;
