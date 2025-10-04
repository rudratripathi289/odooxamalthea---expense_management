// routes/departments.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controller/departmentController');
const { extractCompanyCode } = require('../middleware/auth');

router.get('/', extractCompanyCode, departmentController.getDepartments);
router.post('/', extractCompanyCode, departmentController.createDepartment);
router.put('/:id/budget', departmentController.updateBudget);
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
