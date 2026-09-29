import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Sparkles, CheckCircle, Eye, EyeOff } from "lucide-react";
import API from "../services/api";
import "./LoginLayout.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleMode, setRoleMode] = useState("candidate"); // candidate or recruiter
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter email and password");

    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side branding */}
      <div className="auth-left">
        <div className="decor-widget decor-top-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Resume Score</span>
          <span style={{ fontSize: "24px", color: "var(--primary)", fontWeight: "bold" }}>87<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/100</span></span>
        </div>
        
        <div className="decor-widget decor-bottom-left" style={{ flexDirection: "row", gap: "12px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: "8px", borderRadius: "50%", color: "var(--success)" }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>92% Match Score</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>You're a great fit for this role!</div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "48px", height: "48px", background: "var(--gradient-text)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold", fontSize: "24px" }}>
              S
            </div>
            <h1 style={{ fontSize: "48px", color: "white" }}>SORA</h1>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "400", color: "var(--text-muted)", marginBottom: "16px" }}>Where your future begins</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--primary)", background: "rgba(0, 210, 255, 0.1)", padding: "6px 16px", borderRadius: "30px", fontSize: "13px" }}>
            <Sparkles size={14} /> AI-Powered Career Platform
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Welcome back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>Sign in to continue to SORA</p>

          <div className="auth-tabs">
            <div className={`auth-tab ${roleMode === "candidate" ? "active" : ""}`} onClick={() => setRoleMode("candidate")}>Candidate</div>
            <div className={`auth-tab ${roleMode === "recruiter" ? "active" : ""}`} onClick={() => setRoleMode("recruiter")}>Recruiter</div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: "40px" }} required />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Password</label>
                <a href="#/" style={{ fontSize: "12px" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: "40px", paddingRight: "40px" }} required />
                <div style={{ position: "absolute", right: "12px", top: "13px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "16px" }} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <button className="btn-secondary" style={{ width: "100%" }}>
            <svg style={{ width: "18px", height: "18px", marginRight: "8px" }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
            <span style={{ color: "var(--text-muted)" }}>Don't have an account? </span>
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
