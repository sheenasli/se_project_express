const router = require("express").Router();
const { handleAuthorization } = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// Create
router.post("/", handleAuthorization, createItem);

// Read
router.get("/", getItems);

router.put("/:itemId/likes", handleAuthorization, likeItem);
router.delete("/:itemId", handleAuthorization, deleteItem);
router.delete("/:itemId/likes", handleAuthorization, dislikeItem);

module.exports = router;
