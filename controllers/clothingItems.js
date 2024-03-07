const ClothingItem = require("../models/clothingItem");
const InvalidError = require("../errors/InvalidError");
const NotFoundError = require("../errors/NotFound");
const ForbiddenError = require("../errors/ForbiddenError");

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
        next(new InvalidError("Invalid Credentials"));
      }
      next(err);
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
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
        next(new NotFoundError("Item ID cannot be found"));
      }
      if (!item?.owner?.equals(userId)) {
        next(new ForbiddenError("You are not the owner of this item"));
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
        next(new NotFoundError(`${err.name} Error On likeItem`));
      } else if (err.name === `CastError`) {
        next(new InvalidError("Invalid Credentials, Unable To Remove Like"));
      } else {
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
        next(new NotFoundError(`${err.name} Error On dislikeItem`));
      } else if (err.name === `CastError`) {
        next(new InvalidError("Invalid Credentials, Unable To Remove Like"));
      } else {
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
