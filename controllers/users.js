const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const InvalidError = require("../errors/InvalidError");
const NotFoundError = require("../errors/NotFound");
const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!email) {
        // throw new Error("Enter a valid email");
        return next(new UnauthorizedError("Enter a valid email"));
      }
      if (user) {
        // throw new Error("Email is already in use");
        return next(new ConflictError("Email is already in use"));
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
        next(new InvalidError("Invalid Request Error on createUser"));
      } else if (err.message === "Enter a valid email") {
        next(new InvalidError("Invalid Error on createUser"));
      } else if (err.message === "Email is already in use") {
        next(new ConflictError(`Email ${email} already registered`));
      } else {
        next(err);
      }
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(InvalidError).send({ message: "Invalid Credentials" });
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
        next(new UnauthorizedError("Invalid Credentials"));
      } else {
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
        next(new NotFoundError("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
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
        next(new NotFoundError("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === "User not found") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "ValidationError") {
        next(new InvalidError("Validation Error"));
      } else {
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
