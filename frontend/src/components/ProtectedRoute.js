import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token, user is not logged in at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If an allowed role is specified and doesn't match the user's role
  if (allowedRole && role !== allowedRole) {
    // Redirect them to their designated dashboard
    if (role === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
