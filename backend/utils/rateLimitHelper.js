const jwt = require('jsonwebtoken');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Reusable key generator for express-rate-limit.
 * Identifies users by their JWT User ID if authenticated via Bearer token,
 * or falls back to the client's real IP address (requires Express 'trust proxy' enabled).
 */
const rateLimitKeyGenerator = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        return `user_${decoded.id}`;
      }
    } catch (err) {
      // Gracefully fall back to IP if token is invalid or expired
    }
  }
  return ipKeyGenerator(req.ip);
};

module.exports = {
  rateLimitKeyGenerator,
};
