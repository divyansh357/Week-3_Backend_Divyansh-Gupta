// Task routes
const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');

// Base Route: /api/tasks

router.post('/', verifyToken, createTask);
router.get('/', verifyToken, getTasks); // Usage: /api/tasks?projectId=...
router.patch('/:id', verifyToken, updateTask);

module.exports = router;