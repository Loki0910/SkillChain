import { useEffect, useState } from "react";
import api from "../api.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [status, setStatus] = useState("");

  const load = () => {
    api.get("/profile/me").then((res) => {
      setProfile(res.data);
      setSkillsInput((res.data.skills || []).join(", "));
      setGithubUsername(res.data.githubUsername || "");
    });
  };

  useEffect(load, []);

  const save = async () => {
    setStatus("Saving...");
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const res = await api.put("/profile/me", {
      headline: profile.headline,
      bio: profile.bio,
      education: profile.education,
      skills,
    });
    setProfile(res.data);
    setStatus("Saved.");
    setTimeout(() => setStatus(""), 1500);
  };

  const syncGithub = async () => {
    if (!githubUsername) return;
    setStatus("Syncing GitHub...");
    try {
      const res = await api.post("/github/sync", { username: githubUsername });
      setProfile(res.data.profile);
      setStatus(
        `Synced ${res.data.summary.repoCount} repos, ${res.data.summary.totalStars} stars.`
      );
    } catch (err) {
      setStatus(err.response?.data?.message || "Sync failed");
    }
  };

  if (!profile) return <div className="card fade-in">Loading...</div>;

  return (
    <div>
      <div className="card fade-in">
        <h2>Your profile</h2>
        {status && <p className="muted">{status}</p>}
        <input
          placeholder="Headline (e.g. Aspiring Full Stack Developer)"
          value={profile.headline || ""}
          onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
        />
        <textarea
          placeholder="Short bio"
          rows={3}
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        />
        <input
          placeholder="Education (e.g. BCA, XYZ College, 2023-2026)"
          value={profile.education || ""}
          onChange={(e) => setProfile({ ...profile, education: e.target.value })}
        />
        <input
          placeholder="Skills, comma separated (e.g. JavaScript, Python, React)"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
        />
        <button onClick={save}>Save profile</button>
      </div>

      <div className="card fade-in">
        <h3>Connect GitHub</h3>
        <p className="muted">Pulls your public repos to detect languages/skills automatically.</p>
        <input
          placeholder="GitHub username"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
        />
        <button onClick={syncGithub}>Sync GitHub</button>
        <div style={{ marginTop: 10 }}>
          {(profile.detectedSkills || []).map((s) => (
            <span className="badge" key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
