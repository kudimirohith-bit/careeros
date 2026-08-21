import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helpers ────────────────────────────────────────────────────────────────
function P(filename) {
  return fs.readFileSync(path.join(__dirname, "..", "prompts", filename), "utf8");
}

async function ask(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function parseJSON(text) {
  try {
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    const startBrace = text.indexOf('{');
    const endBrace = text.lastIndexOf('}');
    if (startBrace !== -1 && endBrace !== -1) {
      const jsonSub = text.substring(startBrace, endBrace + 1);
      try {
        return JSON.parse(jsonSub);
      } catch (innerErr) {
        // Fallback for arrays
        const startBracket = text.indexOf('[');
        const endBracket = text.lastIndexOf(']');
        if (startBracket !== -1 && endBracket !== -1) {
          const arraySub = text.substring(startBracket, endBracket + 1);
          return JSON.parse(arraySub);
        }
        throw innerErr;
      }
    }
    throw err;
  }
}

// ── 1. ANALYZE PROFILES ───────────────────────────────────────────────────
async function analyzeProfiles(profileLinks, apiKey) {
  const prompt = P("analyze-profiles.md").replace(
    "{{LINKS}}",
    JSON.stringify(profileLinks, null, 2)
  );
  return parseJSON(await ask(prompt, apiKey));
}

// ── 2. GENERATE CAREER PLAN ──────────────────────────────────────────────
async function generateCareerPlan(
  { selectedPath, profileAnalysis, interviewDate, preferences },
  apiKey
) {
  const today = new Date().toISOString().split("T")[0];
  const daysLeft = interviewDate
    ? Math.max(1, Math.ceil((new Date(interviewDate) - new Date()) / 86400000))
    : null;

  const prompt = P("generate-plan.md")
    .replace("{{TODAY}}", today)
    .replace("{{PATH_TITLE}}", selectedPath.title)
    .replace("{{FOCUS_AREAS}}", selectedPath.keyFocusAreas.join(", "))
    .replace("{{LEVEL}}", profileAnalysis.experienceLevel)
    .replace("{{STRENGTHS}}", profileAnalysis.strengthAreas.join(", "))
    .replace("{{GAPS}}", profileAnalysis.gapAreas.join(", "))
    .replace("{{HOURS}}", preferences?.hoursPerDay || 2)
    .replace(
      "{{INTERVIEW_CONTEXT}}",
      interviewDate
        ? `Interview on ${interviewDate} (${daysLeft} days). Prioritise DSA, System Design, behavioural. Last 3 days = revision only.`
        : `No interview. Steady long-term growth: deep learning + project-building.`
    );

  return parseJSON(await ask(prompt, apiKey));
}

// ── 3. ADAPT PLAN FOR INTERVIEW ─────────────────────────────────────────
async function adaptPlanForInterview(
  { currentPlan, newInterviewDate, completedTaskIds },
  apiKey
) {
  const today = new Date().toISOString().split("T")[0];
  const daysLeft = Math.max(
    1,
    Math.ceil((new Date(newInterviewDate) - new Date()) / 86400000)
  );

  const prompt = P("adapt-plan.md")
    .replace("{{TODAY}}", today)
    .replace("{{NEW_DATE}}", newInterviewDate)
    .replace("{{DAYS_LEFT}}", daysLeft)
    .replace("{{PLAN_TITLE}}", currentPlan.planTitle)
    .replace("{{COMPLETED}}", JSON.stringify(completedTaskIds || []));

  return parseJSON(await ask(prompt, apiKey));
}

// ── 4. DAILY COACH MESSAGE ──────────────────────────────────────────────
async function getDailyCoachMessage(
  { plan, todayTasks, completedTaskIds, userMessage },
  apiKey
) {
  const pending = todayTasks.filter((t) => !completedTaskIds.includes(t.id));
  const done = todayTasks.filter((t) => completedTaskIds.includes(t.id));

  const prompt = P("coach-message.md")
    .replace("{{PLAN_TITLE}}", plan.planTitle)
    .replace("{{MODE}}", plan.mode)
    .replace("{{DONE_COUNT}}", done.length)
    .replace("{{PENDING_COUNT}}", pending.length)
    .replace(
      "{{PENDING_TASKS}}",
      pending.map((t) => t.title).join(", ") || "none"
    )
    .replace(
      "{{USER_MESSAGE}}",
      userMessage ||
        "Give me a quick motivational check-in and tell me what to focus on right now."
    );

  return await ask(prompt, apiKey);
}

// ── 5. BONUS TASK SUGGESTIONS ───────────────────────────────────────────
async function suggestBonusTasks(
  { plan, completedTaskIds, availableMinutes },
  apiKey
) {
  const allTasks = plan.weeklyPlans
    .flatMap((w) => w.days)
    .flatMap((d) => d.tasks);
  const remaining = allTasks
    .filter((t) => !completedTaskIds.includes(t.id))
    .slice(0, 15);

  const prompt = P("bonus-tasks.md")
    .replace("{{MINUTES}}", availableMinutes)
    .replace("{{MODE}}", plan.mode)
    .replace("{{REMAINING}}", JSON.stringify(remaining, null, 2));

  return parseJSON(await ask(prompt, apiKey));
}

export {
  analyzeProfiles,
  generateCareerPlan,
  adaptPlanForInterview,
  getDailyCoachMessage,
  suggestBonusTasks,
};
