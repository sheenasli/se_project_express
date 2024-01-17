const router = require("express").Router();

const { createUser, getUser, getUsers } = require("../controllers/users");

// Create
router.post("/", createUser);

// Read
router.get("/", getUsers);
router.get("/:userId", getUser);

module.exports = router;
