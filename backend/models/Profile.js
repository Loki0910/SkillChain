import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    githubUsername: { type: String, default: "" },
    targetRole: { type: String, default: "" }, // e.g. "Frontend Developer"
    skills: [{ type: String }], // self-reported skills
    detectedSkills: [{ type: String }], // pulled from GitHub languages/repos
    education: { type: String, default: "" },
    experience: [
      {
        title: String,
        organization: String,
        description: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        link: String,
      },
    ],
    interviewHistory: [
      {
        role: String,
        score: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
