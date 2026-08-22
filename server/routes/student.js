import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Assessment from '../models/Assessment.js';

const router = express.Router();

// GET first user (fallback endpoint)
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET progress history for a user
router.get('/:id/progress', async (req, res) => {
  try {
    const history = await Progress.find({ studentId: req.params.id }).sort({ date: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user profile info
router.post('/', async (req, res) => {
  try {
    const { name, targetRole, skills, evidenceHub } = req.body;
    const user = await User.create({
      name: name || 'Alex Kumar',
      email: `user_${Date.now()}@careeros.dev`,
      passwordHash: 'dummy_hash',
      profile: { targetRole: targetRole || 'Software Engineer' },
      skills: skills || [],
      evidence: evidenceHub ? Object.values(evidenceHub) : [],
      onboardingCompleted: false,
      careerReadiness: skills && skills.length
        ? Math.round(skills.reduce((s, sk) => s + sk.current, 0) / skills.length)
        : 45,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH & POST update skills + career readiness
const handleUpdateSkills = async (req, res) => {
  try {
    const { skills, activityNote } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.skills = skills;
    user.careerReadiness = Math.round(
      skills.reduce((sum, s) => sum + s.current, 0) / skills.length
    );
    await user.save();

    // Save progress snapshot
    const skillSnapshot = {};
    skills.forEach((s) => { skillSnapshot[s.name] = s.current; });
    await Progress.create({
      studentId: user._id,
      careerReadiness: user.careerReadiness,
      skills: skillSnapshot,
      activityType: 'skill_update',
      note: activityNote || 'Skill updated',
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.patch('/:id/update-skills', handleUpdateSkills);
router.post('/:id/update-skills', handleUpdateSkills);

// PATCH complete onboarding
router.patch('/:id/complete-onboarding', async (req, res) => {
  try {
    const { evidenceHub, targetRole } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { onboardingCompleted: true, evidence: evidenceHub ? Object.values(evidenceHub) : [], 'profile.targetRole': targetRole },
      { returnDocument: 'after' }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mock interview
router.post('/:id/mock-interview', async (req, res) => {
  try {
    const { scores } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Assessment.create({
      studentId: user._id,
      type: 'communication',
      scores: scores || { overall: 70.6 },
    });

    const overallScore = Math.round(scores?.overall || 70.6);
    let updatedSkills = [...(user.skills || [])];
    let foundComm = false;

    updatedSkills = updatedSkills.map((s) => {
      if (s.name.toLowerCase() === 'communication' || s.name.toLowerCase() === 'interview') {
        foundComm = true;
        return { ...s, current: Math.min(s.target, Math.max(s.current, overallScore)) };
      }
      return s;
    });

    if (!foundComm) {
      updatedSkills.push({ name: 'Communication', current: overallScore, target: 85 });
    }

    user.skills = updatedSkills;
    user.careerReadiness = Math.round(
      updatedSkills.reduce((sum, s) => sum + s.current, 0) / updatedSkills.length
    );
    const saved = await user.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
