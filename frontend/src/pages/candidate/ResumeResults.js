import { useEffect, useState } from "react";
import { FileText, GraduationCap, Briefcase, FolderGit2, Award, Terminal } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function ResumeResults() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    API.get("/api/resume/results").then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="dashboard-container" style={{ textAlign: "center", padding: "48px" }}>Loading resume data...</div>;

  const sections = data.sections || {};
  const skills = data.skills || [];

  const renderContent = () => {
    switch(activeTab) {
      case "overview":
        return (
          <div>
            <div className="panel-card" style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Professional Summary</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                 {sections.summary || "No professional summary extracted."}
              </p>
            </div>
            <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="panel-card">
                 <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Extracted Skills Count</h3>
                 <p style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>{skills.length}</p>
                 <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Total Technical Skills Found</p>
              </div>
              <div className="panel-card">
                 <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Sections Detected</h3>
                 <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.keys(sections).map(k => sections[k] ? <span key={k} className="match-badge">{k}</span> : null)}
                 </div>
              </div>
            </div>
          </div>
        );
      case "education":
        return sections.education ? (
          <div className="panel-card"><pre style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontFamily: "inherit" }}>{sections.education}</pre></div>
        ) : <MissingSection name="Education" />;
      case "experience":
        return sections.experience ? (
          <div className="panel-card"><pre style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontFamily: "inherit" }}>{sections.experience}</pre></div>
        ) : <MissingSection name="Experience" />;
      case "projects":
        return sections.projects ? (
          <div className="panel-card"><pre style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontFamily: "inherit" }}>{sections.projects}</pre></div>
        ) : <MissingSection name="Projects" />;
      case "certifications":
        return sections.certifications ? (
          <div className="panel-card"><pre style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontFamily: "inherit" }}>{sections.certifications}</pre></div>
        ) : <MissingSection name="Certifications" />;
      case "skills":
        return skills.length > 0 ? (
          <div className="panel-card">
             <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
               {skills.map((s, i) => <span key={i} className="badge-outline">{s}</span>)}
             </div>
          </div>
        ) : <MissingSection name="Skills" />;
      default: return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Resume Analysis</h1>
        <p style={{ color: "var(--text-muted)" }}>AI-extracted information from your resume</p>
      </div>

      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><FileText size={16}/> Overview</button>
        <button className={`tab-btn ${activeTab === "education" ? "active" : ""}`} onClick={() => setActiveTab("education")}><GraduationCap size={16}/> Education</button>
        <button className={`tab-btn ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}><Briefcase size={16}/> Experience</button>
        <button className={`tab-btn ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}><FolderGit2 size={16}/> Projects</button>
        <button className={`tab-btn ${activeTab === "certifications" ? "active" : ""}`} onClick={() => setActiveTab("certifications")}><Award size={16}/> Certifications</button>
        <button className={`tab-btn ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}><Terminal size={16}/> Skills</button>
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
}

function MissingSection({ name }) {
  return (
    <div className="missing-section">
      <h3 style={{ marginBottom: "8px" }}>{name} Not Found</h3>
      <p>This is not present in your resume. Please update your resume to include this section for better AI matching.</p>
    </div>
  );
}
