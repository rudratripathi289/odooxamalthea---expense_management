const express = require('express');
const router = express.Router();
const registerController = require('../controller/registerController');

// POST /api/register - Register new company and admin
router.post('/register', registerController.register);

module.exports = router;
