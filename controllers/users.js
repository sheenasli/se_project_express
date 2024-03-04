const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  INVALID_DATA_ERROR,
  NOT_FOUND_ERROR,
  CONFLICT_ERROR,
  DEFAULT_ERROR,
  UNAUTHORIZED_ERROR,
} = require("../utils/errors");
//May not need above
const invalidError = require("../errors/invalidError");
const notFoundError = require("../errors/notFound");
const conflictError = require("../errors/conflictError");
const defaultError = require("../errors/defaultError");
const unauthorizedError = require("../errors/unauthorizedError");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!email) {
        // throw new Error("Enter a valid email");
        return next(new unauthorizedError("Enter a valid email"));
      }
      if (user) {
        // throw new Error("Email is already in use");
        return next(new conflictError("Email is already in use"));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userPayload = user.toObject();
      delete userPayload.password;
      res.status(201).send({
        data: userPayload,
      });
    })

    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        // res
        //   .status(INVALID_DATA_ERROR)
        //   .send({ message: "Invalid Request Error on createUser" });
        next(new invalidError("Invalid Request Error on createUser"));
      } else if (err.message === "Enter a valid email") {
        // res
        //   .status(INVALID_DATA_ERROR)
        //   .send({ message: "Invalid Error on createUser" });
        next(new invalidError("Invalid Error on createUser"));
      } else if (err.message === "Email is already in use") {
        // res
        //   .status(CONFLICT_ERROR)
        //   .send({ message: "Email already exists in database" });
        next(new conflictError(`Email ${email} already registered`));
      } else {
        // res.status(DEFAULT_ERROR).send({ message: err.message });
        next(err);
      }
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(invalidError).send({ message: "Invalid Credentials" });
    return;
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        // res.status(UNAUTHORIZED_ERROR).send({ message: "Invalid Credentials" });
        next(new unauthorizedError("Invalid Credentials"));
      } else {
        // res.status(DEFAULT_ERROR).send({ message: err.message });
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;
  console.log(req.user._id);

  User.findById(id)
    .then((user) => {
      if (!user) {
        // return Promise.reject(new Error("User not found"));
        next(new notFoundError("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      // if (err.message === "User not found") {
      //   // res.status(NOT_FOUND_ERROR).send({ message: err.message });
      //   next(new notFoundError("User not found"));
      // } else {
      next(err);
    });
};

const updateUser = (req, res, next) => {
  const id = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    id,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => {
      if (!user) {
        // return Promise.reject(new Error("User not found"));
        next(new notFoundError("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === "User not found") {
        // res.status(NOT_FOUND_ERROR).send({ message: err.message });
        next(new notFoundError("User not found"));
      } else if (err.name === "ValidationError") {
        // res.status(INVALID_DATA_ERROR).send({ message: err.message });
        next(new invalidError("Validation Error"));
      } else {
        // res.status(DEFAULT_ERROR).send({ message: "Internal Server Error" });
        next(err);
      }
    });
};

module.exports = {
  createUser,
  loginUser,
  getCurrentUser,
  updateUser,
};
