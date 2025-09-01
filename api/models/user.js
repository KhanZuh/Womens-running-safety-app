const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  preferredTimeOfDay: { type: [String] },
  numberOfRunsPerWeek: { type: Number }, 
  preferredTerrainTypes: { type: [String] } // In [] to be able to accept multiple values 
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
