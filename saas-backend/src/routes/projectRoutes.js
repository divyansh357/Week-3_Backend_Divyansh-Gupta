// Project routes
const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Base Route: /api/projects

// Everyone in the Org can VIEW projects
router.get('/', verifyToken, getProjects);

// Only Org Admins can CREATE, UPDATE and DELETE projects
router.post('/', verifyToken, verifyAdmin, createProject);
router.patch('/:id', verifyToken, verifyAdmin, updateProject);
router.delete('/:id', verifyToken, verifyAdmin, deleteProject);

module.exports = router;