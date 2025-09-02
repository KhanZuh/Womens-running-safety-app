const express = require("express");

const QuotesController = require("../controllers/quotes");

const router = express.Router();

router.get("/", QuotesController.getRandom);

module.exports = router;