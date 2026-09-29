import { useEffect, useState } from "react";
import { FileText, Briefcase, CheckCircle, Upload as UploadIcon } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    API.post("/api/jobs/recommend").then(res => setJobs(res.data)).catch(() => {});
    API.get("/api/jobs/applied").then(res => setAppliedJobs(res.data)).catch(() => {});
    API.get("/api/resume/results").then(res => setResumeData(res.data)).catch(() => {});
    API.get("/api/profile").then(res => setProfile(res.data)).catch(() => {});
    API.get("/api/user/analytics").then(res => setAnalytics(res.data)).catch(() => {});
  }, []);

  const score = resumeData?.ats_data?.overall || 0;
  
  const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewedJobs")) || [];

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Hello{profile?.name ? `, ${profile.name.split(' ')[0]}` : ""}! 👋</h1>
        <p style={{ color: "var(--text-muted)" }}>Here's what's happening with your job search today</p>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon" style={{ color: "var(--primary)" }}><FileText size={20}/></div>
          </div>
          <div className="metric-value">{score}<span style={{ fontSize: "16px", color: "var(--text-muted)"}}>/100</span></div>
          <div className="metric-label">Resume Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon" style={{ color: "var(--secondary)" }}><Briefcase size={20}/></div>
          </div>
          <div className="metric-value">{jobs.length}</div>
          <div className="metric-label">Recommended Jobs</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon" style={{ color: "var(--success)" }}><CheckCircle size={20}/></div>
          </div>
          <div className="metric-value">{appliedJobs.length}</div>
          <div className="metric-label">Applied Jobs</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-panel">
          <div className="section-title">
            Recommended for You
            <Link to="/dashboard/jobs" style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none" }}>View all →</Link>
          </div>
          <div className="job-list">
            {jobs.slice(0, 3).map((job, i) => (
              <div key={i} className="job-card">
                <div className="job-info">
                  <div className="job-icon">💼</div>
                  <div>
                    <h4 style={{ fontSize: "16px", marginBottom: "4px" }}>{job.title}</h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{job.company}</p>
                    <div className="job-meta">
                      <span className="badge-outline">{job.location || "Remote"}</span>
                      <span className="badge-outline">{job.job_type || "Full-time"}</span>
                    </div>
                  </div>
                </div>
                <div className="job-actions">
                  <div className="match-badge">{job.match_score || Math.floor(Math.random() * 20 + 75)}% Match</div>
                  <Link to="/dashboard/jobs" className="btn-primary btn-sm">View</Link>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>No recommendations yet. Upload your resume to get matched!</p>
            )}
          </div>

          {recentlyViewed.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: "40px" }}>
                Recently Viewed Jobs
              </div>
              <div className="job-list">
                {recentlyViewed.map((job, i) => (
                  <div key={i} className="job-card">
                    <div className="job-info">
                      <div className="job-icon">👀</div>
                      <div>
                        <h4 style={{ fontSize: "16px", marginBottom: "4px" }}>{job.title}</h4>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{job.company}</p>
                        <div className="job-meta">
                          <span className="badge-outline">{job.location || "Remote"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="job-actions">
                      <Link to={`/dashboard/jobs/${job.job_id}`} className="btn-secondary btn-sm">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="right-panel">
          <div className="panel-card" style={{ textAlign: "center" }}>
            <div style={{ background: "rgba(0, 210, 255, 0.1)", color: "var(--primary)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UploadIcon size={20} />
            </div>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Update Resume</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Upload your latest resume to get better job matches and improve your ATS score.</p>
            
            <Link to="/dashboard/upload" className="btn-primary" style={{ display: "block", textDecoration: "none" }}>Upload Now →</Link>
          </div>

          <div className="panel-card" style={{ textAlign: "center" }}>
             <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Resume Score</h3>
             <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>Your ATS compatibility</p>
             <div className="score-circle" style={{ width: "120px", height: "120px", margin: "0 auto" }}>
               <div className="val" style={{ fontSize: "32px"}}>{score}</div>
             </div>
             {analytics && analytics.ats_trend && (
               <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
                 Trend: {analytics.ats_trend.join(" → ")}
               </div>
             )}
          </div>

          {analytics && (
            <div className="panel-card" style={{ textAlign: "center" }}>
               <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>🔥 Learning Streak</h3>
               <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Keep upgrading your skills!</p>
               <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>{analytics.streak_days} Days</div>
            </div>
          )}

          {analytics && (
             <div className="panel-card">
               <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Application Tracker</h3>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Applied</span>
                  <span style={{ fontWeight: "bold" }}>{analytics.applications.total}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Shortlisted</span>
                  <span style={{ fontWeight: "bold", color: "var(--success)" }}>{analytics.applications.shortlisted}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Rejected</span>
                  <span style={{ fontWeight: "bold", color: "#ff4444" }}>{analytics.applications.rejected}</span>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
