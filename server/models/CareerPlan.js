import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: String,
  title: String,
  category: String,
  estimatedMinutes: Number,
  priority: String,
  resources: [String],
  isInterviewCritical: { type: Boolean, default: false },
});

const daySchema = new mongoose.Schema({
  day: Number,
  date: String,
  tasks: [taskSchema],
  dailySummary: String,
});

const weekSchema = new mongoose.Schema({
  week: Number,
  theme: String,
  goal: String,
  days: [daySchema],
  weeklyMilestone: String,
});

const careerPlanSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    planTitle: String,
    mode: { type: String, enum: ["interview_sprint", "steady_growth", "last_mile_intensive"], default: "steady_growth" },
    totalWeeks: Number,
    weeklyPlans: [weekSchema],
    completedTaskIds: [String],
    interviewDate: Date,
    interviewCompany: String,
    interviewRole: String,
    status: { type: String, enum: ["active", "archived"], default: "active" },
    profileAnalysis: mongoose.Schema.Types.Mixed,
    selectedPath: mongoose.Schema.Types.Mixed,
    progress: {
      totalTasks: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      lastCompletedDate: Date,
    },
  },
  { timestamps: true }
);

// Computed virtual
careerPlanSchema.virtual("completionPercent").get(function () {
  if (!this.progress.totalTasks) return 0;
  return Math.round(
    (this.completedTaskIds.length / this.progress.totalTasks) * 100
  );
});

// Instance method: mark task complete
careerPlanSchema.methods.completeTask = async function (taskId) {
  if (!this.completedTaskIds.includes(taskId)) {
    this.completedTaskIds.push(taskId);
    const today = new Date().toDateString();
    if (this.progress.lastCompletedDate?.toDateString() !== today) {
      this.progress.streakDays += 1;
    }
    this.progress.lastCompletedDate = new Date();
    await this.save();
  }
  return this;
};

// Static: get today's tasks for a student
careerPlanSchema.statics.getTodaysTasks = async function (studentId) {
  const plan = await this.findOne({ studentId, status: "active" });
  if (!plan) return null;
  const today = new Date().toISOString().split("T")[0];
  for (const week of plan.weeklyPlans) {
    for (const day of week.days) {
      if (day.date === today) {
        return { tasks: day.tasks, plan };
      }
    }
  }
  // Fallback: return first day's tasks
  const firstDay = plan.weeklyPlans[0]?.days[0];
  return firstDay ? { tasks: firstDay.tasks, plan } : { tasks: [], plan };
};

careerPlanSchema.set("toJSON", { virtuals: true });

export default mongoose.model("CareerPlan", careerPlanSchema);
