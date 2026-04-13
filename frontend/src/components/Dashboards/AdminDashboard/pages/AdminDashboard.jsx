import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users, LayoutGrid, Settings, Shield, Activity,
  UserPlus, Search, BarChart3, LogOut
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import Sidebar from "../components/Sidebar";

import Overview from "./Overview";
import StaffRegistry from "./StaffRegistry";
import DeptNodes from "./DeptNodes";
import SystemConfig from "./SystemConfig";
import SecurityManagement from "./SecurityManagement";
const AdminDashboard = () => {

  const [hospitalId, setHospitalId] = useState(localStorage.getItem("hospital_id"));
  const [activeTab, setActiveTab] = useState("Dashboard"); 
  const [staff, setStaff] = useState([]);
  const [depts, setDepts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  // Inside AdminDashboard.jsx
 

  // MODALS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  const handleSignOut = () => {
    // 1. Wipe all local data
    // localStorage.clear() is safer than removeItem if you have multiple tokens
    localStorage.clear(); 
    
    // 2. Reset React state immediately 
    // This prevents the "Noble" data from being visible for even a second
    setStaff([]);
    setDepts([]);
    
    // 3. Force a clean redirect
    // Using window.location.href is good because it forces a full page reload,
    // which naturally clears any remaining in-memory variables.
    window.location.href = "/login"; 
  };
  // FORM
  const initialFormState = {
    full_name: "",
    email: "",
    password: "",
    role: "Doctor",
    dept_id: "",
    hospital_id: localStorage.getItem("hospital_id")
    };

  const [formData, setFormData] = useState(initialFormState);

  // ================= FETCH =================
  // THIS IS THE ONLY ONE YOU NEED
  const fetchData = async () => {
    const storedId = localStorage.getItem("hospital_id");
    if (!storedId) return;

    setLoading(true);
    setStaff([]); // Reset state so City Care starts with a clean slate
    setDepts([]);

    try {
      const [staffRes, deptRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/admin/staff/${storedId}?cb=${Date.now()}`),
        axios.get(`http://localhost:8000/api/v1/admin/departments/${storedId}?cb=${Date.now()}`)
      ]);
      setStaff(staffRes.data);
      setDepts(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    // Pull fresh ID from storage to compare
  const currentId = localStorage.getItem("hospital_id");
  
  // Force clean slate
    setStaff([]); 
  setDepts([]);

    fetchData();
  }, [hospitalId]); 
  
  // Re-runs whenever the hospital ID changes
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const chartData = depts.map(d => {
    const count = staff.filter(s => Number(s.dept_id) === Number(d.id)).length;
    return {
      name: d.name || d.department_name,
      personnel: count,
      capacity: 5 // Target capacity for comparison
    };
  });
  // ================= STAFF HANDLERS =================
  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const storedId = localStorage.getItem("hospital_id");
    if (!window.confirm("Are you sure you want to decommission this personnel node?")) return;
  
    try {
      // Adding the hospital_id as a query param for backend verification
      await axios.delete(`http://localhost:8000/api/v1/admin/staff/${id}?hospital_id=${storedId}`);
      fetchData(); // Refresh to show the empty state for the new hospital
    } catch (err) {
      console.error("Deletion failed: Node might belong to another facility.", err);
      alert("Authorization Error: You do not have permission to delete this record.");
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    // Ensure the hospital_id is preserved and matches the current session
    setFormData({
      ...member,
      hospital_id: localStorage.getItem("hospital_id")
    });
    setIsModalOpen(true);
  };

  // ================= ROLE STYLE =================
  const roleBadgeStyleFn = (role) => ({
    background:
      role === "Doctor" ? "#ecfdf5"
        : role === "Nurse" ? "#eff6ff"
        : "#f8fafc",
    color:
      role === "Doctor" ? "#059669"
        : role === "Nurse" ? "#2563eb"
        : "#64748b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800"
  });

  // ================= UI =================
  return (
<div style={{ display: "flex", height: "100vh", background: "#f8fafc" }}>      {/* SIDEBAR - POLISHED STYLE */}
      <aside style={sidebarStyle}>
        
        {/* BRANDING SECTION */}
        <div style={brandSection}>
          <h2 style={logoStyle}>
            Nex<span style={{ color: "#10b981" }}>Health</span>
          </h2>
          <div style={badgeMaster}>MASTER CONTROL</div>
        </div>

        <nav style={navLinksGroup}>
          <NavItem label="Dashboard" icon={<LayoutGrid size={18} />} active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem label="Staff Registry" icon={<Users size={18} />} active={activeTab === "Staff"} onClick={() => setActiveTab("Staff")} />
          <NavItem label="Departments" icon={<Activity size={18} />} active={activeTab === "Depts"} onClick={() => setActiveTab("Depts")} />
          <NavItem label="System Config" icon={<Settings size={18} />} active={activeTab === "Config"} onClick={() => setActiveTab("Config")} />
          <NavItem label="Security" icon={<Shield size={18} />} active={activeTab === "Security"} onClick={() => setActiveTab("Security")} />
        </nav>

        {/* TERMINATE SESSION BUTTON */}
        <div style={sidebarFooter}>
          <button style={terminateBtn} onClick={handleSignOut}>
             <LogOut size={18} strokeWidth={3} />
             <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={mainContentStyle}>
       
          
     
        {/* ================= VIEWS ================= */}


        {activeTab === "Dashboard" && (
  <Overview 
    staff={staff} 
    depts={depts} 
    onNavigate={setActiveTab} // Allows clicking a "View All" button to switch tabs
  />
)}
        {/* AdminDashboard.jsx */}
{activeTab === "Staff" && (
  <StaffRegistry
    staff={staff}
    depts={depts} // <--- ADD THIS LINE
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
    handleOpenModal={handleOpenModal}
    roleBadgeStyleFn={roleBadgeStyleFn}
  />
)}

{activeTab === "Depts" && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
    
    {/* --- PRIMARY: INFRASTRUCTURE REGISTRY (Moved to Top) --- */}
    <div style={{ 
      background: "#fff", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0", // Slightly thinner for a cleaner look
      overflow: "hidden",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)"
    }}>
      <DeptNodes
        depts={depts}
        staff={staff}
        isDeptModalOpen={isDeptModalOpen}
        setIsDeptModalOpen={setIsDeptModalOpen}
        roleBadgeStyleFn={roleBadgeStyleFn}
        setSelectedDept={setSelectedDept}
        onRefresh={fetchData}
      />
    </div>

    {/* --- SECONDARY: SYSTEM ANALYTICS (Moved to Bottom) --- */}
    <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '40px' // Extra space at bottom
    }}>
      
      {/* Chart 1: Personnel Distribution in Green Theme */}
      <div style={chartCardStyle}>
        <h3 style={chartTitleStyle}>Resource Allocation</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={100}
                paddingAngle={8}
                dataKey="personnel"
              >
                {/* Custom Green Gradient Logic */}
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? "#059669" : index === 1 ? "#10b981" : index === 2 ? "#34d399" : "#a7f3d0"} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} 
              />
              <Legend iconType="circle" verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Node Utilization in Green Theme */}
      <div style={chartCardStyle}>
        <h3 style={chartTitleStyle}>Infrastructure Load</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f0fdf4'}} />
              {/* Primary Green Bar */}
              <Bar dataKey="personnel" name="Active Staff" fill="#10b981" radius={[6, 6, 0, 0]} barSize={25} />
              {/* Soft Green Background Bar for Capacity */}
              <Bar dataKey="capacity" name="Node Capacity" fill="#dcfce7" radius={[6, 6, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
)}
        {activeTab === "Reports" && (
          <Analytics hospitals={depts} />
        )}

        {activeTab === "Config" && <SystemConfig />}

       

{activeTab === "Security" && (
  <SecurityManagement /> 
)}

      </main>
    </div>
  );
};




// ================= STYLES =================

const sidebarStyle = {
  width: "300px", // Slightly wider for the larger text
  background: "#fff",
  padding: "32px 20px",
  borderRight: "2px solid #f1f5f9", // Thicker border
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  boxSizing: "border-box"
};
const brandSection = {
  textAlign: "center",
  marginBottom: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px"
};

const logoStyle = {
  fontSize: "32px",       // Scaled up
  fontWeight: "900",       // Black weight
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-0.04em" // Tighter tracking for premium look
};

const badgeMaster = {
  backgroundColor: "#fef3c7",
  color: "#d97706",
  fontSize: "12px",
  fontWeight: "900",       // Max weight for badge text
  padding: "6px 16px",
  borderRadius: "30px",
  letterSpacing: "0.08em",
  marginTop: "8px",
  textTransform: "uppercase"
};
const navLinksGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,          
  overflowY: "auto", 
  paddingBottom: "20px"
};

const mainContentStyle = {
  flex: 1,
  marginLeft: "300px", 
  padding: "40px",
  minHeight: "100vh",
  background: "#f8fafc",
  overflowY: "auto"
};

const sidebarFooter = {
  marginTop: "auto",
  paddingTop: "20px",
  borderTop: "1px solid #f1f5f9",
  backgroundColor: "#fff"
};

const terminateBtn = {
  width: "100%",
  padding: "5px",
  backgroundColor: "#fff",
  color: "#ef4444",         // High-visibility red
  border: "2.5px solid #fee2e2",
  borderRadius: "16px",
  fontWeight: "900",        // Black/Heavy weight
  fontSize: "13px",         // Increased size
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)"
};
// Add these to the bottom of AdminDashboard.jsx
const chartCardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  minHeight: "350px"
};

const chartTitleStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#0f172a",
  marginBottom: "20px",
  textTransform: "uppercase",
  letterSpacing: "0.025em"
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
const NavItem = ({ label, icon, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px 24px", 
      cursor: "pointer",
      borderRadius: "16px",
      transition: "all 0.2s ease-in-out",
      background: active ? "#f0fdf4" : "transparent",
      // Pure deep black for text
      color: active ? "#10b981" : "#0f172a", 
      // 900 is the heaviest possible weight
      fontWeight: active ? "900" : "800",
      marginBottom: "4px"
    }}
  >
    {/* Cloning the icon to force a thicker stroke width */}
    {React.cloneElement(icon, { 
      size: 22, 
      strokeWidth: active ? 3 : 2.5 
    })}
    <span style={{ fontSize: "18px" }}>{label}</span>
  </div>
);

export default AdminDashboard;