const express = require("express");
const UsersController = require("../controllers/users");

const router = express.Router();

router.post("/", UsersController.create);
router.get("/:id", UsersController.show); // This enables GET /users/:id


module.exports = router;
