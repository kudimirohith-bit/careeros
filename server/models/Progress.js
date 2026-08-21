import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: { type: Date, default: Date.now },
    careerReadiness: { type: Number, min: 0, max: 100 },
    skills: {
      // Snapshot: { skillName: currentScore, ... }
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
