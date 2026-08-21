import express from "express";
import * as ai from "../controllers/aiController.js";

const router = express.Router();

router.post("/analyze-profiles", ai.analyzeProfiles);
router.post("/generate-plan", ai.generatePlan);
router.get("/plan", ai.getPlan);
router.post("/complete-task", ai.completeTask);
router.get("/todays-tasks", ai.getTodaysTasks);
router.post("/coach-message", ai.getCoachMessage);
router.get("/bonus-tasks", ai.getBonusTasks);
router.patch("/interview-date", ai.updateInterviewDate);

export default router;
