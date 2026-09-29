import { useEffect, useState } from "react";
import { Lightbulb, ExternalLink } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function CareerInsights() {
  const [data, setData] = useState({ skillGaps: [], courses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/resume/insights")
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-container" style={{ padding: "48px", textAlign: "center" }}>Loading your career insights...</div>;

  const { skillGaps, courses } = data;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Career Insights</h1>
        <p style={{ color: "var(--text-muted)" }}>AI-powered career development recommendations based on your resume</p>
      </div>

      <div className="panel-card" style={{ marginBottom: "24px" }}>
         <h3 style={{ fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}><Lightbulb size={20} color="var(--primary)" /> Skill Gap Analysis</h3>
         <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>Missing high-demand skills you should consider adding</p>
         
         <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {skillGaps.length === 0 && <p style={{ color: "var(--text-muted)" }}>No major skill gaps detected!</p>}
            {skillGaps.map((skill, i) => (
              <div key={i}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                       <span style={{ fontWeight: 500 }}>{skill.name}</span>
                       <span style={{ 
                          fontSize: "12px", padding: "2px 8px", borderRadius: "100px",
                          background: skill.priority === 'high' ? "rgba(255, 68, 68, 0.1)" : skill.priority === 'medium' ? "rgba(255, 170, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
                          color: skill.priority === 'high' ? "#ff4444" : skill.priority === 'medium' ? "#ffaa00" : "var(--text-muted)"
                       }}>{skill.priority} priority</span>
                    </div>
                    <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{skill.current}% → {skill.target}%</span>
                 </div>
                 <div className="progress-bar-track" style={{ height: "6px" }}>
                    <div className="progress-bar-fill" style={{ width: `${skill.current}%` }}></div>
                    <div style={{ width: "2px", height: "10px", background: "var(--text-muted)", position: "absolute", left: `${skill.target}%`, marginTop: "-2px" }}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="panel-card">
         <h3 style={{ fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>Suggested Courses</h3>
         <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Recommended learning paths explicitly targeting your gaps</p>
         
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {courses.length === 0 && <p style={{ color: "var(--text-muted)" }}>No courses recommended currently.</p>}
            {courses.map((course, i) => (
              <div key={i} className="panel-card" style={{ background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "20px", display: "flex", flexDirection: "column" }}>
                 <h4 style={{ marginBottom: "8px" }}>{course.title}</h4>
                 <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px", flex: 1 }}>{course.desc}</p>
                 <a href={course.link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ width: "100%", textDecoration: "none", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                   View Course <ExternalLink size={14} />
                 </a>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
