import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building, MapPin, DollarSign, Briefcase, Bookmark, BookmarkCheck, CheckCircle } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
    fetchUserStatus();
    // eslint-disable-next-line
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await API.get(`/api/jobs/${id}`);
      setJob(res.data);
      setLoading(false);
      
      // Store in recently viewed
      storeRecentlyViewed({
         job_id: res.data.job_id,
         title: res.data.title,
         company: res.data.company,
         location: res.data.location
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const storeRecentlyViewed = (jobData) => {
    const key = "recentlyViewedJobs";
    let viewed = JSON.parse(localStorage.getItem(key)) || [];
    viewed = viewed.filter(j => j.job_id !== jobData.job_id); // Remove if exists
    viewed.unshift(jobData); // Add to top
    if (viewed.length > 5) viewed.pop(); // Keep only last 5
    localStorage.setItem(key, JSON.stringify(viewed));
  };

  const fetchUserStatus = async () => {
    try {
      const appRes = await API.get("/api/jobs/applied");
      if (appRes.data.some(j => j.job_id === id)) setApplied(true);

      const markRes = await API.get("/api/jobs/bookmarked");
      if (markRes.data.saved_jobs.includes(id)) setBookmarked(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    try {
      await API.post("/api/jobs/apply", { job_id: id });
      setApplied(true);
      alert("Successfully applied!");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to apply");
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await API.post("/api/jobs/bookmark", { job_id: id });
      setBookmarked(res.data.saved_jobs.includes(id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="dashboard-container"><div className="panel-card" style={{ textAlign: "center", padding: "48px" }}>Loading job details...</div></div>;
  if (!job) return <div className="dashboard-container"><div className="panel-card" style={{ textAlign: "center", padding: "48px" }}>Job not found</div></div>;

  return (
    <div className="dashboard-container">
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => navigate('/dashboard/jobs')}>
        <ArrowLeft size={20} />
        <span style={{ fontSize: "14px", fontWeight: "500" }}>Back to Recommendations</span>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Main Job Details */}
        <div className="panel-card" style={{ padding: "40px 32px" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                 <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "var(--gradient-text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    💼
                 </div>
                 <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>{job.title}</h1>
                    <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
                       <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Building size={16}/> {job.company}</span>
                       <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16}/> {job.location || "Remote"} ({job.work_mode})</span>
                    </div>
                 </div>
              </div>
              <button 
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "8px" }} 
                  onClick={toggleBookmark}
                  title={bookmarked ? "Remove Bookmark" : "Save Job"}
               >
                 {bookmarked ? <BookmarkCheck size={28} color="var(--primary)" /> : <Bookmark size={28} />}
               </button>
           </div>

           <div style={{ display: "flex", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
               <div className="metric-card" style={{ flex: 1, minWidth: "120px", padding: "16px" }}>
                   <div style={{ color: "var(--primary)", marginBottom: "8px" }}><DollarSign size={20}/></div>
                   <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                      ${job.salary_min ? job.salary_min.toLocaleString() : "N/A"} - ${job.salary_max ? job.salary_max.toLocaleString() : "N/A"}
                   </div>
                   <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Salary Range</div>
               </div>
               <div className="metric-card" style={{ flex: 1, minWidth: "120px", padding: "16px" }}>
                   <div style={{ color: "var(--secondary)", marginBottom: "8px" }}><Briefcase size={20}/></div>
                   <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{job.job_type}</div>
                   <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Job Type</div>
               </div>
               <div className="metric-card" style={{ flex: 1, minWidth: "120px", padding: "16px" }}>
                   <div style={{ color: "var(--success)", marginBottom: "8px" }}><CheckCircle size={20}/></div>
                   <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{job.experience_min} - {job.experience_max} Yrs</div>
                   <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Experience Required</div>
               </div>
           </div>

           <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Job Description</h3>
           <div style={{ color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "32px", whiteSpace: "pre-wrap" }}>
             {job.description}
           </div>

           {job.requirements && (
              <>
                 <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Requirements & Responsibilities</h3>
                 <div style={{ color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "32px", whiteSpace: "pre-wrap" }}>
                   {job.requirements}
                 </div>
              </>
           )}

        </div>

        {/* Sidebar Actions & Summary */}
        <div>
           <div className="panel-card" style={{ position: "sticky", top: "24px" }}>
               <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Ready to apply?</h3>
               <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Submit your resume directly to {job.company}. Ensure your profile is up to date.</p>
               
               <button 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "14px", fontSize: "15px", marginBottom: "16px", background: job.is_expired ? "var(--error)" : "", cursor: job.is_expired ? "not-allowed" : "pointer" }}
                  onClick={handleApply}
                  disabled={applied || job.is_expired}
               >
                  {job.is_expired ? "Application deadline has passed" : (applied ? "Application Submitted" : "Apply Now")}
               </button>
               
               {applied && !job.is_expired && <div style={{ textAlign: "center", fontSize: "13px", color: "var(--success)" }}>✓ You have applied for this position</div>}

               <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                   <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Deadline</h4>
                   <div style={{ color: job.is_expired ? "var(--error)" : "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                       {job.application_deadline ? new Date(job.application_deadline).toLocaleString() : "Not Specified"}
                   </div>
                   <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Required Skills</h4>
                   <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                      {(job.skills || []).map(s => <span key={s} className="badge-outline">{s}</span>)}
                   </div>
                   
                   {job.preferred_skills && job.preferred_skills.length > 0 && (
                      <>
                         <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Preferred Skills</h4>
                         <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {job.preferred_skills.map(s => <span key={s} className="badge-outline" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>{s}</span>)}
                         </div>
                      </>
                   )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
