const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");

const usersRouter = require("./routes/users");
const safetySessionRouter = require("./routes/safetySession");
const emergencyContactsRouter = require("./routes/emergencyContacts");
const quotesRouter = require("./routes/quotes");
const authenticationRouter = require("./routes/authentication");
const tokenChecker = require("./middleware/tokenChecker");
const {overDueSession} = require("./controllers/safetySession");

cron.schedule("*/1 * * * *", () => { // this will need to change to 5 minutes, currently is set for 1 minute
  overDueSession();
})

const app = express();

app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/users", usersRouter);
app.use("/safetySessions", safetySessionRouter);
app.use("/emergencyContacts", emergencyContactsRouter);
app.use("/quotes", quotesRouter);
app.use("/tokens", authenticationRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ err: "Error 404: Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).send(err.message);
  } else {
    res.status(500).json({ err: "Something went wrong" });
  }
});


module.exports = app;
