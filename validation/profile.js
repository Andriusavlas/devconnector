const validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    const siteUrls = [
        'website',
        'youtube',
        'twitter',
        'facebook',
        'linkedin',
        'instagram'
    ];
    const dataFields = ['handle', 'status', 'skills'];

    dataFields.forEach((field) => {
        data[field] = !isEmpty(data[field]) ? data[field] : '';
        if (validator.isEmpty(data[field])) {
            errors[field] = `${field} is required`;
        };
    });

    if (!validator.isLength(data.handle, {
            min: 2,
            max: 40
        })) {
        errors.handle = 'Handle must be between 2 and 40 characters';
    };

    siteUrls.forEach((url) => {
        if (!isEmpty(data[url])) {
            if (!validator.isURL(data[url])) {
                errors[url] = `Badly formatted URL for ${url}`;
            };
        };
    });
    return {
        errors,
        isValid: isEmpty(errors)
    };
};