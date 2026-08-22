import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzeUserData } from '../services/ai.js';

const router = express.Router();

// GET /api/evidence
router.get('/', requireAuth, async (req, res) => {
  try {
    return res.json({ evidence: req.user.evidence || [], aiAnalysis: req.user.aiAnalysis });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/evidence
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, title, url, description } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: 'Evidence type and title are required.' });
    }

    const newItem = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type,
      title: title.trim(),
      url: (url || '').trim(),
      description: (description || '').trim(),
      addedAt: new Date(),
    };

    req.user.evidence.push(newItem);
    await req.user.save();

    return res.status(201).json({ message: 'Evidence added successfully', item: newItem, user: req.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/evidence/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description } = req.body;

    const item = req.user.evidence.find((e) => e.id === id || e._id?.toString() === id);

    if (!item) {
      return res.status(404).json({ error: 'Evidence item not found.' });
    }

    if (title !== undefined) item.title = title.trim();
    if (url !== undefined) item.url = url.trim();
    if (description !== undefined) item.description = description.trim();

    await req.user.save();
    return res.json({ message: 'Evidence updated successfully', item, user: req.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/evidence/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    req.user.evidence = req.user.evidence.filter((e) => e.id !== id && e._id?.toString() !== id);
    await req.user.save();
    return res.json({ message: 'Evidence item deleted', user: req.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/evidence/analyze (Trigger AI analysis on all user data & GitHub link)
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const aiResult = await analyzeUserData(user);
    user.aiAnalysis = aiResult;
    user.careerReadiness = aiResult.careerReadiness || user.careerReadiness;

    if (Array.isArray(aiResult.aiSkills) && aiResult.aiSkills.length > 0) {
      user.skills = aiResult.aiSkills;
    }
    if (aiResult.learningPlan) {
      user.learningPlan = aiResult.learningPlan;
    }
    if (aiResult.roadmap) {
      user.roadmap = aiResult.roadmap;
    }
    if (aiResult.careerTwin) {
      user.careerTwin = aiResult.careerTwin;
    }

    await user.save();

    return res.json({
      message: 'AI analysis refreshed successfully!',
      aiAnalysis: aiResult,
      user,
    });
  } catch (err) {
    return res.status(500).json({ error: 'AI Analysis failed: ' + err.message });
  }
});

export default router;
