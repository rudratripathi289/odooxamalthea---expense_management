const Joi = require('joi');

// Validation schema for company registration
const validateRegister = (data) => {
  const schema = Joi.object({
    company_name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name must not exceed 100 characters'
    }),
    company_code: Joi.string().length(4).pattern(/^[A-Z]{4}$/).required().messages({
      'string.empty': 'Company code is required',
      'string.length': 'Company code must be exactly 4 characters',
      'string.pattern.base': 'Company code must be 4 uppercase letters'
    }),
    country: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Country is required',
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country must not exceed 100 characters'
    }),
    admin_name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Admin name is required',
      'string.min': 'Admin name must be at least 2 characters',
      'string.max': 'Admin name must not exceed 100 characters'
    }),
    admin_email: Joi.string().email().required().messages({
      'string.empty': 'Admin email is required',
      'string.email': 'Please enter a valid email address'
    }),
    password: Joi.string().min(6).max(50).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 50 characters'
    }),
    role: Joi.string().valid('admin').default('admin')
  });

  return schema.validate(data);
};

module.exports = { validateRegister };
