const pool = require('../config/db');
const logActivity = require('../utils/logger'); // <--- 1. Import the Logger

// @desc    Create a new Task
// @route   POST /api/tasks
// @access  Private (Org Admin & Members)
const createTask = async (req, res) => {
    const { title, description, project_id, assigned_to, priority, due_date } = req.body;
    const { org_id } = req.user;

    try {
        // Security Check 1: Project must belong to Org
        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1 AND org_id = $2', 
            [project_id, org_id]
        );
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        // Security Check 2: Assignee must belong to Org
        if (assigned_to) {
            const userCheck = await pool.query(
                'SELECT * FROM users WHERE id = $1 AND org_id = $2',
                [assigned_to, org_id]
            );
            if (userCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Cannot assign task to user outside your organization' });
            }
        }

        const query = `
            INSERT INTO tasks (title, description, project_id, assigned_to, priority, due_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        
        const result = await pool.query(query, [title, description, project_id, assigned_to, priority || 'medium', due_date]);

        // <--- 2. Log the Activity
        logActivity(org_id, req.user.id, `Created task: ${title}`);

        res.status(201).json({ message: 'Task created', task: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Tasks for a specific Project
// @route   GET /api/tasks?projectId=UUID
// @access  Private
const getTasks = async (req, res) => {
    const { projectId } = req.query;
    const { org_id } = req.user;

    if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

    try {
        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1 AND org_id = $2', 
            [projectId, org_id]
        );
        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const query = `
            SELECT t.*, u.name as assignee_name 
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = $1 AND t.is_deleted = FALSE
            ORDER BY t.created_at DESC`;
            
        const result = await pool.query(query, [projectId]);
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Task (Status or Assignment)
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { status, priority, assigned_to } = req.body;
    const { org_id } = req.user;

    try {
        // Verify task exists and belongs to Org
        const checkQuery = `
            SELECT t.* FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE t.id = $1 AND p.org_id = $2`;
        
        const check = await pool.query(checkQuery, [id, org_id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const query = `
            UPDATE tasks 
            SET status = COALESCE($1, status),
                priority = COALESCE($2, priority),
                assigned_to = COALESCE($3, assigned_to)
            WHERE id = $4
            RETURNING *`;

        const result = await pool.query(query, [status, priority, assigned_to, id]);
        
        // <--- 3. Log the Activity
        logActivity(org_id, req.user.id, `Updated task: ${result.rows[0].title}`);

        res.json({ message: 'Task updated', task: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createTask, getTasks, updateTask };