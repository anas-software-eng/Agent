const express = require('express');
const { createTask, getTasks } = require('../Controller/task.controller.js');

const router = express.Router();

const {authenticate} = require('../middleware/auth.middleware.js');

router.post('/tasks', authenticate , createTask);
router.get('/tasks', getTasks);

module.exports = router;