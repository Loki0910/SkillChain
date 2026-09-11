import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import MockInterview from "./pages/MockInterview.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isLoggedIn = Boolean(token);

  const Private = ({ children }) => (isLoggedIn ? children : <Navigate to="/login" />);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar loggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
          <Route path="/skillgap" element={<Private><SkillGap /></Private>} />
          <Route path="/interview" element={<Private><MockInterview /></Private>} />
          <Route path="/resume" element={<Private><ResumeBuilder /></Private>} />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
