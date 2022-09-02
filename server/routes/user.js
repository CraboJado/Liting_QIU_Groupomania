const express = require('express');
const { loginLimiter, siginLimiter } = require('../middlewares/apiLimiter')
const { signup, login } = require('../controllers/user')

const router = express.Router();

router.post('/signup', siginLimiter, signup);

router.post('/login', loginLimiter, login);

module.exports = router;