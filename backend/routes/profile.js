import express from "express";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get own profile
router.get("/me", auth, async (req, res) => {
  const profile = await Profile.findOne({ user: req.userId }).populate("user", "name email");
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  res.json(profile);
});

// Update profile fields
router.put("/me", auth, async (req, res) => {
  const allowed = [
    "headline",
    "bio",
    "githubUsername",
    "targetRole",
    "skills",
    "education",
    "experience",
    "projects",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const profile = await Profile.findOneAndUpdate(
    { user: req.userId },
    { $set: updates },
    { new: true }
  );
  res.json(profile);
});

export default router;
