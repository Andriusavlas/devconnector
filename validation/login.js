const validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateLoginInput(data) {
    let errors = {};

    // Check if there is nothing entered into the name field
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (!validator.isEmail(data.email)) {
        errors.email = 'Email is not valid';
    };
    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    };
    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    };
    return {
        errors,
        isValid: isEmpty(errors)
    };
};