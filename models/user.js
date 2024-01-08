const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, "Name cannot be less than 2 characters"],
    maxlength: [30, "Name cannot be more than 30 characters"],
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
      message: "You must enter a valid URL",
    },
  },
});

module.exports = mongoose.model("user", userSchema);
