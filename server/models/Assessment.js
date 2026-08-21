import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    type: {
      type: String,
      enum: ['aptitude', 'coding', 'technical', 'communication'],
      required: true,
    },
    scores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('Assessment', assessmentSchema);
