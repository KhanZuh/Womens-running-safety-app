const mongoose = require("mongoose");
require("dotenv").config();

const seedQuotes = require("./seed.quotes");
const Quote = require("../models/quote");

async function main() {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    console.error("No MongoDB URL found. Please set MONGODB_URL in your .env file.");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear the database
    await mongoose.connection.db.dropDatabase();
    console.log("Database cleared");

    // Seed quotes
    const quotes = seedQuotes;
    await Quote.insertMany(quotes); // <-- this line adds the quotes
    console.log(`${quotes.length} quotes created`);

    // Disconnect safely
    await mongoose.disconnect();
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors
    }
    process.exit(1);
  }
}

main();
