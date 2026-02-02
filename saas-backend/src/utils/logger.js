// Activity Logger
const pool = require('../config/db');

const logActivity = async (org_id, user_id, action) => {
    try {
        const query = `
            INSERT INTO activity_logs (org_id, user_id, action)
            VALUES ($1, $2, $3)
        `;
        // We don't await this because we don't want to slow down the main request
        // "Fire and Forget"
        pool.query(query, [org_id, user_id, action]); 
    } catch (error) {
        console.error('Logging Error:', error.message);
    }
};

module.exports = logActivity;