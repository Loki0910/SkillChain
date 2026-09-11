// Central list of IT roles supported across the platform (skill-gap analysis,
// mock interview question bank, and resume target-role suggestions all read
// from this single source so the role names never drift out of sync).

export const ROLE_SKILLS = {
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git"],
  "Backend Developer": ["Node.js", "Express", "MongoDB", "SQL", "REST APIs", "Git"],
  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Git",
  ],
  "Data Analyst": ["Python", "SQL", "Excel", "Pandas", "Data Visualization", "Statistics"],
  "Data Scientist": [
    "Python",
    "SQL",
    "Statistics",
    "Machine Learning",
    "Pandas",
    "Data Visualization",
  ],
  "AI/ML Engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Statistics", "SQL"],
  "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Git"],
  "Cloud Engineer": ["AWS", "Networking", "Linux", "Terraform", "Docker", "Security Basics"],
  "Mobile App Developer": ["Java", "Kotlin", "Android SDK", "REST APIs", "Git", "UI Design"],
  "iOS Developer": ["Swift", "SwiftUI", "Xcode", "REST APIs", "Git", "UI Design"],
  "QA / Test Engineer": [
    "Manual Testing",
    "Test Case Design",
    "Selenium",
    "API Testing",
    "SQL",
    "Git",
  ],
  "Cybersecurity Analyst": [
    "Networking",
    "Linux",
    "Security Fundamentals",
    "SIEM Tools",
    "Cryptography Basics",
    "Incident Response",
  ],
  "Database Administrator": ["SQL", "Database Design", "Indexing", "Backup & Recovery", "Linux", "Security Basics"],
  "UI/UX Designer": ["Figma", "Wireframing", "User Research", "Prototyping", "Design Systems", "HTML/CSS Basics"],
  "Site Reliability Engineer": ["Linux", "Docker", "Kubernetes", "Monitoring", "CI/CD", "Scripting"],
  "Blockchain Developer": ["Solidity", "Smart Contracts", "Ethereum", "JavaScript", "Cryptography Basics", "Git"],
  "Game Developer": ["C#", "Unity", "Game Physics", "3D Math", "Git", "UI Design"],
  "Embedded Systems Engineer": ["C", "C++", "Microcontrollers", "RTOS", "Circuit Basics", "Git"],
  "Business Analyst (IT)": ["Requirements Gathering", "SQL", "Excel", "Process Mapping", "Stakeholder Communication", "Documentation"],
};

export const IT_ROLES = Object.keys(ROLE_SKILLS);
