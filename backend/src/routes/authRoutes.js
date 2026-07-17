const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegisterAndLogin } = require('../middleware/validate');

router.post('/register', validateRegisterAndLogin, register);
router.post('/login', validateRegisterAndLogin, login);

module.exports = router;
