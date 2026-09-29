import { useState } from "react";
import { FileText, ScanSearch, CheckCircle, XCircle } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function JdMatch() {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMatch = async () => {
    if (!jdText) return alert("Please enter a Job Description");
    
    setLoading(true);
    try {
      const res = await API.post("/api/resume/match-jd", { jd_text: jdText });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to match JD");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "text/plain") {
       alert("Please upload a valid .txt file.");
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setJdText(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Job Description Matcher</h1>
        <p style={{ color: "var(--text-muted)" }}>Paste a job description to see how well your resume matches.</p>
      </div>

      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px" }}>Paste Job Description</h3>
          <div>
            <label htmlFor="jd-upload" className="btn-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px" }}>
              Upload .txt File
            </label>
            <input type="file" id="jd-upload" accept=".txt" style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
        </div>
        <textarea 
          className="form-control" 
          rows="8" 
          placeholder="e.g. We are looking for a Software Engineer with experience in React, Node.js, and Python..."
          style={{ width: "100%", boxSizing: "border-box", marginBottom: "16px", resize: "vertical" }}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <button 
          className="btn-primary" 
          onClick={handleMatch} 
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}
        >
          <ScanSearch size={20} /> {loading ? "Analyzing Match..." : "Calculate Match Score"}
        </button>
      </div>

      {result && (
        <div className="panel-card" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: "32px", padding: "20px 0", background: "rgba(0,0,0,0.1)", borderRadius: "12px" }}>
             <h3 style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "8px" }}>Match Score</h3>
             <div style={{ fontSize: "48px", fontWeight: "bold", color: result.match_score >= 70 ? "var(--success)" : "var(--primary)" }}>
               {result.match_score}%
             </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
             <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--success)" }}>
                  <CheckCircle size={18} /> Matched Skills ({result.matched_skills.length})
                </h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                   {result.matched_skills.map((s, i) => <span key={i} className="match-badge">{s}</span>)}
                   {result.matched_skills.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>None detected.</span>}
                </div>
             </div>
             <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#ff4444" }}>
                  <XCircle size={18} /> Missing Skills ({result.missing_skills.length})
                </h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                   {result.missing_skills.map((s, i) => <span key={i} className="badge-outline" style={{ borderColor: "rgba(255, 68, 68, 0.3)" }}>{s}</span>)}
                   {result.missing_skills.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>None detected.</span>}
                </div>
             </div>
          </div>

          {result.suggestions.length > 0 && (
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <h4 style={{ marginBottom: "12px" }}>Insights & Suggestions</h4>
              <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
