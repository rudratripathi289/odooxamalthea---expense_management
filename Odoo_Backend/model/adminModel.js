const Joi = require('joi');

function validateRegister(data) {
  const schema = Joi.object({
    admin_name: Joi.string().min(3).max(50).required(),
    admin_email: Joi.string().email().required(),
    password: Joi.string().min(6).max(1024).required(),
  company_name: Joi.string().min(2).max(100).required(),
  country_name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('Admin').required()
  });
  return schema.validate(data);
}

module.exports = { validateRegister };