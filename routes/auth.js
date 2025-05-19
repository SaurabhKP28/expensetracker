const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authController = require('../controllers/auth');
const authenticate = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isPremium']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPremium: false,
      totalExpense: 0
    });

    res.json({ message: 'Signup successful! Please login.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed! Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required!' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please check your email.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials!' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed! Please try again.' });
  }
});

router.get('/check-premium', authenticate, authController.checkPremiumStatus);

module.exports = router;