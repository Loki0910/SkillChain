import { useEffect, useState } from "react";
import api from "../api.js";

export default function SkillGap() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/skillgap/roles").then((res) => {
      setRoles(res.data);
      setSelectedRole(res.data[0] || "");
    });
  }, []);

  const analyze = async () => {
    setError("");
    try {
      const res = await api.post("/skillgap/analyze", { targetRole: selectedRole });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    }
  };

  return (
    <div>
      <div className="card fade-in">
        <h2>Skill-gap analysis</h2>
        {error && <div className="error">{error}</div>}
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button onClick={analyze}>Analyze</button>
      </div>

      {result && (
        <div className="card fade-in">
          <h3>{result.targetRole}</h3>
          <p>Readiness: {result.readiness}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${result.readiness}%` }} />
          </div>

          {result.readiness === 100 && (
            <div className="ready-banner fade-in">
              <span>🎉 You're 100% ready for {result.targetRole} roles.</span>
              <a
                className="linkedin-btn"
                href={result.linkedinSearchUrl}
                target="_blank"
                rel="noreferrer"
              >
                Apply on LinkedIn
              </a>
            </div>
          )}

          <h4 style={{ marginTop: 16 }}>You already have</h4>
          <div>
            {result.have.map((s) => (
              <span className="badge" key={s}>{s}</span>
            ))}
            {result.have.length === 0 && <p className="muted">None yet.</p>}
          </div>

          <h4>Missing</h4>
          <div>
            {result.missing.map((s) => (
              <span className="badge" style={{ color: "#ff6b6b" }} key={s}>{s}</span>
            ))}
            {result.missing.length === 0 && <p className="muted">Nothing missing!</p>}
          </div>

          <p style={{ marginTop: 12 }}>{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}
