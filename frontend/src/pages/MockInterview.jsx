import { useEffect, useRef, useState } from "react";
import api from "../api.js";

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("idle"); // idle | running | live-feedback | finished
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]); // [{question, answer, score, feedback, tip}]
  const [liveResult, setLiveResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(90);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    api.get("/interview/roles").then((res) => {
      setRoles(res.data);
      setRole(res.data[0] || "");
    });
    return () => clearInterval(timerRef.current);
  }, []);

  const clearTimer = () => clearInterval(timerRef.current);

  const startTimer = (seconds) => {
    clearTimer();
    setSecondsLeft(seconds);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          submitCurrentAnswer(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const start = async () => {
    setError("");
    setFinalResult(null);
    setResults([]);
    try {
      const res = await api.get(`/interview/questions/${encodeURIComponent(role)}`);
      setQuestions(res.data.questions);
      setSecondsPerQuestion(res.data.secondsPerQuestion);
      setIndex(0);
      setAnswer("");
      setStatus("running");
      startTimer(res.data.secondsPerQuestion);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load questions");
    }
  };

  // timedOut is true when the countdown hit zero instead of the user clicking submit
  const submitCurrentAnswer = async (timedOut = false) => {
    clearTimer();
    const question = questions[index];
    const res = await api.post("/interview/score", { question, answer });
    const entry = { question, answer, ...res.data };
    setResults((prev) => [...prev, entry]);
    setLiveResult(entry);
    setStatus("live-feedback");
  };

  const nextQuestion = () => {
    const nextIndex = index + 1;
    setLiveResult(null);
    setAnswer("");
    if (nextIndex >= questions.length) {
      finishInterview();
      return;
    }
    setIndex(nextIndex);
    setStatus("running");
    startTimer(secondsPerQuestion);
  };

  const finishInterview = async () => {
    const payload = results.map((r) => ({ question: r.question, answer: r.answer }));
    const res = await api.post("/interview/submit", { role, answers: payload });
    setFinalResult(res.data);
    setStatus("finished");
  };

  const restart = () => {
    clearTimer();
    setStatus("idle");
    setQuestions([]);
    setResults([]);
    setFinalResult(null);
    setLiveResult(null);
  };

  const timerPct = secondsPerQuestion ? (secondsLeft / secondsPerQuestion) * 100 : 0;
  const timerLow = secondsLeft <= 15 && status === "running";

  return (
    <div>
      {status === "idle" && (
        <div className="card fade-in">
          <h2>AI mock interview</h2>
          <p className="muted">
            Real-time, timed practice questions with instant scoring and feedback after every answer.
          </p>
          {error && <div className="error">{error}</div>}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button onClick={start}>Start interview</button>
        </div>
      )}

      {(status === "running" || status === "live-feedback") && questions.length > 0 && (
        <div className="card fade-in">
          <div className="interview-header">
            <span className="muted">Question {index + 1} of {questions.length} · {role}</span>
            {status === "running" && (
              <span className={`timer-badge${timerLow ? " timer-low" : ""}`}>{secondsLeft}s</span>
            )}
          </div>
          {status === "running" && (
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div
                className={`progress-fill${timerLow ? " progress-fill-danger" : ""}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          )}

          <p><strong>{questions[index]}</strong></p>

          {status === "running" && (
            <>
              <textarea
                rows={5}
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoFocus
              />
              <button onClick={() => submitCurrentAnswer(false)}>Submit answer</button>
            </>
          )}

          {status === "live-feedback" && liveResult && (
            <div className="live-feedback fade-in">
              <h3>Score: {liveResult.score}/100</h3>
              <p className="muted">{liveResult.feedback}</p>
              <p className="training-tip">💡 {liveResult.tip}</p>
              <button onClick={nextQuestion}>
                {index + 1 >= questions.length ? "See final results" : "Next question"}
              </button>
            </div>
          )}
        </div>
      )}

      {status === "finished" && finalResult && (
        <div className="card fade-in">
          <h3>Overall score: {finalResult.overallScore}/100</h3>
          {finalResult.results.map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p><strong>{r.question}</strong></p>
              <p className="muted">Score: {r.score}/100 — {r.feedback}</p>
            </div>
          ))}

          <h4 style={{ marginTop: 16 }}>Your training plan</h4>
          <ul className="training-plan">
            {finalResult.trainingPlan.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>

          <button className="secondary" onClick={restart} style={{ marginTop: 12 }}>
            Practice again
          </button>
        </div>
      )}
    </div>
  );
}
