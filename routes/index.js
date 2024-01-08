const router = require("express").Router();
const clothingItems = require("./clothingItems");
const usersRouter = require("./users");
const { NOT_FOUND_ERROR } = require("../utils/errors");

router.use("/items", clothingItems);
//Is it item or items?
router.use("/users", usersRouter);

router.use((req, res) => {
  res.status(NOT_FOUND_ERROR).send({ message: "Router not found" });
});

module.exports = router;
