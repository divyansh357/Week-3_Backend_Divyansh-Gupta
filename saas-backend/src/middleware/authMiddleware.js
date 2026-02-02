// JWT & RBAC Middleware
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        // Bearer <token>
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // Contains { id, role, org_id }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check for Admin Role
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'org_admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };