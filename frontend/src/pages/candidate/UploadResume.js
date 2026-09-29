import { useState } from "react";
import { CloudUpload, CheckCircle } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";
import { useNavigate } from "react-router-dom";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      await API.post("/api/resume/upload", formData);
      alert("Resume uploaded and analyzed successfully!");
      navigate("/dashboard/score");
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container upload-container">
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Upload Resume</h1>
        <p style={{ color: "var(--text-muted)" }}>Upload your resume to get AI-powered analysis and job recommendations</p>
      </div>

      <div className="upload-box" onClick={() => document.getElementById("resume-upload").click()}>
        <CloudUpload size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
        <h3 style={{ marginBottom: "8px" }}>{file ? file.name : "Ready to upload"}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Drag and drop your resume or click to browse</p>
        <input 
          id="resume-upload" 
          type="file" 
          accept=".pdf" 
          style={{ display: "none" }} 
          onChange={(e) => setFile(e.target.files[0])} 
        />
      </div>

      {file && (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
           <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
             {uploading ? "Analyzing..." : "Analyze Resume"}
           </button>
        </div>
      )}

      <div className="upload-requirements">
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Upload Requirements</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Make sure your resume meets these requirements</p>
        <div className="req-item"><CheckCircle size={16} className="req-icon"/> PDF format only</div>
        <div className="req-item"><CheckCircle size={16} className="req-icon"/> Maximum file size: 10MB</div>
        <div className="req-item"><CheckCircle size={16} className="req-icon"/> Clear text (not scanned images)</div>
        <div className="req-item"><CheckCircle size={16} className="req-icon"/> English language preferred</div>
      </div>

      <div className="upload-tips">
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Tips for Better Results</h3>
        <ul style={{ color: "var(--text-muted)", fontSize: "14px", marginLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>Use standard section headings (Experience, Education, Skills)</li>
          <li>Include specific technologies and tools you've used</li>
          <li>Add measurable achievements with numbers when possible</li>
          <li>Keep formatting clean and consistent</li>
        </ul>
      </div>
    </div>
  );
}
