import express from 'express';
import Assessment from '../models/Assessment.js';
import Student from '../models/Student.js';

const router = express.Router();

// POST submit assessment results
router.post('/', async (req, res) => {
  try {
    const { studentId, type, scores, totalScore, answers } = req.body;

    const assessment = await Assessment.create({
      studentId,
      type,
      scores,
      totalScore,
      answers: answers || [],
    });

    // Update relevant student skill based on assessment type
    const student = await Student.findById(studentId);
    if (student) {
      const typeToSkill = {
        aptitude: 'Aptitude',
        coding: 'DSA',
        technical: 'Backend',
        communication: 'Communication',
        mock_interview: 'Interview',
      };
      const skillName = typeToSkill[type];
      if (skillName) {
        const skill = student.skills.find((s) => s.name === skillName);
        if (skill) {
          // Nudge skill toward assessment score
          skill.current = Math.round(skill.current * 0.7 + totalScore * 0.3);
        }
        student.careerReadiness = Math.round(
          student.skills.reduce((sum, s) => sum + s.current, 0) / student.skills.length
        );
        await student.save();
      }
    }

    res.status(201).json({ assessment, updatedStudent: student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all assessments for a student
router.get('/:studentId', async (req, res) => {
  try {
    const assessments = await Assessment.find({ studentId: req.params.studentId }).sort({
      createdAt: -1,
    });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
