const User = require("../models/user");
const { generateToken } = require("../lib/token");

async function createToken(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email });
  if (!user) {
    console.log("Auth Error: User not found");
    return res.status(401).json({ message: "User not found" });
  } else if (user.password !== password) {
    console.log("Auth Error: Passwords do not match");
    return res.status(401).json({ message: "Password incorrect" });
  } else {
    const token = generateToken(user.id);
    return res.status(201).json({
      token: token,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        // add any other user info you want here
      },
      message: "OK"
    });
  }
}

const AuthenticationController = {
  createToken: createToken,
};

module.exports = AuthenticationController;
