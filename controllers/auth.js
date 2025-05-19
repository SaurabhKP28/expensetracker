const { User } = require('../models');

exports.checkPremiumStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ isPremium: user.isPremium });
  } catch (err) {
    console.error('Error checking premium status:', err);
    res.status(500).json({ error: 'Failed to check premium status' });
  }
};

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5h' });  // <== Change here
}