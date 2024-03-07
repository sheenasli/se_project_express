const router = require("express").Router();
const clothingItems = require("./clothingItems");
const usersRouter = require("./users");
const { loginUser, createUser } = require("../controllers/users");
const {
  loginUserValidator,
  createUserValidator,
} = require("../middlewares/validation");
const NotFoundError = require("../errors/NotFound");

router.use("/items", clothingItems);
router.use("/users", usersRouter);

router.post("/signin", loginUserValidator, loginUser);
router.post("/signup", createUserValidator, createUser);

router.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});

module.exports = router;
