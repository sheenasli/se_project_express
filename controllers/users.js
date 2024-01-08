const { reset } = require("nodemon");
const User = require("../models/user");
const {
  REQUEST_SUCCESSFUL,
  INVALID_DATA_ERROR,
  NOT_FOUND_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => {
      console.log(user);
      res.send({ user });
    })
    .catch((e) => {
      console.error(e);
      res
        .status(INVALID_DATA_ERROR)
        .send({ message: "Creating User Failed", e });
    });
};

const getUser = (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid Credentials", e });
      }

      res.status(REQUEST_SUCCESSFUL).send(user);
    })
    .catch((e) => {
      console.error(e);
      res.status(NOT_FOUND_ERROR).send({ message: "User Not Found", e });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .orFail()
    .then((users) => res.status(200).send(users))
    .catch((e) => {
      console.error(e);
      res.status(DEFAULT_ERROR).send({ message: "Internal Server Error", e });
    });
};

module.exports = { createUser, getUser, getUsers };
