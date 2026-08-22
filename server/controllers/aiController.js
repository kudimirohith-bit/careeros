import * as aiService from "../services/aiService.js";
import CareerPlan from "../models/CareerPlan.js";
import UserProfile from "../models/UserProfile.js";
import User from "../models/User.js";

function resolveKey(req) {
  return req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY;
}

// POST /api/ai/analyze-profiles
export const analyzeProfiles = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "No Gemini API key." });
    const result = await aiService.analyzeProfiles(req.body.profileLinks, apiKey);
    // Save to UserProfile
    await UserProfile.findOneAndUpdate(
      { studentId: req.body.studentId },
      { studentId: req.body.studentId, profileLinks: req.body.profileLinks, profileAnalysis: result },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(result);
  } catch (err) {
    console.error("analyzeProfiles error:", err);
    res.status(500).json({ error: err.message || "Profile analysis failed." });
  }
};

// POST /api/ai/generate-plan
export const generatePlan = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "No Gemini API key." });
    const { selectedPath, profileAnalysis, interviewDate, preferences, studentId } = req.body;
    const planData = await aiService.generateCareerPlan(
      { selectedPath, profileAnalysis, interviewDate, preferences },
      apiKey
    );
    // Archive any existing active plan
    await CareerPlan.updateMany({ studentId, status: "active" }, { status: "archived" });
    const totalTasks = planData.weeklyPlans.flatMap((w) => w.days).flatMap((d) => d.tasks).length;
    const plan = await CareerPlan.create({
      studentId,
      ...planData,
      profileAnalysis,
      selectedPath,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      progress: { totalTasks },
    });
    await UserProfile.findOneAndUpdate(
      { studentId },
      { selectedPath },
      { upsert: true }
    );
    res.json({ success: true, plan });
  } catch (err) {
    console.error("generatePlan error:", err);
    res.status(500).json({ error: err.message || "Plan generation failed." });
  }
};

// POST /api/ai/save-learning-plan
export const saveLearningPlan = async (req, res) => {
  try {
    const { learningPlan, roadmap, checkedTasks } = req.body;
    const userId = req.user?._id || req.body.studentId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (learningPlan) user.learningPlan = learningPlan;
    if (roadmap) user.roadmap = roadmap;
    if (checkedTasks !== undefined) user.checkedTasks = checkedTasks;

    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.error("saveLearningPlan error:", err);
    return res.status(500).json({ error: err.message || "Failed to save learning plan to database." });
  }
};

// GET /api/ai/plan
export const getPlan = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.studentId;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.learningPlan) {
        return res.json({
          plan: user.learningPlan,
          roadmap: user.roadmap,
          checkedTasks: user.checkedTasks || {},
          user,
        });
      }
    }
    const plan = await CareerPlan.findOne({ studentId: req.query.studentId, status: "active" });
    res.json({ plan: plan || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/complete-task
export const completeTask = async (req, res) => {
  try {
    const plan = await CareerPlan.findOne({ studentId: req.body.studentId, status: "active" });
    if (!plan) return res.status(404).json({ error: "No active plan." });
    await plan.completeTask(req.body.taskId);
    res.json({ success: true, completionPercent: plan.completionPercent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/todays-tasks?studentId=xxx
export const getTodaysTasks = async (req, res) => {
  try {
    const result = await CareerPlan.getTodaysTasks(req.query.studentId);
    res.json(result || { tasks: [], plan: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/coach-message
export const getCoachMessage = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "No Gemini API key." });
    const result = await CareerPlan.getTodaysTasks(req.body.studentId);
    if (!result) return res.json({ message: "Set up your plan first!" });
    const message = await aiService.getDailyCoachMessage(
      {
        plan: result.plan,
        todayTasks: result.tasks,
        completedTaskIds: result.plan.completedTaskIds,
        userMessage: req.body.userMessage,
      },
      apiKey
    );
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/bonus-tasks?studentId=xxx&minutes=30
export const getBonusTasks = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "No Gemini API key." });
    const plan = await CareerPlan.findOne({ studentId: req.query.studentId, status: "active" });
    if (!plan) return res.json({ tasks: [] });
    const tasks = await aiService.suggestBonusTasks(
      { plan, completedTaskIds: plan.completedTaskIds, availableMinutes: parseInt(req.query.minutes) || 30 },
      apiKey
    );
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/ai/interview-date
export const updateInterviewDate = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "No Gemini API key." });
    const { studentId, interviewDate, company, role } = req.body;
    const plan = await CareerPlan.findOne({ studentId, status: "active" });
    if (!plan) return res.status(404).json({ error: "No active plan." });
    const adapted = await aiService.adaptPlanForInterview(
      { currentPlan: plan, newInterviewDate: interviewDate, completedTaskIds: plan.completedTaskIds },
      apiKey
    );
    plan.planTitle = adapted.planTitle;
    plan.mode = adapted.mode;
    plan.totalWeeks = adapted.totalWeeks;
    plan.weeklyPlans = adapted.weeklyPlans;
    plan.interviewDate = new Date(interviewDate);
    plan.interviewCompany = company || "";
    plan.interviewRole = role || "";
    plan.progress.totalTasks =
      adapted.weeklyPlans.flatMap((w) => w.days).flatMap((d) => d.tasks).length +
      plan.completedTaskIds.length;
    await plan.save();
    await UserProfile.findOneAndUpdate(
      { studentId },
      { activeInterview: { date: new Date(interviewDate), company: company || "", role: role || "", addedAt: new Date() } }
    );
    res.json({ success: true, adaptationReason: adapted.adaptationReason, urgentActions: adapted.urgentActions, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Plan adaptation failed." });
  }
};

// POST /api/ai/generate (Backend API proxy for client callGemini to keep API key hidden)
export const generateContent = async (req, res) => {
  try {
    const apiKey = resolveKey(req);
    if (!apiKey) return res.status(400).json({ error: "Gemini API key is not configured on server or header." });

    const { systemPrompt, userPrompt } = req.body;
    if (!userPrompt) return res.status(400).json({ error: "userPrompt is required." });

    const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
    let lastErrorDetails = null;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
        };
        if (systemPrompt) {
          body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return res.json({ text });
        } else {
          lastErrorDetails = await response.text().catch(() => '');
        }
      } catch (err) {
        lastErrorDetails = err.message;
      }
    }

    return res.status(500).json({ error: "Gemini API failed across all model variants.", details: lastErrorDetails });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/user-profile (Retrieve UserProfile data)
export const getUserProfile = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user?._id;
    const profile = await UserProfile.findOne({ studentId });
    return res.json({ profile: profile || null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
