const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ error: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set user info in the request object
    req.user = { 
      id: user.id, 
      userId: user.id, // Added for compatibility with existing code
      isPremium: user.isPremium 
    };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};
