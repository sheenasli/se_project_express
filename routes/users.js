const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { handleAuthorization } = require("../middlewares/auth");

// const { createUser, getUser, getUsers } = require("../controllers/users");

// Create
// router.post("/", createUser);

// Read
router.get("/me", handleAuthorization, getCurrentUser);
// router.get("/:userId", getUser);
router.patch("/me", handleAuthorization, updateUser);

module.exports = router;
