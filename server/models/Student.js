import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: String,
  current: { type: Number, default: 0 },
  target: { type: Number, default: 75 },
});

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Alex Kumar' },
    targetRole: { type: String, default: 'Backend Developer' },
    onboardingDone: { type: Boolean, default: false },
    careerReadiness: { type: Number, default: 0 },
    skills: [skillSchema],
    evidenceHub: {
      github: { type: Boolean, default: false },
      codingPlatform: { type: Boolean, default: false },
      resume: { type: Boolean, default: false },
      certificates: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
