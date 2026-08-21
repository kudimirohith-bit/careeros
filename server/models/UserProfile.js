import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    profileLinks: [mongoose.Schema.Types.Mixed],
    profileAnalysis: mongoose.Schema.Types.Mixed,
    selectedPath: mongoose.Schema.Types.Mixed,
    activeInterview: {
      date: Date,
      company: String,
      role: String,
      addedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
