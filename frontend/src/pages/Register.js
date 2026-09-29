import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Sparkles, UserPlus, Eye, EyeOff, Hash } from "lucide-react";
import API from "../services/api";
import "./LoginLayout.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleMode, setRoleMode] = useState("jobseeker"); // 'jobseeker' maps internally
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return alert("Please fill all fields");

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      return alert("Email must be a valid @gmail.com address");
    }

    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(password)) {
      return alert("Password must be 8-16 characters long, contain at least 1 uppercase letter, and 1 special character");
    }

    setLoading(true);
    try {
      await API.post("/api/auth/register", { email, password, role: roleMode });
      alert("Registration successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side branding */}
      <div className="auth-left">
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "48px", height: "48px", background: "var(--gradient-text)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold", fontSize: "24px" }}>
              S
            </div>
            <h1 style={{ fontSize: "48px", color: "white" }}>SORA</h1>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "400", color: "var(--text-muted)", marginBottom: "16px" }}>Join the Future of Hiring</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--primary)", background: "rgba(0, 210, 255, 0.1)", padding: "6px 16px", borderRadius: "30px", fontSize: "13px" }}>
            <Sparkles size={14} /> Intelligent Career Growth
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Create an account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>Join SORA to accelerate your career or hiring</p>

          <div className="auth-tabs">
            <div className={`auth-tab ${roleMode === "jobseeker" ? "active" : ""}`} onClick={() => setRoleMode("jobseeker")}>Candidate</div>
            <div className={`auth-tab ${roleMode === "recruiter" ? "active" : ""}`} onClick={() => setRoleMode("recruiter")}>Recruiter</div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: "40px" }} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: "40px", paddingRight: "40px" }} required />
                <div style={{ position: "absolute", right: "12px", top: "13px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ paddingLeft: "40px", paddingRight: "40px" }} required />
                <div style={{ position: "absolute", right: "12px", top: "13px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "16px" }} disabled={loading}>
              <UserPlus size={18} /> {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
            <span style={{ color: "var(--text-muted)" }}>Already have an account? </span>
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
