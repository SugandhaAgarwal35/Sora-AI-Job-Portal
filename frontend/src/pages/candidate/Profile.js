import { useState, useEffect } from "react";
import { User, Edit2, Upload, Trash2, FileText, CheckCircle } from "lucide-react";
import API from "../../services/api";
import "./CandidateDashboard.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/profile");
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put("/api/profile", formData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: "white", padding: "40px" }}>Loading profile...</div>;
  if (!profile) return <div style={{ color: "white", padding: "40px" }}>Profile data is missing. Please reload or login again.</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Profile Settings</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage your personal information and preferences</p>
        </div>
        {!editing ? (
          <button className="btn-secondary" onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "8px" }}><Edit2 size={16}/> Edit Profile</button>
        ) : (
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="panel-card" style={{ marginBottom: "24px" }}>
         <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "var(--surface)" }}>
               <User size={40} />
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
               <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Full Name</label>
                  {editing ? <input type="text" className="form-control" style={{width: "100%"}} value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} /> : <p>{profile.name || "N/A"}</p>}
               </div>
               <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Email</label>
                  <p>{profile.email || "N/A"}</p>
               </div>
               <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Phone</label>
                  {editing ? <input type="text" className="form-control" style={{width: "100%"}} value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <p>{profile.phone || "N/A"}</p>}
               </div>
               <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Headline/Bio</label>
                  {editing ? <input type="text" className="form-control" style={{width: "100%"}} value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} /> : <p>{profile.bio || "N/A"}</p>}
               </div>
            </div>
         </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "24px" }}>
         <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Social Links</h3>
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div>
               <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>LinkedIn</label>
               {editing ? <input type="text" className="form-control" value={formData.linkedin || ""} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={{ width: "100%", boxSizing: "border-box" }} /> : <p>{profile.linkedin || "-"}</p>}
            </div>
            <div>
               <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>GitHub</label>
               {editing ? <input type="text" className="form-control" value={formData.github || ""} onChange={e => setFormData({...formData, github: e.target.value})} style={{ width: "100%", boxSizing: "border-box" }} /> : <p>{profile.github || "-"}</p>}
            </div>
            <div>
               <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Portfolio</label>
               {editing ? <input type="text" className="form-control" value={formData.portfolio || ""} onChange={e => setFormData({...formData, portfolio: e.target.value})} style={{ width: "100%", boxSizing: "border-box" }} /> : <p>{profile.portfolio || "-"}</p>}
            </div>
         </div>
      </div>
    </div>
  );
}
