import express from 'express';
import Progress from '../models/Progress.js';

const router = express.Router();

// GET progress history for a student
router.get('/:studentId', async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .sort({ date: 1 })
      .limit(30);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
