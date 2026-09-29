import { useEffect, useState } from "react";
import { Search, Filter, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function JobRecommendations() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState(new Set());

  // Filters State
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("Any experience");
  const [jobTypes, setJobTypes] = useState([]);
  const [salary, setSalary] = useState("Any salary");
  const [sortOrder, setSortOrder] = useState("Highest Match");
  const [activeTab, setActiveTab] = useState("recommended"); // 'recommended' | 'all'

  const fetchJobs = () => {
    API.post("/api/jobs/recommend", { search, location, experience, jobTypes, salary })
      .then(res => {
         let fetchedJobs = res.data;
         if (sortOrder === "Most Recent") fetchedJobs.reverse(); 
         setJobs(fetchedJobs);
      }).catch(() => {});
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [sortOrder]);

  useEffect(() => {
    // Make sure we load the base things once
    API.get("/api/jobs/applied").then(res => setAppliedJobIds(new Set(res.data.map(j => j.job_id)))).catch(() => {});
    API.get("/api/jobs/bookmarked").then(res => setBookmarkedJobIds(new Set(res.data.saved_jobs))).catch(() => {});
  }, []);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') fetchJobs();
  };

  const toggleJobType = (type) => {
    setJobTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setExperience("Any experience");
    setSalary("Any salary");
    setJobTypes([]);
    
    // Auto-fetch to clear results immediately
    API.post("/api/jobs/recommend", { search: "", location: "", experience: "Any experience", jobTypes: [], salary: "Any salary" })
      .then(res => setJobs(res.data)).catch(() => {});
  };

  const applyFilters = () => {
    fetchJobs();
  };

  const applyForJob = async (jobId) => {
    try {
      const res = await API.post("/api/jobs/apply", { job_id: jobId });
      alert(res.data.msg || "Successfully applied!");
      setAppliedJobIds(prev => new Set(prev).add(jobId));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to apply");
      if (err.response?.data?.msg === "You have already applied for this job.") {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
      }
    }
  };

  const toggleBookmark = async (jobId) => {
    try {
      const res = await API.post("/api/jobs/bookmark", { job_id: jobId });
      setBookmarkedJobIds(new Set(res.data.saved_jobs));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Job Recommendations</h1>
          <p style={{ color: "var(--text-muted)" }}>Discover and apply for your next opportunity</p>
        </div>
        <div className="auth-tabs" style={{ marginBottom: 0, width: "300px" }}>
            <div className={`auth-tab ${activeTab === "recommended" ? "active" : ""}`} onClick={() => setActiveTab("recommended")}>For You</div>
            <div className={`auth-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Jobs</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "250px 1fr" }}>
        
        {/* Filters Sidebar */}
        <div className="left-panel">
          <div className="panel-card" style={{ padding: "20px" }}>
             <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}><Filter size={16}/> Filters</h3>
             
             <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Location</label>
               <input type="text" placeholder="City, state, or remote..." className="form-control" style={{ width: "100%", boxSizing: "border-box" }} value={location} onChange={e => setLocation(e.target.value)} onKeyDown={handleSearchKeyPress} />
             </div>

             <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Experience Level</label>
               <select className="form-control" style={{ width: "100%", boxSizing: "border-box" }} value={experience} onChange={e => setExperience(e.target.value)}>
                 <option>Any experience</option>
                 <option>Entry level</option>
                 <option>Mid level</option>
                 <option>Senior level</option>
               </select>
             </div>

             <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Salary</label>
               <select className="form-control" style={{ width: "100%", boxSizing: "border-box" }} value={salary} onChange={e => setSalary(e.target.value)}>
                 <option>Any salary</option>
                 <option>Under $50k</option>
                 <option>$50k - $100k</option>
                 <option>Above $100k</option>
               </select>
             </div>

             <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Job Type</label>
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input type="checkbox" checked={jobTypes.includes(t)} onChange={() => toggleJobType(t)} /> {t}
                  </label>
                ))}
             </div>

             <button className="btn-primary" style={{ width: "100%", marginBottom: "12px" }} onClick={applyFilters}>Apply Filters</button>
             <button className="btn-secondary" style={{ width: "100%" }} onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="right-panel">
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
             <div style={{ flex: 1, position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="text" placeholder="Search jobs by title or company (Press Enter)..." className="form-control" style={{ width: "100%", paddingLeft: "48px", boxSizing: "border-box" }} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKeyPress} />
             </div>
             <select className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
               <option>Highest Match</option>
               <option>Most Recent</option>
             </select>
          </div>

          <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "14px" }}>
             Showing {jobs.filter(j => activeTab === "all" || (j.match_score || 0) >= 40).length} jobs
          </p>

          <div className="job-list">
             {jobs.filter(j => activeTab === "all" || (j.match_score || 0) >= 40).length > 0 ? (
               jobs.filter(j => activeTab === "all" || (j.match_score || 0) >= 40).map((job, i) => (
                 <div key={i} className="panel-card" style={{ marginBottom: "16px" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div className="job-info" style={{ alignItems: "center" }}>
                        <div className="job-icon">💼</div>
                        <div>
                          <h4 style={{ fontSize: "18px", marginBottom: "4px" }}>{job.title}</h4>
                          <p style={{ color: "var(--text-muted)", fontSize: "14px", display: "flex", gap: "12px" }}>
                            <span>🏢 {job.company}</span>
                            <span>📍 {job.location || "Remote"}</span>
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          {job.is_expired && (
                              <div className="match-badge" style={{ fontSize: "14px", background: "var(--error)", color: "#fff" }}>
                                Expired
                              </div>
                          )}
                          <div className="match-badge" style={{ fontSize: "14px", background: (job.match_score || 0) >= 70 ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.1)", color: (job.match_score || 0) >= 70 ? "var(--success)" : "#fff"  }}>
                             {job.match_score || "0"}% Match
                          </div>
                          <button 
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "0.2s" }} 
                            onClick={() => toggleBookmark(job.job_id)}
                            title={bookmarkedJobIds.has(job.job_id) ? "Remove Bookmark" : "Save Job"}
                          >
                           {bookmarkedJobIds.has(job.job_id) ? <BookmarkCheck size={24} color="var(--primary)" /> : <Bookmark size={24} />}
                          </button>
                      </div>
                   </div>

                   <div className="progress-bar-track" style={{ height: "4px", marginBottom: "16px" }}>
                      <div className="progress-bar-fill" style={{ width: `${job.match_score || 0}%`, background: (job.match_score || 0) >= 70 ? "var(--success)" : "var(--primary)" }}></div>
                   </div>

                   <div className="job-meta" style={{ marginBottom: "24px", flexWrap: "wrap" }}>
                     {(job.matched_skills || []).slice(0, 5).map(s => (
                       <span key={s} className="badge-outline">{s}</span>
                     ))}
                     {(!job.matched_skills || job.matched_skills.length === 0) && <span style={{ color: "var(--text-muted)" }}>No specific skills matched</span>}
                   </div>

                   <div style={{ display: "flex", gap: "16px" }}>
                     <a className="btn-secondary" style={{ flex: 1, display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", textDecoration: "none" }} href={`/dashboard/jobs/${job.job_id}`}>View Details <ExternalLink size={16}/></a>
                     <button 
                       className="btn-primary" 
                       style={{ flex: 1, background: job.is_expired ? "var(--error)" : "", cursor: job.is_expired ? "not-allowed" : "pointer" }}
                       onClick={() => applyForJob(job.job_id)}
                       disabled={appliedJobIds.has(job.job_id) || job.is_expired}
                     >
                       {job.is_expired ? "Expired" : (appliedJobIds.has(job.job_id) ? "Applied" : "Apply Now")}
                     </button>
                   </div>
                 </div>
               ))
             ) : (
               <div className="panel-card" style={{ textAlign: "center", padding: "48px" }}>
                 <p style={{ color: "var(--text-muted)" }}>No recommendations found aligning with your filters. Try clearing filters or selecting "All Jobs".</p>
                 <button className="btn-primary" style={{ marginTop: "16px" }} onClick={clearFilters}>Clear Filters</button>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
