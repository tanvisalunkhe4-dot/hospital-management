import React from "react";
import { 
  LayoutGrid, 
  Users, 
  Activity, 
  BarChart3, 
  Settings, 
  Shield, 
  LogOut 
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside style={sidebarStyle}>
      {/* LOGO SECTION */}
      <div style={logoContainer}>
        <h2 style={logo}>
          Nex<span style={{ color: "#10b981" }}>Health</span>
        </h2>
        <div style={badgeStyle}>MASTER CONTROL</div>
      </div>

      {/* NAVIGATION SECTION */}
      <nav style={navStyle}>
        <NavItem
          label="Node Registry"
          icon={<LayoutGrid size={18} />}
          active={activeTab === "Dashboard"}
          onClick={() => setActiveTab("Dashboard")}
        />

        <NavItem
          label="Staff Registry"
          icon={<Users size={18} />}
          active={activeTab === "Staff"}
          onClick={() => setActiveTab("Staff")}
        />

        <NavItem
          label="Department Nodes"
          icon={<Activity size={18} />}
          active={activeTab === "Depts"}
          onClick={() => setActiveTab("Depts")}
        />

        

        <NavItem
          label="System Config"
          icon={<Settings size={18} />}
          active={activeTab === "Config"}
          onClick={() => setActiveTab("Config")}
        />

        <NavItem
          label="Security"
          icon={<Shield size={18} />}
          active={activeTab === "Security"}
          onClick={() => setActiveTab("Security")}
        />
      </nav>

      {/* FOOTER SECTION */}
      <div style={footerStyle}>
        <button 
          style={terminateBtn} 
          onMouseOver={(e) => e.target.style.background = "#fef2f2"}
          onMouseOut={(e) => e.target.style.background = "#fff"}
        >
          <LogOut size={16} /> Terminate Session
        </button>
      </div>
    </aside>
  );
};

// SUB-COMPONENT: Navigation Item
const NavItem = ({ label, icon, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: active ? "700" : "500",
      color: active ? "#059669" : "#64748b",
      background: active ? "#ecfdf5" : "transparent",
      transition: "all 0.2s ease-in-out",
      border: active ? "1px solid #d1fae5" : "1px solid transparent"
    }}
  >
    <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
    {label}
  </div>
);

// STYLES object
const sidebarStyle = {
  width: "280px",
  background: "#ffffff",
  borderRight: "1px solid #f1f5f9",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  padding: "32px 20px",
  position: "fixed", // Keeps sidebar locked while scrolling content
  left: 0,
  top: 0
};

const logoContainer = {
  marginBottom: "40px",
  paddingLeft: "12px"
};

const logo = {
  fontWeight: "900",
  fontSize: "24px",
  margin: 0,
  letterSpacing: "-0.5px",
  color: "#0f172a"
};

const badgeStyle = {
  fontSize: "10px",
  background: "#fef3c7",
  color: "#d97706",
  padding: "3px 10px",
  borderRadius: "20px",
  marginTop: "6px",
  display: "inline-block",
  fontWeight: "800",
  letterSpacing: "0.5px",
  textTransform: "uppercase"
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const footerStyle = {
  marginTop: "auto",
  paddingTop: "20px"
};

const terminateBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #fee2e2",
  background: "#fff",
  color: "#ef4444",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};

export default Sidebar;