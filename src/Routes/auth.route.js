const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../Controller/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// public - these are how you get a token in the first place
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// protected
router.get('/me', authenticate, me);

module.exports = router;
