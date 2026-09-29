import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import DashboardOverview from "./candidate/DashboardOverview";
import UploadResume from "./candidate/UploadResume";
import ResumeResults from "./candidate/ResumeResults";
import AtsScore from "./candidate/AtsScore";
import JobRecommendations from "./candidate/JobRecommendations";
import AppliedJobs from "./candidate/AppliedJobs";
import CareerInsights from "./candidate/CareerInsights";
import Profile from "./candidate/Profile";
import JdMatch from "./candidate/JdMatch";
import JobDetails from "./candidate/JobDetails";

export default function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="upload" element={<UploadResume />} />
        <Route path="results" element={<ResumeResults />} />
        <Route path="score" element={<AtsScore />} />
        <Route path="jobs" element={<JobRecommendations />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="applied" element={<AppliedJobs />} />
        <Route path="insights" element={<CareerInsights />} />
        <Route path="profile" element={<Profile />} />
        <Route path="jd-match" element={<JdMatch />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}
