import express from "express";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Builds a plain-text resume from profile data. Returned as structured JSON
// so the frontend can render it, and as a flat "text" field for copy/export.
router.get("/generate", auth, async (req, res) => {
  const profile = await Profile.findOne({ user: req.userId }).populate("user", "name email");
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const allSkills = [...new Set([...profile.skills, ...profile.detectedSkills])];

  const sections = {
    name: profile.user.name,
    email: profile.user.email,
    headline: profile.headline || profile.targetRole || "Student",
    summary:
      profile.bio ||
      `${profile.user.name} is pursuing ${profile.targetRole || "a software development role"} with hands-on experience in ${allSkills.slice(0, 4).join(", ") || "web development"}.`,
    skills: allSkills,
    experience: profile.experience,
    projects: profile.projects,
    education: profile.education,
  };

  const text = `${sections.name}
${sections.email}
${sections.headline}

SUMMARY
${sections.summary}

SKILLS
${sections.skills.join(", ")}

EXPERIENCE
${sections.experience.map((e) => `- ${e.title} at ${e.organization}: ${e.description}`).join("\n")}

PROJECTS
${sections.projects.map((p) => `- ${p.name}: ${p.description} (${p.link})`).join("\n")}

EDUCATION
${sections.education}
`;

  res.json({ sections, text });
});

export default router;
