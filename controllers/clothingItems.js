const ClothingItem = require("../models/clothingItem");
const {
  REQUEST_SUCCESSFUL,
  FORBIDDEN_ERROR,
  INVALID_DATA_ERROR,
  NOT_FOUND_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");
//May not need above
const invalidError = require("../errors/invalidError");
const notFoundError = require("../errors/notFound");
const conflictError = require("../errors/conflictError");
const defaultError = require("../errors/defaultError");
const unauthorizedError = require("../errors/unauthorizedError");
const forbiddenError = require("../errors/forbiddenError");

const createItem = (req, res, next) => {
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
        // return res
        //   .status(INVALID_DATA_ERROR)
        //   .send({ message: "Invalid Credentials" });
        next(new invalidError("Invalid Credentials"));
      }
      // return res
      //   .status(DEFAULT_ERROR)
      //   .send({ message: "Internal Server Error" });
      next(err);
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      // res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
      next(err);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);
  const { _id: userId } = req.user;

  ClothingItem.findOne({ _id: itemId })
    .then((item) => {
      if (!item) {
        // return Promise.reject(new Error("ID cannot be found"));
        next(new notFoundError("Item ID cannot be found"));
      }
      if (!item?.owner?.equals(userId)) {
        // return Promise.reject(new Error("You are not the owner of this item"));
        next(new forbiddenError("You are not the owner of this item"));
      }
      return ClothingItem.deleteOne({ _id: itemId, owner: userId }).then(() => {
        res.send({ message: `Item ${itemId} Deleted` });
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

// Likes/Unlikes
const likeItem = (req, res, next) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === `DocumentNotFoundError`) {
        // res
        //   .status(NOT_FOUND_ERROR)
        //   .send({ message: `${err.name} Error On likeItem` });
      } else if (err.name === `CastError`) {
        // res
        //   .status(INVALID_DATA_ERROR)
        //   .send({ message: "Invalid Credentials, Unable To Add Like" });
      } else {
        // res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        // res
        //   .status(NOT_FOUND_ERROR)
        //   .send({ message: `${err.name} Error On dislikeItem` });
        next(new notFoundError(`${err.name} Error On dislikeItem`));
      } else if (err.name === `CastError`) {
        // res
        //   .status(INVALID_DATA_ERROR)
        //   .send({ message: "Invalid Credentials, Unable To Remove Like" });
        next(new invalidError("Invalid Credentials, Unable To Remove Like"));
      } else {
        // res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
        next(err);
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
