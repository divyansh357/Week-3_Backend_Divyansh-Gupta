const pool = require('../config/db');

// @desc    Get Activity Logs for MY Organization
// @route   GET /api/activity-logs
// @access  Private (Org Admin Only)
const getLogs = async (req, res) => {
    const { org_id } = req.user;

    try {
        // Fetch logs with User Names (Join)
        const query = `
            SELECT l.id, l.action, l.created_at, u.name as user_name
            FROM activity_logs l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.org_id = $1
            ORDER BY l.created_at DESC
            LIMIT 50`; // Safety limit
            
        const result = await pool.query(query, [org_id]);
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getLogs };