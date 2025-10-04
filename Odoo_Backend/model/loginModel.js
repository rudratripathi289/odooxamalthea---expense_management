// model/loginModel.js
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'employee', 'manager', 'cfo', 'ceo').required()
});

const validateLogin = (data) => {
  return loginSchema.validate(data);
};

module.exports = { loginSchema, validateLogin };
