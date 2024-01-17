// const { reset } = require("nodemon");
const User = require("../models/user");
const {
  INVALID_DATA_ERROR,
  NOT_FOUND_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => {
      console.log(user);
      res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Request Error On createUser" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error From createUser" });
      }
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Invalid ID passed" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from getUser" });
      }
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
    });
};

module.exports = { createUser, getUser, getUsers };
