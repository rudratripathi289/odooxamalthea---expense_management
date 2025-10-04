// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { extractCompanyCode } = require('../middleware/auth');

router.get('/', extractCompanyCode, userController.getUsers);
router.post('/', extractCompanyCode, userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
