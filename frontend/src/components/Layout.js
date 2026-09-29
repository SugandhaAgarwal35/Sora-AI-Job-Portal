import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <TopNav />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
