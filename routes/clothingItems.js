const router = require("express").Router();
const { handleAuthorization } = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {
  createItemValidator,
  validateId,
} = require("../middlewares/validation");

// Create
router.post("/", handleAuthorization, createItemValidator, createItem);

// Read
router.get("/", getItems);

router.put("/:itemId/likes", handleAuthorization, validateId, likeItem);
router.delete("/:itemId", handleAuthorization, validateId, deleteItem);
router.delete("/:itemId/likes", handleAuthorization, validateId, dislikeItem);

module.exports = router;
