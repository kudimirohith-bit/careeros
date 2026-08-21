import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, default: Date.now },
    careerReadiness: Number,
    skills: { type: Object, default: {} },
    activityType: { type: String, default: 'general' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
