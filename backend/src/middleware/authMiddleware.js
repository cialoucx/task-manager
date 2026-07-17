const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required.' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    
    const user = UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token not found.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
