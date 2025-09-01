const User = require("../models/user");

function create(req, res) {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;
  const preferredTimeOfDay = req.body.preferredTimeOfDay;
  const numberOfRunsPerWeek = req.body.numberOfRunsPerWeek;
  const preferredTerrainTypes = req.body.preferredTerrainTypes;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters"})
  }

  if (!fullname || fullname.trim().length < 2) {
    console.log("🚨 Signup validation error:", fullname);

  return res.status(400).json({ message: "Full name must be at least 2 characters" });
}

  const user = new User({ fullname, email, password, preferredTimeOfDay, numberOfRunsPerWeek, preferredTerrainTypes });
  user
    .save()
    .then((user) => {
      console.log("User created, id:", user._id.toString());
      res.status(201).json({ message: "OK" });
    })
    .catch((err) => {
  console.error(err);

  // Duplicate key error (MongoDB error code 11000)
  if (err.code === 11000 && err.keyPattern?.email) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  res.status(400).json({ message: "Something went wrong" });
});

}

const UsersController = {
  create: create,
};

module.exports = UsersController;
