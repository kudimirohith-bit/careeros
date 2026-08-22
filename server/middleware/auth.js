import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error: ' + err.message });
  }
}
