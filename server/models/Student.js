import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  current: { type: Number, min: 0, max: 100, default: 0 },
  target: { type: Number, min: 0, max: 100, default: 100 },
});

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    targetRole: { type: String, required: true, trim: true },
    skills: [skillSchema],
    careerReadiness: { type: Number, min: 0, max: 100, default: 0 },
    onboardingDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
