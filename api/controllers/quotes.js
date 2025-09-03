const Quote = require("../models/quote");

// to get random quote from DB...

async function getRandom(req, res) {
  try {
    const randomQuote = await Quote.aggregate([{ $sample: { size: 1 } }]);

    if (randomQuote.length === 0) {
      return res.status(404).json({ message: "No quotes found" });
    }

    res.json(randomQuote[0]);
  } catch (error) {
    console.error("Error fetching random quote:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const QuotesController = {
  getRandom,
};

module.exports = QuotesController;


