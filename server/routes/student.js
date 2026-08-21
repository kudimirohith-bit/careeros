import express from 'express';
import Student from '../models/Student.js';
import Progress from '../models/Progress.js';
import Assessment from '../models/Assessment.js';

const router = express.Router();

// GET first student (single-student demo)
router.get('/', async (req, res) => {
  try {
    const student = await Student.findOne();
    if (!student) return res.status(404).json({ error: 'No student found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET progress history for a student
router.get('/:id/progress', async (req, res) => {
  try {
    const history = await Progress.find({ studentId: req.params.id }).sort({ date: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new student (onboarding)
router.post('/', async (req, res) => {
  try {
    const { name, targetRole, skills, evidenceHub } = req.body;
    await Student.deleteMany({}); // single-student demo: replace
    const student = await Student.create({
      name: name || 'Alex Kumar',
      targetRole,
      skills,
      evidenceHub: evidenceHub || {},
      onboardingDone: true,
      careerReadiness: skills && skills.length
        ? Math.round(skills.reduce((s, sk) => s + sk.current, 0) / skills.length)
        : 0,
    });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH & POST update skills + career readiness
const handleUpdateSkills = async (req, res) => {
  try {
    const { skills, activityNote } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.skills = skills;
    student.careerReadiness = Math.round(
      skills.reduce((sum, s) => sum + s.current, 0) / skills.length
    );
    await student.save();

    // Save progress snapshot
    const skillSnapshot = {};
    skills.forEach((s) => { skillSnapshot[s.name] = s.current; });
    await Progress.create({
      studentId: student._id,
      careerReadiness: student.careerReadiness,
      skills: skillSnapshot,
      activityType: 'skill_update',
      note: activityNote || 'Skill updated',
    });

    res.json(student);
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
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { onboardingDone: true, evidenceHub, targetRole },
      { new: true }
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mock interview
router.post('/:id/mock-interview', async (req, res) => {
  try {
    const { scores } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await Assessment.create({
      studentId: student._id,
      type: 'communication',
      scores: scores || { overall: 70.6 },
    });

    const overallScore = Math.round(scores?.overall || 70.6);
    let updatedSkills = [...student.skills];
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

    student.skills = updatedSkills;
    student.careerReadiness = Math.round(
      updatedSkills.reduce((sum, s) => sum + s.current, 0) / updatedSkills.length
    );
    const saved = await student.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
