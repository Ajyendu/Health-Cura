const { validationResult } = require("express-validator");
const AppError = require("../errors/AppError");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return next(new AppError(400, "Request validation failed", result.array()));
};

module.exports = validate;
