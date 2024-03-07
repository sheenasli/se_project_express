class DefaultError extends Error {
  constructor(message) {
    super(message);
    this.name = "DEFAULT_ERROR";
    this.statusCode = 500;
  }
}

module.exports = DefaultError;
