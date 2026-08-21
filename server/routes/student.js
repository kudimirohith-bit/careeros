import express from 'express';
import Student from '../models/Student.js';
import Progress from '../models/Progress.js';
import Assessment from '../models/Assessment.js';

const router = express.Router();

// GET /api/student — return the first (demo) student
router.get('/', async (_req, res) => {
  try {
    const student = await Student.findOne();
    if (!student) {
      return res.status(404).json({ message: 'No student found. Run seed.js first.' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/student/:id/progress — return progress history documents for a student
router.get('/:id/progress', async (req, res) => {
  try {
    const history = await Progress.find({ studentId: req.params.id }).sort({ date: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/:id/mock-interview — save score, update Interview/Communication skill in Student model
router.post('/:id/mock-interview', async (req, res) => {
  try {
    const { scores } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Save assessment record
    await Assessment.create({
      studentId: student._id,
      type: 'communication',
      scores: scores || { overall: 70.6 },
    });

    // Update Communication or Interview skill if present, or add Communication skill
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

    // Recalculate readiness
    const careerReadiness = Math.round(
      updatedSkills.reduce((sum, s) => sum + (s.target > 0 ? (s.current / s.target) * 100 : 0), 0) /
        updatedSkills.length
    );

    student.skills = updatedSkills;
    student.careerReadiness = careerReadiness;
    const saved = await student.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student — create a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/student/:id/update-skills — update a student's skills array and recalculate readiness
router.post('/:id/update-skills', async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: '`skills` must be an array.' });
    }

    // Recalculate careerReadiness as average of (current/target * 100) across all skills
    const careerReadiness =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, s) => {
              const ratio = s.target > 0 ? s.current / s.target : 0;
              return sum + ratio * 100;
            }, 0) / skills.length
          )
        : 0;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { skills, careerReadiness },
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


