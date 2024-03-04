// const JWT_SECRET =
//   NODE_ENV === "production" ? process.env.JWT_SECRET : "dev-key";

const { JWT_SECRET = "dev-secret", NODE_ENV } = process.env;

module.exports = {
  JWT_SECRET,
  NODE_ENV,
};
