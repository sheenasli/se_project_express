const ClothingItem = require("../models/clothingItem");
const {
  REQUEST_SUCCESSFUL,
  INVALID_DATA_ERROR,
  NOT_FOUND_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
  console.log(req.user._id);
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Credentials" });
      }
      return res
        .status(DEFAULT_ERROR)
        .send({ message: "Internal Server Error" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      console.error(e);
      res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.send({ message: `Item ${itemId} Deleted` }))
    .catch((err) => {
      console.error(err);
      if (err.name === `CastError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Unauthorized To Delete Item" });
      } else if (err.name === `DocumentNotFoundError`) {
        res
          .status(NOT_FOUND_ERROR)
          .send({ message: `${err.name} Error On Deleting Item` });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "deleteItem Failed" });
      }
    });
};

// Likes/Unlikes
const likeItem = (req, res) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(REQUEST_SUCCESSFUL).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === `DocumentNotFoundError`) {
        res
          .status(NOT_FOUND_ERROR)
          .send({ message: `${err.name} Error On likeItem` });
      } else if (err.name === `CastError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Credentials, Unable To Add Like" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
      }
    });
};

const dislikeItem = (req, res) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        res
          .status(NOT_FOUND_ERROR)
          .send({ message: `${err.name} Error On dislikeItem` });
      } else if (err.name === `CastError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Credentials, Unable To Remove Like" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
