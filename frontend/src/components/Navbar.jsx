import { NavLink, useNavigate } from "react-router-dom";
import brandIcon from "../assets/brand-icon.jpg";

export default function Navbar({ loggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="navbar">
      <span className="brand">
        <img className="brand-icon" src={brandIcon} alt="SkillChain" />
        SkillChain
      </span>
      <div className="nav-links">
        {loggedIn ? (
          <>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            <NavLink to="/skillgap" className={linkClass}>Skill Gap</NavLink>
            <NavLink to="/interview" className={linkClass}>Mock Interview</NavLink>
            <NavLink to="/resume" className={linkClass}>Resume</NavLink>
            <button className="secondary logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/signup" className={linkClass}>Signup</NavLink>
          </>
        )}
      </div>
    </div>
  );
}
