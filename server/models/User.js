import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  current: { type: Number, default: 40 },
  target: { type: Number, default: 85 },
});

const evidenceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['resume', 'github', 'linkedin', 'portfolio', 'project', 'certification', 'achievement'],
    required: true,
  },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
});

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },

    // Profile & Career Goals
    profile: {
      education: {
        degree: { type: String, default: '' },
        gradYear: { type: String, default: '' },
      },
      experienceLevel: { type: String, default: 'Entry Level' },
      targetRole: { type: String, default: 'Full Stack Engineer' },
      industry: { type: String, default: 'Technology' },
      preferredCompanies: [{ type: String }],
      location: { type: String, default: 'Remote' },
      careerGoal: { type: String, default: 'Secure a top-tier software engineering role' },
      hoursPerWeek: { type: Number, default: 15 },
      learningStyle: { type: String, default: 'Hands-on Projects' },
      targetTimeframe: { type: String, default: '6 Months' },
      githubUsername: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      portfolioUrl: { type: String, default: '' },
    },

    // Skills
    skills: [skillSchema],
    careerReadiness: { type: Number, default: 45 },

    // Evidence Hub
    evidence: [evidenceSchema],

    // AI Analysis Cache
    aiAnalysis: {
      careerReadiness: { type: Number, default: 45 },
      skillStrengths: [{ type: String }],
      skillGaps: [{ type: String }],
      recommendedSkills: [{ type: String }],
      recommendedCareerDirection: { type: String, default: '' },
      priorityAreas: [{ type: String }],
      githubAnalysis: mongoose.Schema.Types.Mixed,
      lastAnalyzedAt: { type: Date },
    },

    // Career Twin, Roadmap & Learning Plan
    careerTwin: mongoose.Schema.Types.Mixed,
    roadmap: mongoose.Schema.Types.Mixed,
    learningPlan: mongoose.Schema.Types.Mixed,
    checkedTasks: mongoose.Schema.Types.Mixed,

    // Tests, Interviews & Progress
    assignments: [mongoose.Schema.Types.Mixed],
    tests: [mongoose.Schema.Types.Mixed],
    interviews: [mongoose.Schema.Types.Mixed],
    progressHistory: [
      {
        date: { type: Date, default: Date.now },
        title: { type: String },
        score: { type: Number },
        detail: { type: String },
      },
    ],
    notifications: [notificationSchema],
  },
  { timestamps: true }
);

// Prevent exposing password hash in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
