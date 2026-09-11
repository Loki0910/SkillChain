import express from "express";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";
import { QUESTION_BANK } from "../data/interviewQuestions.js";
import { IT_ROLES } from "../data/itRoles.js";

const router = express.Router();

const QUESTIONS_PER_SESSION = 5;
const SECONDS_PER_QUESTION = 90; // used by the frontend for the live countdown

function pickRandomQuestions(role) {
  const pool = QUESTION_BANK[role];
  if (!pool) return null;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length));
}

router.get("/roles", auth, (req, res) => {
  res.json(IT_ROLES.filter((r) => QUESTION_BANK[r]));
});

router.get("/questions/:role", auth, (req, res) => {
  const questions = pickRandomQuestions(req.params.role);
  if (!questions) return res.status(400).json({ message: "No questions for this role yet" });
  res.json({ questions, secondsPerQuestion: SECONDS_PER_QUESTION });
});

// Lightweight heuristic scoring: rewards length, structure, and keyword presence.
// This is a placeholder for a real LLM-graded rubric — see README for how to
// swap in an Anthropic API call using the same request/response shape.
function scoreAnswer(question, answer) {
  if (!answer || answer.trim().length === 0) {
    return { score: 0, feedback: "No answer given.", tip: "Even a partial, structured attempt scores better than leaving it blank." };
  }

  const wordCount = answer.trim().split(/\s+/).length;
  let score = 0;
  const feedback = [];

  if (wordCount >= 40) {
    score += 40;
  } else if (wordCount >= 15) {
    score += 25;
    feedback.push("Consider giving a bit more detail or a concrete example.");
  } else {
    score += 10;
    feedback.push("Answer is quite short — aim to explain your reasoning, not just the conclusion.");
  }

  if (/for example|e\.g\.|such as|in my project/i.test(answer)) {
    score += 30;
    feedback.push("Good use of a concrete example.");
  } else {
    feedback.push("Try backing your answer with a specific example from a project you've built.");
  }

  if (/because|therefore|which means|as a result/i.test(answer)) {
    score += 30;
  } else {
    feedback.push("Explain the 'why', not just the 'what'.");
  }

  const finalScore = Math.min(score, 100);
  let tip = "Solid answer — keep practicing out loud so it comes out this clearly under time pressure.";
  if (finalScore < 50) {
    tip = "Structure it as: what it is → why it matters → a quick example from something you've built.";
  } else if (finalScore < 80) {
    tip = "You're close — tighten the explanation and add one concrete example to push this higher.";
  }

  return { score: finalScore, feedback: feedback.join(" "), tip };
}

// Real-time scoring for a single answer, used while the interview is in
// progress so the candidate gets feedback question-by-question instead of
// only at the very end.
router.post("/score", auth, (req, res) => {
  const { question, answer } = req.body;
  if (!question) return res.status(400).json({ message: "question is required" });
  res.json(scoreAnswer(question, answer));
});

function buildTrainingPlan(role, results) {
  const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const weakQuestions = results.filter((r) => r.score < 60);

  const plan = [];
  if (avg < 50) {
    plan.push(`Revisit the fundamentals behind ${role} before your next attempt — pick 2-3 weak topics from below and study them one at a time.`);
  } else if (avg < 80) {
    plan.push("You know the material — focus on tightening your explanations and adding concrete examples.");
  } else {
    plan.push("Strong round. Keep practicing timed sessions so this quality holds up in a live interview.");
  }

  if (weakQuestions.length > 0) {
    plan.push(
      `Weakest areas: ${weakQuestions.map((r) => `"${r.question}"`).slice(0, 3).join(", ")}.`
    );
  }

  plan.push("General resource: roadmap.sh has a free, structured learning path for this role.");

  return plan;
}

router.post("/submit", auth, async (req, res) => {
  const { role, answers } = req.body; // answers: [{ question, answer }]
  if (!role || !Array.isArray(answers)) {
    return res.status(400).json({ message: "role and answers[] are required" });
  }

  const results = answers.map((a) => ({
    question: a.question,
    answer: a.answer,
    ...scoreAnswer(a.question, a.answer),
  }));

  const overallScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length
  );

  const trainingPlan = buildTrainingPlan(role, results);

  const profile = await Profile.findOneAndUpdate(
    { user: req.userId },
    { $push: { interviewHistory: { role, score: overallScore } } },
    { new: true }
  );

  res.json({ overallScore, results, trainingPlan, interviewHistory: profile.interviewHistory });
});

export default router;
