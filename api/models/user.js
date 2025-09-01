const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  preferredTimeOfDay: { type: [String] },
  numberOfRunsPerWeek: { type: Number }, 
  preferredTerrainTypes: { type: [String] } // In [] to be able to accept multiple values 
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
