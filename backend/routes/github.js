import express from "express";
import axios from "axios";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Pulls public repos + languages for the given GitHub username,
// derives a detected-skills list, and stores it on the profile.
router.post("/sync", auth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "GitHub username is required" });

    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`
    );
    const repos = reposRes.data;

    if (!Array.isArray(repos)) {
      return res.status(400).json({ message: "Could not fetch repos for this username" });
    }

    const languageCounts = {};
    let totalStars = 0;
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      totalStars += repo.stargazers_count || 0;
    }

    const detectedSkills = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        description: r.description || "",
        link: r.html_url,
      }));

    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      {
        $set: {
          githubUsername: username,
          detectedSkills,
          projects: topRepos,
        },
      },
      { new: true }
    );

    res.json({
      profile,
      summary: {
        repoCount: repos.length,
        totalStars,
        languages: languageCounts,
      },
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;
