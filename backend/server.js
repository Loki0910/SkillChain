import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import githubRoutes from "./routes/github.js";
import skillGapRoutes from "./routes/skillgap.js";
import interviewRoutes from "./routes/interview.js";
import resumeRoutes from "./routes/resume.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/skillgap", skillGapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillchain";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
