const pool = require('../config/db');
const logActivity = require('../utils/logger'); // <--- 1. Import the Logger

// @desc    Create a new Project
// @route   POST /api/projects
// @access  Private (Org Admin only)
const createProject = async (req, res) => {
    const { name, description } = req.body;
    const { org_id } = req.user;

    try {
        const query = `
            INSERT INTO projects (name, description, org_id) 
            VALUES ($1, $2, $3) 
            RETURNING *`;
        
        const result = await pool.query(query, [name, description, org_id]);
        
        // <--- 2. Log the Activity
        logActivity(org_id, req.user.id, `Created project: ${name}`);

        res.status(201).json({
            message: 'Project created successfully',
            project: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Projects for MY Organization
// @route   GET /api/projects
// @access  Private (Admins & Members)
const getProjects = async (req, res) => {
    const { org_id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT * FROM projects 
            WHERE org_id = $1 AND is_deleted = FALSE 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3`;
            
        const result = await pool.query(query, [org_id, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM projects WHERE org_id = $1 AND is_deleted = FALSE`;
        const countResult = await pool.query(countQuery, [org_id]);
        
        res.json({
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                currentPage: parseInt(page),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Project Details
// @route   PATCH /api/projects/:id
// @access  Private (Org Admin only)
const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const { org_id } = req.user;

    try {
        const checkQuery = 'SELECT * FROM projects WHERE id = $1 AND org_id = $2';
        const check = await pool.query(checkQuery, [id, org_id]);

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        const query = `
            UPDATE projects 
            SET name = COALESCE($1, name), 
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 
            RETURNING *`;
            
        const result = await pool.query(query, [name, description, status, id]);

        // <--- 3. Log the Activity
        logActivity(org_id, req.user.id, `Updated project status: ${result.rows[0].name}`);

        res.json({ message: 'Project updated', project: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Soft Delete a Project
// @route   DELETE /api/projects/:id
// @access  Private (Org Admin only)
const deleteProject = async (req, res) => {
    const { id } = req.params;
    const { org_id } = req.user;

    try {
        const checkQuery = 'SELECT * FROM projects WHERE id = $1 AND org_id = $2';
        const check = await pool.query(checkQuery, [id, org_id]);

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        const query = `
            UPDATE projects 
            SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING id, name`;
            
        const result = await pool.query(query, [id]);

        // <--- 4. Log the Activity
        logActivity(org_id, req.user.id, `Deleted project: ${result.rows[0].name}`);

        res.json({ message: 'Project deleted successfully', project: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };