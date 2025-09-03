const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },

  preferredTimeOfDay: [{ type: String }],           // ✔ matches frontend
  numberOfRunsPerWeek: { type: Number },            // ✔ matches frontend
  preferredTerrainTypes: [{ type: String }],        // ✔ matches frontend

  emergencyContact: {
    name: { type: String },
    phoneNumber: { type: String },
    relationship: { type: String },
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
