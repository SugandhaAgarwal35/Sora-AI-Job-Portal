import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function AtsScore() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/api/resume/results").then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="dashboard-container" style={{ textAlign: "center", padding: "48px" }}>Loading score data...</div>;

  const ats = data.ats_data || {};
  const overall = ats.overall || 0;
  const breakdown = ats.breakdown || { formatting: 0, keyword_match: 0, skill_completeness: 0, experience_relevance: 0, grammar_quality: 0 };
  const suggestions = ats.suggestions || [];
  const working_well = ats.working_well || [];

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>ATS Resume Score</h1>
          <p style={{ color: "var(--text-muted)" }}>See how your resume performs against ATS systems</p>
        </div>
        <button className="btn-secondary">Download Report PDF</button>
      </div>

      <div className="score-hero">
        <div className="score-circle">
          <div className="val">{overall}</div>
          <div className="sub">/ 100</div>
        </div>
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px", color: overall > 80 ? "var(--success)" : "var(--primary)" }}>
             {overall > 80 ? "Very Good" : overall > 60 ? "Good" : "Needs Improvement"}
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "600px", lineHeight: 1.6 }}>
            Your resume is performing {overall > 80 ? "well" : "poorly"}. With a few improvements, you can increase your visibility to recruiters and ATS systems.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
             <Link to="/dashboard/upload" className="btn-primary" style={{ textDecoration: "none" }}>Update Resume →</Link>
             <Link to="/dashboard/jobs" className="btn-secondary" style={{ textDecoration: "none" }}>View Job Matches</Link>
          </div>
        </div>
      </div>

      <div className="score-grid">
        <div className="panel-card">
          <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>Score Breakdown</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Detailed analysis of each category</p>
          
          <div className="progress-bar-container">
             <div className="progress-bar-header"><span>Formatting</span> <span style={{ color: "var(--primary)" }}>{breakdown.formatting}%</span></div>
             <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${breakdown.formatting}%` }}></div></div>
          </div>
          <div className="progress-bar-container">
             <div className="progress-bar-header"><span>Keyword Match</span> <span style={{ color: "var(--primary)" }}>{breakdown.keyword_match}%</span></div>
             <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${breakdown.keyword_match}%` }}></div></div>
          </div>
          <div className="progress-bar-container">
             <div className="progress-bar-header"><span>Skill Completeness</span> <span style={{ color: "var(--primary)" }}>{breakdown.skill_completeness}%</span></div>
             <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${breakdown.skill_completeness}%` }}></div></div>
          </div>
          <div className="progress-bar-container">
             <div className="progress-bar-header"><span>Experience Relevance</span> <span style={{ color: "var(--primary)" }}>{breakdown.experience_relevance}%</span></div>
             <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${breakdown.experience_relevance}%` }}></div></div>
          </div>
          <div className="progress-bar-container">
             <div className="progress-bar-header"><span>Grammar Quality</span> <span style={{ color: "var(--primary)" }}>{breakdown.grammar_quality}%</span></div>
             <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${breakdown.grammar_quality}%` }}></div></div>
          </div>
        </div>

        <div className="panel-card">
          <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>Improvement Suggestions</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Actionable tips to improve your score</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {suggestions.map((s, i) => (
              <div key={i} className="req-item" style={{ background: "rgba(255, 170, 0, 0.05)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255, 170, 0, 0.2)" }}>
                 <span style={{ color: "#ffaa00", marginRight: "12px" }}>!</span> {s}
              </div>
            ))}
            {suggestions.length === 0 && <p style={{ color: "var(--text-muted)" }}>No major suggestions. Great job!</p>}
          </div>
        </div>
      </div>
      
      <div className="panel-card" style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>What's Working Well</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
           {working_well.map((w, i) => (
             <div key={i} className="req-item" style={{ marginBottom: 0 }}>
                <span style={{ color: "var(--success)" }}>✓</span> {w}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
