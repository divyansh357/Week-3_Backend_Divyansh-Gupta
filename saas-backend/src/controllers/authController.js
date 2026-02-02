// Auth controller
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a new Organization and its Admin
// @route   POST /api/auth/register-org
// @access  Public
const registerOrg = async (req, res) => {
    const { org_name, user_name, email, password } = req.body;
    
    const client = await pool.connect(); // Start Transaction Client

    try {
        await client.query('BEGIN'); // Start Transaction

        // 1. Check if user already exists
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            throw new Error('User already exists');
        }

        // 2. Create the Organization
        const orgQuery = 'INSERT INTO organizations (name) VALUES ($1) RETURNING id, name';
        const orgResult = await client.query(orgQuery, [org_name]);
        const newOrg = orgResult.rows[0];

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the User (Admin Role, Linked to new Org)
        const userQuery = `
            INSERT INTO users (name, email, password, role, org_id) 
            VALUES ($1, $2, $3, 'org_admin', $4) 
            RETURNING id, name, email, role, org_id`;
        const userResult = await client.query(userQuery, [user_name, email, hashedPassword, newOrg.id]);
        const newUser = userResult.rows[0];

        // 5. Commit Transaction
        await client.query('COMMIT');

        // 6. Generate Token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, org_id: newUser.org_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Organization and Admin registered successfully',
            token,
            user: newUser,
            organization: newOrg
        });

    } catch (error) {
        await client.query('ROLLBACK'); // If error, undo everything
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        client.release();
    }
};

// @desc    Login User
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role, org_id: user.org_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, org_id: user.org_id } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerOrg, login };