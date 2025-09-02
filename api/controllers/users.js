const User = require("../models/user");
// const EmergencyContact = require("../models/emergencyContact");


function create(req, res) {
    console.log("Incoming signup data:", req.body);

  const {
  email,
  password,
  fullname,
  preferredTimeOfDay,
  numberOfRunsPerWeek,
  preferredTerrainTypes,
  emergencyContact, 
} = req.body;


  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters"})
  }

  if (!fullname || fullname.trim().length < 2) {
    console.log("Signup validation error:", fullname);

  return res.status(400).json({ message: "Full name must be at least 2 characters" });
}

  const user = new User({ 
    fullname, 
    email, 
    password, 
    preferredTimeOfDay, 
    numberOfRunsPerWeek, 
    preferredTerrainTypes,
    emergencyContact,
  });
  console.log("Saving user with:", {
  email,
  fullname,
  emergencyContact,
});
  user.save()
    // .then(savedUser => {
    //   // savedUser._id is available here
    //   const emergencyContact = new EmergencyContact({
    //     userId: savedUser._id,
    //     name: emergencyName,
    //     phoneNumber: emergencyPhone,
    //     relationship: emergencyRelationship,
    //   });

    //   return emergencyContact.save();
    // })
    .then(() => {
      res.status(201).json({ message: "User and emergency contact created" });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 11000 && err.keyPattern?.email) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      res.status(400).json({ message: "Something went wrong" });
    })
  };

const UsersController = {
  create: create,
};

module.exports = UsersController;
