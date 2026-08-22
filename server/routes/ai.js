import express from "express";
import * as ai from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", ai.generateContent);
router.get("/user-profile", ai.getUserProfile);
router.post("/analyze-profiles", ai.analyzeProfiles);
router.post("/generate-plan", ai.generatePlan);
router.post("/save-learning-plan", requireAuth, ai.saveLearningPlan);
router.get("/plan", requireAuth, ai.getPlan);
router.post("/complete-task", ai.completeTask);
router.get("/todays-tasks", ai.getTodaysTasks);
router.post("/coach-message", ai.getCoachMessage);
router.get("/bonus-tasks", ai.getBonusTasks);
router.patch("/interview-date", ai.updateInterviewDate);

export default router;
