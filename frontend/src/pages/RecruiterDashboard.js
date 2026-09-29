import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Briefcase, Users, CheckCircle, Plus, Search as SearchIcon, Bell, ChevronRight, Eye, MoreHorizontal, ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Dashboard.css";

export default function RecruiterDashboard() {
  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: "", department: "", description: "", requirements: "", 
    skillsReq: "", skillsPref: "", expMin: "", expMax: "",
    salaryMin: "", salaryMax: "", location: "", jobType: "Full-Time", workMode: "Hybrid", deadlineDate: "", deadlineTime: ""
  });

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateNote, setCandidateNote] = useState("");
  
  // Ranking Filters
  const [rankJobId, setRankJobId] = useState("");
  const [rankSortType, setRankSortType] = useState("ats");
  const [rankLimit, setRankLimit] = useState(50);

  // Manage Jobs Filters
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("All Status");

  const location = useLocation();
  const path = location.pathname;

  const isOverview = path === "/recruiter-dashboard" || path === "/recruiter";
  const isCreate = path.includes("/create");
  const isManage = path.includes("/jobs");
  const isCandidates = path.includes("/candidates");
  const isProfile = path.includes("/profile");

  useEffect(() => {
    fetchJobs();
  }, [path]);

  useEffect(() => {
    if (isOverview || isManage) {
      API.get("/api/jobs/applicants").then(res => setApplicants(res.data)).catch(()=>{});
    }
  }, [isOverview, isManage]);
  
  useEffect(() => {
    if (isCandidates) {
      if (rankJobId) {
         API.get(`/api/jobs/${rankJobId}/ranked_candidates?sort_type=${rankSortType}&limit=${rankLimit}`)
           .then(res => setApplicants(res.data)).catch(()=>{});
      } else {
         API.get("/api/jobs/applicants").then(res => setApplicants(res.data)).catch(()=>{});
      }
    }
  }, [isCandidates, rankJobId, rankSortType, rankLimit]);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/api/jobs/recruiter");
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  const postJob = async () => {
    if (!jobForm.title || !jobForm.description || !jobForm.skillsReq || !jobForm.salaryMin || !jobForm.deadlineDate || !jobForm.deadlineTime) {
      return alert("Please fill at least Job Title, Description, Required Skills, Minimum Salary, and Deadline Date/Time.");
    }
    if (Number(jobForm.salaryMin) <= 0) {
      return alert("Minimum Salary must be greater than 0.");
    }
    if (jobForm.workMode !== "Remote" && !jobForm.location) {
      return alert("Location is required for Hybrid or On-site roles.");
    }
    try {
      const payload = { ...jobForm, company: "TechCorp Inc", deadline: `${jobForm.deadlineDate}T${jobForm.deadlineTime}` };
      await API.post("/api/jobs/create", payload);
      alert("Job posted successfully");
      setJobForm({
        title: "", department: "", description: "", requirements: "", 
        skillsReq: "", skillsPref: "", expMin: "", expMax: "",
        salaryMin: "", salaryMax: "", location: "", jobType: "Full-Time", workMode: "Hybrid", deadlineDate: "", deadlineTime: ""
      });
      fetchJobs();
      window.location.href = "/recruiter-dashboard/jobs";
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to post job");
    }
  };

  const saveCandidateNote = async () => {
    if (!selectedCandidate || !rankJobId) return alert("Must filter by a specific job to save notes.");
    try {
      await API.post("/api/jobs/notes", { 
         job_id: rankJobId, 
         candidate_email: selectedCandidate.applicant_email, 
         note: candidateNote 
      });
      alert("Note saved!");
      // Optionally update local state here
      setSelectedCandidate({...selectedCandidate, recruiter_notes: candidateNote});
      setApplicants(prev => prev.map(a => a.applicant_email === selectedCandidate.applicant_email ? {...a, recruiter_notes: candidateNote} : a));
    } catch(err) {
      alert("Failed to save note");
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      await API.delete(`/api/jobs/${jobId}`);
      alert("Job deleted successfully");
      fetchJobs();
    } catch(err) {
      alert("Failed to delete job");
    }
  };

  const shortlistAllListed = async () => {
    if (!rankJobId) return alert("Please select a specific job to bulk shortlist.");
    if (applicants.length === 0) return alert("No applicants to shortlist.");
    if (!window.confirm(`Shortlist all ${applicants.length} candidates listed here?`)) return;

    try {
      const candidateEmails = applicants.map(a => a.applicant_email);
      await API.post("/api/jobs/shortlist_bulk", { job_id: rankJobId, candidate_emails: candidateEmails });
      alert(`Shortlisted ${candidateEmails.length} candidates successfully!`);
      // Update local state to reflect changes
      setApplicants(prev => prev.map(a => ({ ...a, status: "shortlisted" })));
    } catch(err) {
      alert("Failed to process bulk shortlist.");
    }
  };

  const Header = ({ title, subtitle, btnText, btnLink }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px" }}>{title}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{subtitle}</p>
      </div>
      {btnText && (
        <button className="btn-primary" onClick={() => window.location.href = btnLink}>
          <Plus size={18} /> {btnText}
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* ---------------- OVERVIEW ---------------- */}
      {isOverview && (
        <div className="fade-in">
          <Header title="Recruiter Dashboard" subtitle="Manage your job postings and candidates" btnText="Create Job Post" btnLink="/recruiter-dashboard/create" />
          
          <div className="metrics-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon" style={{ color: "var(--primary)" }}><Briefcase size={20}/></div></div>
              <div className="metric-value">{jobs.length}</div>
              <div className="metric-label">Active Jobs</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon" style={{ color: "var(--secondary)" }}><Users size={20}/></div></div>
              <div className="metric-value">{applicants.length}</div>
              <div className="metric-label">Total Applicants</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon" style={{ color: "var(--success)" }}><CheckCircle size={20}/></div></div>
              <div className="metric-value">23</div>
              <div className="metric-label">Shortlisted</div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 340px", marginTop: "32px" }}>
            <div className="panel-card" style={{ padding: 0 }}>
              <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "500" }}>Recent Job Posts</h3>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }} onClick={() => window.location.href='/recruiter-dashboard/jobs'}>
                  View all <ChevronRight size={14} />
                </span>
              </div>
              <div>
                {jobs.slice(0, 5).map((job, idx) => {
                  const appsCount = applicants.filter(a => a.job_title === job.title).length;
                  return (
                    <div key={idx} style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: "500", marginBottom: "4px" }}>{job.title}</h4>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{appsCount} applicants</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="match-badge" style={{ background: job.is_expired ? "rgba(255,0,0,0.1)" : "rgba(16, 185, 129, 0.1)", color: job.is_expired ? "var(--error)" : "var(--success)"}}>
                           {job.is_expired ? "expired" : "active"}
                        </div>
                        <button className="btn-secondary btn-sm" style={{ padding: "6px 16px" }} onClick={() => window.location.href='/recruiter-dashboard/jobs'}>View</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel-card">
              <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "24px" }}>Notifications</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ color: "var(--primary)", marginTop: "2px" }}><Bell size={16} /></div>
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>Shortlisted for Senior Frontend Developer</h5>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>Congratulations! TechCorp Inc. has shortlisted your application.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ color: "var(--primary)", marginTop: "2px" }}><Bell size={16} /></div>
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>Interview Scheduled</h5>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>Your interview with InnovateTech is scheduled for Jan 25, 2024 at 2:00 PM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CREATE JOB ---------------- */}
      {isCreate && (
        <div className="fade-in max-w-4xl mx-auto">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => window.location.href='/recruiter-dashboard'}>
            <ArrowLeft size={20} />
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#fff" }}>Create Job Post</h1>
              <p style={{ fontSize: "13px" }}>Fill in the details to publish a new job</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto", paddingBottom: "64px" }}>
            
            {/* Basic Info */}
            <div className="panel-card">
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "20px" }}>Basic Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Job Title *</label>
                  <input placeholder="e.g. Senior Frontend Developer" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Department *</label>
                  <input placeholder="e.g. Engineering" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})}/>
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Job Description *</label>
                <textarea placeholder="Describe the role, responsibilities, and expectations..." style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", minHeight: "120px", resize: "vertical" }} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}></textarea>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Requirements</label>
                <textarea placeholder="List requirements, one per line..." style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", minHeight: "120px", resize: "vertical" }} value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})}></textarea>
              </div>
            </div>

            {/* Skills */}
            <div className="panel-card">
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "20px" }}>Skills</h3>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Required Skills</label>
                <div style={{ display: "flex", gap: "10px" }}>
                   <input placeholder="e.g. React, Node.js, Python" style={{ flex: 1, background: "#0b0c10" }} value={jobForm.skillsReq} onChange={e => setJobForm({...jobForm, skillsReq: e.target.value})}/>
                   <button className="btn-secondary" style={{ padding: "0 16px" }}><Plus size={18} /></button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Preferred Skills</label>
                <div style={{ display: "flex", gap: "10px" }}>
                   <input placeholder="Add a preferred skill" style={{ flex: 1, background: "#0b0c10" }} value={jobForm.skillsPref} onChange={e => setJobForm({...jobForm, skillsPref: e.target.value})}/>
                   <button className="btn-secondary" style={{ padding: "0 16px" }}><Plus size={18} /></button>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="panel-card">
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "20px" }}>Job Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Experience (Min years)</label>
                  <input type="number" placeholder="0" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.expMin} onChange={e => setJobForm({...jobForm, expMin: e.target.value})}/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Experience (Max years)</label>
                  <input type="number" placeholder="10" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.expMax} onChange={e => setJobForm({...jobForm, expMax: e.target.value})}/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Min Salary (USD)</label>
                  <input type="number" placeholder="80000" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.salaryMin} onChange={e => setJobForm({...jobForm, salaryMin: e.target.value})}/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Max Salary (USD)</label>
                  <input type="number" placeholder="150000" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.salaryMax} onChange={e => setJobForm({...jobForm, salaryMax: e.target.value})}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Location</label>
                  <input placeholder="e.g. San Francisco, CA" style={{ width: "100%", background: "#0b0c10" }} value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})}/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Job Type</label>
                  <select style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "14px", appearance: "none" }} value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})}>
                    <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Work Mode</label>
                  <select style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "14px", appearance: "none" }} value={jobForm.workMode} onChange={e => setJobForm({...jobForm, workMode: e.target.value})}>
                    <option>Hybrid</option><option>Remote</option><option>On-site</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                 <div>
                   <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Application Deadline Date *</label>
                   <input type="date" style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} value={jobForm.deadlineDate} onChange={e => setJobForm({...jobForm, deadlineDate: e.target.value})} />
                 </div>
                 <div>
                   <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Application Deadline Time *</label>
                   <input type="time" style={{ width: "100%", background: "#0b0c10", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} value={jobForm.deadlineTime} onChange={e => setJobForm({...jobForm, deadlineTime: e.target.value})} />
                 </div>
              </div>
            </div>

             {/* Footer Buttons */}
             <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                <button className="btn-secondary" onClick={() => window.location.href='/recruiter-dashboard'}>Cancel</button>
                <button className="btn-primary" onClick={postJob}>Publish Job</button>
             </div>

          </div>
        </div>
      )}

      {/* ---------------- MANAGE JOBS ---------------- */}
      {isManage && (
        <div className="fade-in">
          <Header title="Manage Jobs" subtitle="View and manage all your job postings" btnText="Create Job Post" btnLink="/recruiter-dashboard/create" />
          
          <div className="panel-card" style={{ padding: 0 }}>
             <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
               <div style={{ position: "relative", width: "400px" }}>
                  <SearchIcon size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input placeholder="Search jobs by title or dept..." style={{ width: "100%", paddingLeft: "42px", background: "#0b0c10", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 16px 10px 42px", color: "#fff", fontSize: "13px" }} value={jobSearchTerm} onChange={e => setJobSearchTerm(e.target.value)} />
               </div>
               <select style={{ background: "#0b0c10", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }} value={jobStatusFilter} onChange={e => setJobStatusFilter(e.target.value)}>
                 <option value="All Status">All Status</option><option value="Active">Active</option><option value="Expired">Expired</option>
               </select>
             </div>

             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead>
                 <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Job Title</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Department</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Applicants</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Status</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Posted</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textAlign: "right" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {jobs.filter(j => {
                   if (jobSearchTerm && !j.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) && !(j.department || "").toLowerCase().includes(jobSearchTerm.toLowerCase())) return false;
                   if (jobStatusFilter === "Active" && j.is_expired) return false;
                   if (jobStatusFilter === "Expired" && !j.is_expired) return false;
                   return true;
                 }).length === 0 && (
                   <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No jobs found matching criteria.</td></tr>
                 )}
                 {jobs.filter(j => {
                   if (jobSearchTerm && !j.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) && !(j.department || "").toLowerCase().includes(jobSearchTerm.toLowerCase())) return false;
                   if (jobStatusFilter === "Active" && j.is_expired) return false;
                   if (jobStatusFilter === "Expired" && !j.is_expired) return false;
                   return true;
                 }).map((job, idx) => {
                   const appsCount = applicants.filter(a => a.job_title === job.title).length;
                   return (
                     <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                       <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: "500" }}>{job.title}</td>
                       <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{job.department || "Engineering"}</td>
                       <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: "500" }}>{appsCount}</td>
                       <td style={{ padding: "16px 24px" }}><div className="match-badge" style={{ background: job.is_expired ? "rgba(255,0,0,0.1)" : "rgba(16, 185, 129, 0.1)", color: job.is_expired ? "#ff4444" : "var(--success)", display: "inline-block"}}>
                          {job.is_expired ? "expired" : "active"}
                       </div></td>
                       <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{job.application_deadline ? job.application_deadline.replace('T', ' ') : "N/A"}</td>
                       <td style={{ padding: "16px 24px", textAlign: "right" }}>
                         <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button className="btn-secondary btn-sm" style={{ padding: "6px 12px", borderColor: "rgba(255,255,255,0.2)", color: "var(--text-muted)" }} onClick={() => alert('Edit form coming soon!')}>Edit</button>
                            <button className="btn-secondary btn-sm" style={{ padding: "6px 12px", color: "var(--error)", borderColor: "rgba(255,0,0,0.2)" }} onClick={() => deleteJob(job.job_id)}>Delete</button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* ---------------- CANDIDATES ---------------- */}
      {isCandidates && (
        <div className="fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", color: "var(--text-muted)" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#fff" }}>Candidate Ranking & Applications</h1>
          </div>
          
          <div className="panel-card" style={{ padding: 0 }}>
             <div style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: "16px" }}>
               <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <select style={{ background: "#0b0c10", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }} value={rankJobId} onChange={e => setRankJobId(e.target.value)}>
                    <option value="">-- All Jobs (Unranked) --</option>
                    {jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.title}</option>)}
                  </select>
                  <select disabled={!rankJobId} style={{ background: "#0b0c10", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", opacity: !rankJobId ? 0.5 : 1 }} value={rankSortType} onChange={e => setRankSortType(e.target.value)}>
                    <option value="ats">Sort: ATS Score</option>
                    <option value="skills">Sort: Skills Match</option>
                    <option value="experience">Sort: Experience</option>
                    <option value="combo">Sort: Combo (ATS + Exp)</option>
                  </select>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                     <label style={{ fontSize: "13px", color: "var(--text-muted)", opacity: !rankJobId ? 0.5 : 1 }}>Top:</label>
                     <input type="number" disabled={!rankJobId} min="1" max="1000" style={{ width: "80px", background: "#0b0c10", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", opacity: !rankJobId ? 0.5 : 1 }} value={rankLimit} onChange={e => setRankLimit(e.target.value ? Number(e.target.value) : 50)} />
                  </div>
                  
                  <button className="btn-primary btn-sm" disabled={!rankJobId || applicants.length === 0} style={{ opacity: !rankJobId || applicants.length === 0 ? 0.5 : 1, padding: "10px 16px" }} onClick={shortlistAllListed}>
                     ✓ Shortlist All Listed
                  </button>
               </div>
               
               <div style={{ position: "relative", width: "250px" }}>
                  <SearchIcon size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input placeholder="Search bounds..." style={{ width: "100%", paddingLeft: "42px", background: "#0b0c10", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 16px 10px 42px", color: "#fff", fontSize: "13px" }} />
               </div>
             </div>

             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead>
                 <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Candidate / Rank</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Applied For</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Top Skills</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Match Score (ATS)</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Status</th>
                   <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textAlign: "right" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {applicants.length === 0 && (
                   <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No applicants yet. Select a job to view rankings.</td></tr>
                 )}
                 {applicants.map((app, idx) => {
                   let score = app.combo_score || app.match_score || app.ats_score || 0;
                   let isHighMatch = score >= 80;
                   return (
                   <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: isHighMatch && rankJobId ? "rgba(16, 185, 129, 0.05)" : "transparent" }}>
                     <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isHighMatch ? "var(--success)" : "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "600" }}>
                             {rankJobId ? idx + 1 : app.applicant_email.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "500" }}>{app.applicant_email}</div>
                          </div>
                        </div>
                     </td>
                     <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{app.job_title || "Selected Job"}</td>
                     <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                           {(app.top_skills || []).map((s, i) => (
                             <span key={i} className="badge-outline">{s}</span>
                           ))}
                           {(!app.top_skills || app.top_skills.length === 0) && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No skills listed</span>}
                        </div>
                     </td>
                     <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                           <div className="progress-bar-track" style={{ width: "100px", margin: 0 }}><div className="progress-bar-fill" style={{ width: `${score}%`, background: isHighMatch ? "var(--success)" : "var(--primary)" }}></div></div>
                           <span style={{ fontSize: "13px", fontWeight: "500", color: isHighMatch ? "var(--success)" : "var(--primary)" }}>{score}%</span>
                        </div>
                     </td>
                     <td style={{ padding: "16px 24px" }}>
                        <div className="match-badge" style={{ background: "rgba(255, 255, 255, 0.1)", display: "inline-block", color: app.status === "shortlisted" ? "var(--success)" : "inherit" }}>
                            {app.status || "applied"}
                        </div>
                     </td>
                     <td style={{ padding: "16px 24px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                       <button className="btn-secondary btn-sm" style={{ padding: "6px" }} onClick={() => { setSelectedCandidate(app); setCandidateNote(app.recruiter_notes || ""); }}><Eye size={14}/></button>
                       <button className="btn-secondary btn-sm" style={{ padding: "6px", color: app.status === "shortlisted" ? "var(--success)" : "inherit", borderColor: app.status === "shortlisted" ? "var(--success)" : "inherit" }} onClick={async () => {
                           try {
                               await API.post("/api/jobs/shortlist_bulk", { job_id: rankJobId || app.job_id, candidate_emails: [app.applicant_email] });
                               setApplicants(prev => prev.map(a => a.applicant_email === app.applicant_email ? { ...a, status: "shortlisted"} : a));
                           } catch(err) { alert("Failed"); }
                       }}><CheckCircle size={14}/></button>
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Selected Candidate Panel View */}
      {selectedCandidate && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
           <div className="panel-card" style={{ width: "100%", maxWidth: "800px", height: "90vh", display: "flex", flexDirection: "column", position: "relative", padding: 0 }}>
               
               <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                 <div>
                   <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Candidate Profile & Analysis</h2>
                   <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{selectedCandidate.applicant_email}</p>
                 </div>
                 <button onClick={() => setSelectedCandidate(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "24px" }}>&times;</button>
               </div>
               
               <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                  <div style={{ flex: 1, padding: "24px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                     <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Candidate Match Data</h3>
                     
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                        <div className="metric-card" style={{ padding: "16px" }}>
                           <div className="metric-label" style={{ marginBottom: "8px" }}>Overall Score</div>
                           <div className="metric-value" style={{ fontSize: "24px", color: (selectedCandidate.combo_score || selectedCandidate.match_score) >= 80 ? "var(--success)" : "var(--primary)" }}>{selectedCandidate.combo_score || selectedCandidate.match_score || selectedCandidate.ats_score || 0}%</div>
                        </div>
                        <div className="metric-card" style={{ padding: "16px" }}>
                           <div className="metric-label" style={{ marginBottom: "8px" }}>ATS Relevance</div>
                           <div className="metric-value" style={{ fontSize: "20px" }}>{selectedCandidate.ats_score || 0}%</div>
                        </div>
                     </div>

                     {/* Resume Analytics */}
                     {selectedCandidate.resume_data ? (
                         <>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Detected Skills</h3>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                                {selectedCandidate.resume_data.skills?.map(s => <span key={s} className="badge-outline">{s}</span>)}
                            </div>

                            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Extracted Sections</h3>
                            <div style={{ marginBottom: "24px" }}>
                                <ul style={{ color: "var(--text-muted)", fontSize: "14px", paddingLeft: "20px" }}>
                                  {Object.keys(selectedCandidate.resume_data.sections || {}).map(sec => (
                                     <li key={sec} style={{ textTransform: "capitalize", marginBottom: "4px" }}>{sec} Section Verified</li>
                                  ))}
                                </ul>
                                {selectedCandidate.resume_data.filename && (
                                    <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>Original file attached: {selectedCandidate.resume_data.filename}</div>
                                )}
                            </div>
                         </>
                     ) : (
                         <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            Cannot retrieve detailed resume ATS data. Applicant may not have uploaded a structured resume.
                         </div>
                     )}
                  </div>

                  <div style={{ width: "300px", display: "flex", flexDirection: "column" }}>
                     <div style={{ padding: "24px", flex: 1, overflowY: "auto", background: "rgba(0,0,0,0.2)" }}>
                       <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Recruiter Notes</h3>
                       <textarea 
                           style={{ width: "100%", height: "200px", padding: "12px", background: "#0b0c10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", resize: "none" }}
                           placeholder="Jot down notes about this candidate..."
                           value={candidateNote}
                           onChange={e => setCandidateNote(e.target.value)}
                           disabled={!rankJobId}
                       />
                       {!rankJobId && <div style={{ fontSize: "12px", color: "#ff4444", marginTop: "8px" }}>Select a specific job from the Candidates tab to enable specific note saving for applicants.</div>}
                       
                       <button className="btn-primary" style={{ width: "100%", marginTop: "16px", padding: "10px" }} onClick={saveCandidateNote} disabled={!rankJobId}>Save Note</button>
                     </div>
                     
                     <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.4)" }}>
                        <button className="btn-primary" style={{ width: "100%", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }} onClick={async () => {
                            try {
                               await API.post("/api/jobs/shortlist_bulk", { job_id: rankJobId || selectedCandidate.job_id, candidate_emails: [selectedCandidate.applicant_email] });
                               alert(`Shortlisted ${selectedCandidate.applicant_email}`);
                               setApplicants(prev => prev.map(a => a.applicant_email === selectedCandidate.applicant_email ? { ...a, status: "shortlisted"} : a));
                               setSelectedCandidate(null);
                            } catch(err) {}
                        }}><CheckCircle size={18}/> Mark Shortlisted</button>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* ---------------- PROFILE ---------------- */}
      {isProfile && (
        <div className="fade-in max-w-4xl mx-auto" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "32px" }}>Profile Settings</h1>
          
          <div className="panel-card" style={{ marginBottom: "24px" }}>
             <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "24px" }}>Personal Information</h3>
             <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: "600" }}>SC</div>
                <button className="btn-secondary btn-sm">Change Avatar</button>
             </div>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Full Name</label>
                  <input value="Sarah Chen" readOnly style={{ width: "100%", background: "#0b0c10" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Email</label>
                  <input value="sarah@techcorp.com" readOnly style={{ width: "100%", background: "#0b0c10" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Company</label>
                  <input value="TechCorp Inc" readOnly style={{ width: "100%", background: "#0b0c10" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}>Job Title</label>
                  <input value="Senior Recruiter" readOnly style={{ width: "100%", background: "#0b0c10" }} />
                </div>
             </div>
             <button className="btn-primary">Save Changes</button>
          </div>

          <div className="panel-card">
             <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "24px" }}>Notification Preferences</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "14px", fontWeight: "500" }}>New applications</span>
                   <div style={{ width: "40px", height: "24px", background: "var(--primary)", borderRadius: "12px", position: "relative" }}>
                      <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", right: "2px" }}></div>
                   </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "14px", fontWeight: "500" }}>Candidate shortlisted</span>
                   <div style={{ width: "40px", height: "24px", background: "var(--primary)", borderRadius: "12px", position: "relative" }}>
                      <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", right: "2px" }}></div>
                   </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "14px", fontWeight: "500" }}>Interview reminders</span>
                   <div style={{ width: "40px", height: "24px", background: "var(--primary)", borderRadius: "12px", position: "relative" }}>
                      <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", right: "2px" }}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
