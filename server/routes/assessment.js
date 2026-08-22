import express from 'express';
import Assessment from '../models/Assessment.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST submit assessment results
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, scores, totalScore, answers } = req.body;
    const userId = req.user._id;

    const assessment = await Assessment.create({
      studentId: userId,
      type,
      scores,
      totalScore,
      answers: answers || [],
    });

    // Update user skills based on assessment type
    const user = await User.findById(userId);
    if (user && user.skills && user.skills.length > 0) {
      const typeToSkill = {
        aptitude: 'Aptitude',
        coding: 'DSA',
        technical: 'Backend Engineering',
        communication: 'Communication & Behavioral',
        mock_interview: 'Technical Communication & Problem Solving',
      };
      const skillName = typeToSkill[type] || 'DSA';
      let skill = user.skills.find((s) => s.name.toLowerCase().includes(skillName.toLowerCase()));
      if (!skill && user.skills[0]) skill = user.skills[0];

      if (skill) {
        skill.current = Math.round(skill.current * 0.6 + totalScore * 0.4);
      }
      user.careerReadiness = Math.round(
        user.skills.reduce((sum, s) => sum + s.current, 0) / user.skills.length
      );
      await user.save();
    }

    res.status(201).json({ assessment, updatedUser: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all assessments for authenticated user
router.get('/:studentId', requireAuth, async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    const assessments = await Assessment.find({ studentId }).sort({
      createdAt: -1,
    });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
