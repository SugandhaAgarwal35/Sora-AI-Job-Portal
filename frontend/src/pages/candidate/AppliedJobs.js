import { useEffect, useState } from "react";
import { ExternalLink, Filter } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    API.get("/api/jobs/applied").then(res => setAppliedJobs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Applied Jobs</h1>
        <p style={{ color: "var(--text-muted)" }}>Track all your job applications in one place</p>
      </div>

      <div className="metrics-row" style={{ marginBottom: "24px" }}>
        <div className="metric-card" style={{ padding: "16px 24px" }}>
           <div className="metric-value" style={{ color: "var(--primary)" }}>{appliedJobs.length}</div>
           <div className="metric-label">Total Applied</div>
        </div>
        <div className="metric-card" style={{ padding: "16px 24px" }}>
           <div className="metric-value" style={{ color: "var(--success)" }}>{appliedJobs.filter(j => j.status?.toLowerCase() === 'shortlisted').length}</div>
           <div className="metric-label">Shortlisted</div>
        </div>
        <div className="metric-card" style={{ padding: "16px 24px" }}>
           <div className="metric-value" style={{ color: "var(--secondary)" }}>{appliedJobs.filter(j => j.status?.toLowerCase() === 'interview').length}</div>
           <div className="metric-label">Interview</div>
        </div>
        <div className="metric-card" style={{ padding: "16px 24px" }}>
           <div className="metric-value" style={{ color: "var(--text-muted)" }}>{appliedJobs.filter(j => j.status?.toLowerCase() === 'pending' || !j.status).length}</div>
           <div className="metric-label">Pending</div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", display: "flex", gap: "16px", borderBottom: "1px solid var(--border)" }}>
           <input type="text" placeholder="Search by job title..." className="form-control" style={{ flex: 1 }} />
           <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}><Filter size={16}/> All Status</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", fontSize: "14px", borderBottom: "1px solid var(--border)" }}>
               <th style={{ padding: "16px 24px", fontWeight: "normal" }}>Job</th>
               <th style={{ padding: "16px 24px", fontWeight: "normal" }}>Company</th>
               <th style={{ padding: "16px 24px", fontWeight: "normal" }}>Applied Date</th>
               <th style={{ padding: "16px 24px", fontWeight: "normal" }}>Match</th>
               <th style={{ padding: "16px 24px", fontWeight: "normal" }}>Status</th>
               <th style={{ padding: "16px 24px", fontWeight: "normal", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
             {appliedJobs.map((job, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="hover-row">
                   <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                         <div className="job-icon" style={{ width: "32px", height: "32px", fontSize: "16px" }}>💼</div>
                         <div>
                            <div style={{ fontWeight: 500, marginBottom: "4px" }}>{job.title}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{job.location || "Remote"}</div>
                         </div>
                      </div>
                   </td>
                   <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>🏢 {job.company}</td>
                   <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>📅 {new Date().toLocaleDateString()}</td>
                   <td style={{ padding: "16px 24px" }}>
                      <div style={{ marginBottom: "4px", fontSize: "14px" }}>{job.match_score || 85}%</div>
                      <div className="progress-bar-track" style={{ height: "4px", width: "60px" }}><div className="progress-bar-fill" style={{ width: `${job.match_score || 85}%` }}></div></div>
                   </td>
                   <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                         padding: "4px 12px", 
                         borderRadius: "100px", 
                         fontSize: "12px", 
                         background: job.status?.toLowerCase() === 'shortlisted' ? "rgba(0, 255, 170, 0.1)" : job.status?.toLowerCase() === 'interview' ? "rgba(187, 134, 252, 0.1)" : "rgba(0, 210, 255, 0.1)",
                         color: job.status?.toLowerCase() === 'shortlisted' ? "var(--success)" : job.status?.toLowerCase() === 'interview' ? "var(--secondary)" : "var(--primary)",
                      }}>
                         {job.status || "Applied"}
                      </span>
                   </td>
                   <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button className="btn-secondary" style={{ padding: "8px", background: "transparent", border: "none" }}><ExternalLink size={18}/></button>
                   </td>
                </tr>
             ))}
             {appliedJobs.length === 0 && (
                <tr>
                   <td colSpan="6" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      You haven't applied to any jobs yet.
                   </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
