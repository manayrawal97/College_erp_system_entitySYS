const jwt = require('jsonwebtoken');
const pool = require('../config/db.config');

const authMiddleware = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({success: false, message: 'No token provided'});
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        const [rows] = await pool.query(
            'Select id, email, role, full_name, is_active from users where id = ?',
            [decoded.id]
        );

        if (rows.length === 0 || !rows[0].is_active) {
            return res.status(401).json({success: false, message: 'Account not found or inactive'});
        }
        
        req.user = rows[0];  // attach to request for downstream use
        next();
    } 
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Auth Middleware Error:', err);
            return res.status(401).json({success: false, message: 'Token expired'});
        }
        return res.status(401).json({success: false, message: 'Invalid Token'});
    }
};

// Role-based access: authorize('admin') or authorize('faculty', 'admin')

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false, 
                message: `Access denied: Requires role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };