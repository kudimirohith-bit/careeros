import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: {
      type: String,
      enum: ['aptitude', 'coding', 'technical', 'communication', 'mock_interview'],
      required: true,
    },
    scores: { type: Object, default: {} },
    totalScore: { type: Number, default: 0 },
    answers: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
