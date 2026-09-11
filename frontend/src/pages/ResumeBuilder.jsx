import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../api.js";

const TEMPLATES = [
  { id: "modern", label: "Modern", className: "resume-modern" },
  { id: "classic", label: "Classic", className: "resume-classic" },
  { id: "minimal", label: "Minimal", className: "resume-minimal" },
  { id: "elegant", label: "Elegant", className: "resume-elegant" },
  { id: "corporate", label: "Corporate", className: "resume-corporate" },
  { id: "creative", label: "Creative", className: "resume-creative" },
  { id: "tech", label: "Tech", className: "resume-tech" },
  { id: "executive", label: "Executive", className: "resume-executive" },
  { id: "compact", label: "Compact", className: "resume-compact" },
  { id: "timeline", label: "Timeline", className: "resume-timeline" },
  { id: "photofocus", label: "Photo Focus", className: "resume-photofocus" },
  { id: "gradient", label: "Gradient", className: "resume-gradient" },
];

const THEMES = [
  { id: "none", label: "None" },
  { id: "aurora", label: "Aurora" },
  { id: "particles", label: "Particles" },
  { id: "mesh", label: "Mesh" },
  { id: "grid", label: "Grid" },
  { id: "orbit", label: "Orbit" },
];

const PHOTO_KEY = "skillchain_resume_photo";
const THEME_KEY = "skillchain_resume_theme";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3MB

export default function ResumeBuilder() {
  const [resume, setResume] = useState(null);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem(PHOTO_KEY);
      if (savedPhoto) setPhoto(savedPhoto);
      const savedThemeId = localStorage.getItem(THEME_KEY);
      const savedTheme = THEMES.find((t) => t.id === savedThemeId);
      if (savedTheme) setTheme(savedTheme);
    } catch {
      // localStorage unavailable — safe to ignore, defaults apply
    }
  }, []);

  const generate = async () => {
    const res = await api.get("/resume/generate");
    setResume(res.data);
  };

  const copyText = () => {
    if (resume) navigator.clipboard.writeText(resume.text);
  };

  const changeTheme = (t) => {
    setTheme(t);
    try {
      localStorage.setItem(THEME_KEY, t.id);
    } catch {
      // ignore
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Photo must be under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl);
      try {
        localStorage.setItem(PHOTO_KEY, dataUrl);
      } catch {
        // storage full/unavailable — photo still works for this session
      }
    };
    reader.onerror = () => setPhotoError("Couldn't read that image, try another file.");
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError("");
    try {
      localStorage.removeItem(PHOTO_KEY);
    } catch {
      // ignore
    }
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${(resume?.sections?.name || "resume").replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`resume-page bg-theme-${theme.id}`}>
      <div className="bg-decor" aria-hidden="true">
        <span className="bg-blob bg-blob-1" />
        <span className="bg-blob bg-blob-2" />
        <span className="bg-blob bg-blob-3" />
        <span className="bg-grid" />
        <span className="bg-orbit-ring bg-orbit-ring-1" />
        <span className="bg-orbit-ring bg-orbit-ring-2" />
        <span className="bg-particle-field">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="bg-particle" style={{ "--i": i }} />
          ))}
        </span>
      </div>

      <div className="resume-page-content">
        <div className="card fade-in">
          <h2>AI resume builder</h2>
          <p className="muted">
            Builds a resume draft from your profile, skills, GitHub projects, and experience —
            pick a template, add a photo, and download it as a PDF.
          </p>
          <button onClick={generate}>Generate resume</button>
        </div>

        {resume && (
          <>
            <div className="card fade-in">
              <h4 style={{ marginTop: 0 }}>Add your photo</h4>
              <div className="photo-uploader">
                <div className="photo-uploader-preview">
                  {photo ? (
                    <img src={photo} alt="Your upload" />
                  ) : (
                    <span className="photo-placeholder">No photo</span>
                  )}
                </div>
                <div className="photo-uploader-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                  <button className="secondary" onClick={() => fileInputRef.current?.click()}>
                    {photo ? "Change photo" : "Upload photo"}
                  </button>
                  {photo && (
                    <button className="secondary" onClick={removePhoto}>
                      Remove
                    </button>
                  )}
                  <p className="muted photo-hint">Square photos look best. Max 3MB.</p>
                  {photoError && <p className="photo-error">{photoError}</p>}
                </div>
              </div>
            </div>

            <div className="card fade-in">
              <h4 style={{ marginTop: 0 }}>Choose a template</h4>
              <div className="template-picker">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    className={`template-option ${t.className}${
                      template.id === t.id ? " template-selected" : ""
                    }`}
                    onClick={() => setTemplate(t)}
                  >
                    <span className="template-swatch" />
                    {t.label}
                  </button>
                ))}
              </div>

              <h4>Background theme</h4>
              <p className="muted" style={{ marginTop: -6 }}>
                Only decorates this page — your downloaded PDF always stays clean and print-ready.
              </p>
              <div className="theme-picker">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-option${theme.id === t.id ? " theme-selected" : ""}`}
                    onClick={() => changeTheme(t)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={downloadPdf} disabled={downloading}>
                  {downloading ? "Preparing PDF..." : "Download PDF"}
                </button>
                <button className="secondary" onClick={copyText}>Copy as text</button>
              </div>
            </div>

            <div className="resume-preview-wrapper fade-in">
              <div ref={previewRef} className={`resume-preview ${template.className}`}>
                <div className="resume-preview-header">
                  {photo && <img src={photo} alt="Profile" className="resume-photo" />}
                  <div className="resume-header-text">
                    <h3>{resume.sections.name}</h3>
                    <p className="muted">{resume.sections.email} · {resume.sections.headline}</p>
                  </div>
                </div>

                <p>{resume.sections.summary}</p>

                <h4>Skills</h4>
                <div>
                  {resume.sections.skills.map((s) => (
                    <span className="badge" key={s}>{s}</span>
                  ))}
                </div>

                <h4>Experience</h4>
                {resume.sections.experience?.length ? (
                  resume.sections.experience.map((e, i) => (
                    <div key={i} className="resume-entry">
                      <strong>{e.title}</strong> — {e.organization}
                      <p className="muted">{e.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="muted">—</p>
                )}

                <h4>Projects</h4>
                {resume.sections.projects.map((p, i) => (
                  <div key={i} className="resume-entry">
                    <strong>{p.name}</strong>
                    <p className="muted">{p.description}</p>
                  </div>
                ))}

                <h4>Education</h4>
                <p>{resume.sections.education || "—"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
