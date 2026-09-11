import { useEffect, useState } from "react";
import api from "../api.js";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/profile/me").then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  if (!profile) return <div className="card fade-in">Loading...</div>;

  const lastInterview = profile.interviewHistory?.[profile.interviewHistory.length - 1];

  return (
    <div>
      <div className="card fade-in">
        <h2>Welcome, {profile.user?.name}</h2>
        <p className="muted">{profile.headline || "No headline set yet — visit your profile."}</p>
        <div>
          {[...new Set([...(profile.skills || []), ...(profile.detectedSkills || [])])].map(
            (s) => (
              <span className="badge" key={s}>{s}</span>
            )
          )}
        </div>
      </div>

      <div className="card fade-in">
        <h3>Target role</h3>
        <p>{profile.targetRole || "Not set — run a skill-gap analysis to set one."}</p>
      </div>

      <div className="card fade-in">
        <h3>Last mock interview</h3>
        {lastInterview ? (
          <p>
            {lastInterview.role}: <strong>{lastInterview.score}/100</strong>
          </p>
        ) : (
          <p className="muted">No interviews taken yet.</p>
        )}
      </div>

      <div className="card fade-in">
        <h3>Projects (from GitHub sync)</h3>
        {profile.projects?.length ? (
          profile.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <a href={p.link} target="_blank" rel="noreferrer">{p.name}</a>
              <p className="muted">{p.description}</p>
            </div>
          ))
        ) : (
          <p className="muted">No projects synced yet — connect GitHub from your profile.</p>
        )}
      </div>
    </div>
  );
}
