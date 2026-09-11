import express from "express";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";
import { ROLE_SKILLS, IT_ROLES } from "../data/itRoles.js";

const router = express.Router();

router.get("/roles", auth, (req, res) => {
  res.json(IT_ROLES);
});

router.post("/analyze", auth, async (req, res) => {
  const { targetRole } = req.body;
  const required = ROLE_SKILLS[targetRole];
  if (!required) {
    return res.status(400).json({ message: "Unknown role. Check /roles for supported values." });
  }

  const profile = await Profile.findOne({ user: req.userId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const known = new Set(
    [...profile.skills, ...profile.detectedSkills].map((s) => s.toLowerCase())
  );

  const have = [];
  const missing = [];
  for (const skill of required) {
    if (known.has(skill.toLowerCase())) have.push(skill);
    else missing.push(skill);
  }

  const readiness = Math.round((have.length / required.length) * 100);

  profile.targetRole = targetRole;
  await profile.save();

  res.json({
    targetRole,
    readiness,
    have,
    missing,
    recommendation:
      missing.length === 0
        ? "You cover every core skill listed for this role. Focus on depth and portfolio projects."
        : `Prioritize learning: ${missing.slice(0, 3).join(", ")}.`,
    // When readiness hits 100%, the frontend uses this to show an
    // "Apply on LinkedIn" button pointed at a live job search for the role.
    linkedinSearchUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
      targetRole
    )}`,
  });
});

export default router;
