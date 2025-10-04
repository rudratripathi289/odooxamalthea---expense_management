// model/userModel.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  role: Joi.string().valid('employee', 'manager', 'admin', 'cfo', 'ceo').required(),
  managerId: Joi.number().integer().allow(null, ''),
  department: Joi.string().min(2).max(100).required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(50).allow(''),
  role: Joi.string().valid('employee', 'manager', 'admin', 'cfo', 'ceo'),
  managerId: Joi.number().integer().allow(null, ''),
  department: Joi.string().min(2).max(100)
});

const validateCreateUser = (data) => {
  return createUserSchema.validate(data);
};

const validateUpdateUser = (data) => {
  return updateUserSchema.validate(data);
};

module.exports = { 
  createUserSchema, 
  updateUserSchema, 
  validateCreateUser, 
  validateUpdateUser 
};
