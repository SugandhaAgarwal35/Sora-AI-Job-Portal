import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Target, 
  Briefcase, 
  CheckCircle, 
  Lightbulb,
  User,
  PlusCircle,
  Users,
  LogOut,
  ScanSearch
} from "lucide-react";

export default function Sidebar() {
  const role = localStorage.getItem("role") || "jobseeker";

  const candidateLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload Resume", path: "/dashboard/upload", icon: <Upload size={20} /> },
    { name: "Resume Results", path: "/dashboard/results", icon: <FileText size={20} /> },
    { name: "ATS Score", path: "/dashboard/score", icon: <Target size={20} /> },
    { name: "JD Match", path: "/dashboard/jd-match", icon: <ScanSearch size={20} /> },
    { name: "Job Recommendations", path: "/dashboard/jobs", icon: <Briefcase size={20} /> },
    { name: "Applied Jobs", path: "/dashboard/applied", icon: <CheckCircle size={20} /> },
    { name: "Career Insights", path: "/dashboard/insights", icon: <Lightbulb size={20} /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User size={20} /> },
  ];

  const recruiterLinks = [
    { name: "Dashboard", path: "/recruiter-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Create Job Post", path: "/recruiter-dashboard/create", icon: <PlusCircle size={20} /> },
    { name: "Manage Jobs", path: "/recruiter-dashboard/jobs", icon: <Briefcase size={20} /> },
    { name: "Candidates", path: "/recruiter-dashboard/candidates", icon: <Users size={20} /> },
    { name: "Profile", path: "/recruiter-dashboard/profile", icon: <User size={20} /> },
  ];

  const links = role === "recruiter" ? recruiterLinks : candidateLinks;

  return (
    <div className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <div className="sidebar-logo">S</div>
        <span>SORA</span>
      </NavLink>

      <div className="sidebar-nav">
        {links.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path} 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            end={link.path.endsWith("dashboard")}
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </div>
      
      <div 
        className="sidebar-link" 
        style={{ marginTop: "auto", cursor: "pointer", color: "var(--text-muted)" }} 
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        <LogOut size={20} />
        Log Out
      </div>
    </div>
  );
}
