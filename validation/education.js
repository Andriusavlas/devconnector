const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  // Check if there is nothing entered into the name field
  const dataFields = ["school", "degree", "fieldofstudy", "from"];
  dataFields.forEach(field => {
    data[field] = isEmpty(data[field]) ? "" : data[field];
    if (validator.isEmpty(data[field])) {
      errors[field] = `${field} field is required`;
    }
  });
  if (!validator.isISO8601(data.from)) {
    errors.from = "Please format to YYYY-MM-DD";
  }
  data.to = isEmpty(data.to) ? '' : data.to;
  if (!validator.isEmpty(data.to)) {
    if (!validator.isISO8601(data.to)) {
      errors.to = "Please format to YYYY-MM-DD";
    };
  };
  return {
    errors,
    isValid: isEmpty(errors)
  };
};