const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  speaker: { type: String, required: true },
});

const Quote = mongoose.model("Quote", QuoteSchema);

module.exports = Quote;