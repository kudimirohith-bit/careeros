import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzeUserData } from '../services/ai.js';

const router = express.Router();

// POST /api/onboarding
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const {
      education,
      experienceLevel,
      targetRole,
      industry,
      preferredCompanies,
      location,
      careerGoal,
      hoursPerWeek,
      learningStyle,
      targetTimeframe,
      githubUsername,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    // Update user profile fields
    user.profile = {
      ...user.profile,
      education: {
        degree: education?.degree || '',
        gradYear: education?.gradYear || '',
      },
      experienceLevel: experienceLevel || user.profile?.experienceLevel || 'Entry Level',
      targetRole: targetRole || user.profile?.targetRole || 'Software Engineer',
      industry: industry || user.profile?.industry || 'Technology',
      preferredCompanies: Array.isArray(preferredCompanies) ? preferredCompanies : user.profile?.preferredCompanies || [],
      location: location || user.profile?.location || 'Remote',
      careerGoal: careerGoal || user.profile?.careerGoal || 'Build a successful software engineering career',
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : 15,
      learningStyle: learningStyle || 'Hands-on Projects',
      targetTimeframe: targetTimeframe || '6 Months',
      githubUsername: githubUsername ? githubUsername.trim() : user.profile?.githubUsername || '',
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : user.profile?.linkedinUrl || '',
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : user.profile?.portfolioUrl || '',
    };

    // Populate evidence hub items if github/linkedin/portfolio provided
    if (user.profile.githubUsername) {
      const existingGh = user.evidence.find((e) => e.type === 'github');
      if (!existingGh) {
        user.evidence.push({
          id: 'gh_' + Date.now(),
          type: 'github',
          title: `GitHub Profile (@${user.profile.githubUsername})`,
          url: `https://github.com/${user.profile.githubUsername}`,
          description: 'Public GitHub repositories and contribution profile',
          addedAt: new Date(),
        });
      }
    }

    if (user.profile.linkedinUrl) {
      const existingLi = user.evidence.find((e) => e.type === 'linkedin');
      if (!existingLi) {
        user.evidence.push({
          id: 'li_' + Date.now(),
          type: 'linkedin',
          title: 'LinkedIn Professional Profile',
          url: user.profile.linkedinUrl,
          description: 'Professional background and work history',
          addedAt: new Date(),
        });
      }
    }

    if (user.profile.portfolioUrl) {
      const existingPort = user.evidence.find((e) => e.type === 'portfolio');
      if (!existingPort) {
        user.evidence.push({
          id: 'port_' + Date.now(),
          type: 'portfolio',
          title: 'Personal Portfolio Website',
          url: user.profile.portfolioUrl,
          description: 'Personal projects and professional website',
          addedAt: new Date(),
        });
      }
    }

    // Perform AI Analysis on GitHub + Social Links to generate AI Skills, Roadmap & Learning Plan
    const aiAnalysisResult = await analyzeUserData(user);
    user.aiAnalysis = aiAnalysisResult;
    user.careerReadiness = aiAnalysisResult.careerReadiness || 50;

    if (Array.isArray(aiAnalysisResult.aiSkills) && aiAnalysisResult.aiSkills.length > 0) {
      user.skills = aiAnalysisResult.aiSkills;
    }
    if (aiAnalysisResult.learningPlan) {
      user.learningPlan = aiAnalysisResult.learningPlan;
    }
    if (aiAnalysisResult.roadmap) {
      user.roadmap = aiAnalysisResult.roadmap;
    }
    if (aiAnalysisResult.careerTwin) {
      user.careerTwin = aiAnalysisResult.careerTwin;
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true;

    await user.save();

    return res.json({
      message: 'AI skill assessment, learning plan, and roadmap generated successfully!',
      user,
    });
  } catch (err) {
    console.error('Onboarding route error:', err);
    return res.status(500).json({ error: 'Failed to complete onboarding: ' + err.message });
  }
});

export default router;
