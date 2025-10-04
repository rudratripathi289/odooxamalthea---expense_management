// model/departmentModel.js
const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  budget: Joi.number().positive().required()
});

const updateBudgetSchema = Joi.object({
  budget: Joi.number().positive().required()
});

const validateCreateDepartment = (data) => {
  return createDepartmentSchema.validate(data);
};

const validateUpdateBudget = (data) => {
  return updateBudgetSchema.validate(data);
};

module.exports = { 
  createDepartmentSchema, 
  updateBudgetSchema, 
  validateCreateDepartment, 
  validateUpdateBudget 
};
