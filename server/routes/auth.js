import express from 'express';
import User from '../models/User.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Email validation helper
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // 3. Hash password
    const passwordHash = hashPassword(password);

    // 4. Save user in MongoDB
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      onboardingCompleted: false,
      lastLogin: new Date(),
      skills: [
        { name: 'Data Structures & Algorithms', current: 40, target: 80 },
        { name: 'Backend Engineering', current: 35, target: 85 },
        { name: 'System Design', current: 25, target: 75 },
        { name: 'Communication & Behavioral', current: 50, target: 80 },
      ],
    });

    await user.save();

    // 5. Create JWT session
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Fetch user from MongoDB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Verify password
    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 4. Create JWT session
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    return res.json({
      message: 'Login successful!',
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in: ' + err.message });
  }
});

// GET /api/auth/me (Session restoration & user verification)
router.get('/me', requireAuth, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    const resetToken = generateToken({ userId: user._id.toString(), purpose: 'reset-password' }, 3600);
    console.log(`🔑 Password reset link generated for ${user.email}: /reset-password?token=${resetToken}`);
    return res.json({ message: 'Password reset link has been processed. Check server logs or your inbox.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
