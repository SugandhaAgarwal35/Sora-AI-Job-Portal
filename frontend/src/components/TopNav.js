import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import API from "../services/api";

export default function TopNav() {
  const [userName, setUserName] = useState("Loading...");
  const [showNotifications, setShowNotifications] = useState(false);
  const role = localStorage.getItem("role") || "jobseeker";
  const initials = userName === "Loading..." ? ".." : userName.substring(0, 2).toUpperCase();

  useEffect(() => {
    API.get("/api/profile")
      .then(res => setUserName(res.data.email.split("@")[0]))
      .catch(() => setUserName("User"));
  }, []);

  return (
    <div className="top-nav">
      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search jobs, candidates, or commands..." />
      </div>

      <div className="top-icons">
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={20} color="var(--text-muted)" />
          <span style={{ 
            position: "absolute", top: -5, right: -5, 
            background: "var(--primary)", color: "#000", 
            fontSize: "10px", fontWeight: "bold", 
            borderRadius: "50%", width: 16, height: 16, 
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>2</span>
          
          {showNotifications && (
            <div style={{
              position: "absolute", top: "30px", right: "0", width: "300px",
              background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "16px", zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }} onClick={e => e.stopPropagation()}>
              <h4 style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Notifications</h4>
              
              <div style={{ marginBottom: "12px", padding: "8px", background: "rgba(0, 210, 255, 0.05)", borderRadius: "6px" }}>
                 <p style={{ fontSize: "13px", color: "var(--foreground)", marginBottom: "4px" }}><strong>New Job Match!</strong></p>
                 <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>A new 'Software Engineer' role aligns 92% with your profile.</p>
              </div>
              
              <div style={{ padding: "8px", background: "rgba(255, 170, 0, 0.05)", borderRadius: "6px" }}>
                 <p style={{ fontSize: "13px", color: "var(--foreground)", marginBottom: "4px" }}><strong>Skill Recommendation</strong></p>
                 <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Adding 'Docker' to your resume can boost your visibility by 15%.</p>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section" onClick={() => {
            if(window.confirm("Logout?")) {
              localStorage.clear();
              window.location.href = "/login";
            }
        }}>
          <div className="profile-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
