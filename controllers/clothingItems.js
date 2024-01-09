const { reset } = require("nodemon");
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
      // res
      //   .status(INVALID_DATA_ERROR)
      //   .send({ message: "Invalid Credentials", e });
    });
};

// module.exports.createClothingItem = (req, res) => {
//   console.log(req.user._id);
// };

const getItems = (req, res) => {
  ClothingItem.find({})
    .orFail()
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      console.error(e);
      res.status(DEFAULT_ERROR).send({ message: "Internal Server Error", e });
    });
};

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) => {
      console.error(e);
      res.status(DEFAULT_ERROR).send({ message: "Internal Server Error", e });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  console.log(itemId);

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) =>
      // if (!item.owner.equals(userId)) {
      //   return Promise.reject(new Error("Unauthorized To Delete Item"));
      // }
      // return ClothingItem.findByIdAndDelete(itemId).then(() => {
      res.status(200).send({ message: `Item ${itemId} Deleted` }),
    )
    // })
    // res.status(REQUEST_SUCCESSFUL).send({ item }))
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

//Likes/Unlikes
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
        return res
          .status(NOT_FOUND_ERROR)
          .send({ message: `${err.name} Error On likeItem` });
      } else if (err.name === `CastError`) {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Credentials, Unable To Add Like" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
      }
    });
  // res
  //   .status(INVALID_DATA_ERROR)
  //   .send({ message: "Invalid Credentials, Unable To Add Like", e });
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
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === `DocumentNotFoundError`) {
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
  updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
