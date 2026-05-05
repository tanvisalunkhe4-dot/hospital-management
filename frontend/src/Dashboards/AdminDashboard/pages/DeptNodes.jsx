import React, { useMemo, useState, useEffect } from "react";import axios from "axios";
import { Plus, Search, MapPin, Users, Hexagon, Edit, Trash2, X, Activity } from "lucide-react";

const DeptNodes = ({
  depts = [],    // Add = [] to prevent .length errors
  staff = [],
  setIsDeptModalOpen, // Controlled by parent
  isDeptModalOpen,    // Passed from parent
  roleBadgeStyleFn,
  onRefresh           // Function to re-fetch departments from DB
}) => {

  const [searchTerm, setSearchTerm] = useState("");
  // --- FORM STATE ---
  const initialFormState = {
    name: "",
    dept_code: "",
    location: "",
    dept_type: "Clinical",
    contact_number: "",
    description: "",
    head_of_dept: "",
    medical_hod: "",
    admin_hod: ""
  };
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  // Helper to open modal for Editing vs Creating
  const openModal = (dept = null) => {
    if (dept) {
      setFormData(dept); // Pre-fill with existing dept data
    } else {
      setFormData(initialFormState); // Reset for new dept
    }
    setIsDeptModalOpen(true);
  };
  // Helper to reset and close
  const closeModal = () => {
    setIsDeptModalOpen(false);
    setFormData(initialFormState);
  };
  
  const handleRoleChange = (role) => {
    setSelectedRoleFilter(role);
    setFormData({ ...formData, head_of_dept: "" }); 
};

  const handleRegister = async (e) => {
    e.preventDefault();
    const hospitalId = localStorage.getItem("hospital_id");
    const isEditing = !!formData.id;

    const payload = {
      name: formData.name,
      dept_code: formData.dept_code,
      location: formData.location,
      dept_type: formData.dept_type,
      head_of_dept: formData.head_of_dept, // The selected staff name
      hospital_id: parseInt(hospitalId),    // Must be an integer
      contact_number: formData.contact_number,
      // Add any other fields your Pydantic model requires
    };
    const headOfDeptString = Array.isArray(formData.head_of_dept)
      ? formData.head_of_dept.join(", ")
      : formData.head_of_dept;


    try {
      if (isEditing) {
        // UPDATE EXISTING NODE
        await axios.put(`http://localhost:8000/api/v1/admin/departments/${formData.id}`, payload);
      } else {
        // CREATE NEW NODE
        await axios.post("http://localhost:8000/api/v1/admin/departments", payload);
      }
      
      onRefresh(); 
      closeModal();
    } catch (err) {
      console.error("Operation Failed:", err);
      // Detailed error logging helps with troubleshooting during development
      const errorMessage = err.response?.data?.detail || "Check if the Department Code is unique or server is down.";
      alert(`Initialization Failed: ${errorMessage}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to decommission the ${name} node?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/admin/departments/${id}`);
        
        // If successful:
        onRefresh(); 
      } catch (err) {
        // This pulls the "Transfer staff first" message from your FastAPI backend
        const serverMessage = err.response?.data?.detail;
        
        if (serverMessage) {
          alert(`NODE PROTECTION: ${serverMessage}`);
        } else {
          alert("System Error: Could not reach the infrastructure server.");
        }
        console.error("Deletion failed:", err);
      }
    }
  };
  const filteredDepts = useMemo(() => {
    return depts.filter((dept) => {
      const name = (dept.name || "").toLowerCase();
      const code = (dept.dept_code || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [depts, searchTerm]);
  return (

    
    <div style={container}>
      {/* INFRASTRUCTURE HEADER */}
      <div style={headerSection}>
        <div style={breadcrumb}>MANAGEMENT / INFRASTRUCTURE</div>
        <div style={headerRow}>
          <div>
            <h1 style={mainTitle}>Department Infrastructure</h1>
            <div style={subTitle}>
              <span style={statusDot}></span> {depts.length} Active Nodes Registered
            </div>
          </div>
          <button onClick={() => setIsDeptModalOpen(true)} style={addBtn}>
            <Plus size={18} strokeWidth={3} /> Register Department
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div style={metricsGrid}>
        <div style={metricCard}>
          <div style={metricLabel}>NETWORK CAPACITY</div>
          <div style={metricValue}>{depts.length} Units</div>
        </div>
        <div style={metricCard}>
          <div style={metricLabel}>REGISTRY STATUS</div>
          <div style={{ ...metricValue, color: "#10b981" }}>Stable</div>
        </div>
      </div>

      {/* REGISTRY TABLE SECTION */}
      <div style={registryContainer}>
      <div style={searchWrapper}>
  <Search size={18} style={searchIcon} />
  <input 
    type="text" 
    placeholder="Filter nodes by name or code..." 
    style={searchInput} 
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)} // Connect to state
  />
</div>

        <table style={table}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={th}>DEPARTMENT NODE</th>
              <th style={th}>IDENTIFIER</th>
              <th style={th}>HEAD OF DEPARTMENT</th>
              <th style={th}>CAPACITY</th>
              <th style={th}>STATUS</th>
              <th style={thRight}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
  {filteredDepts.length === 0 ? (  // <--- Use filteredDepts here
    <tr>
      <td colSpan="6" style={{ padding: "100px 0", textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontWeight: "700" }}>
          <Activity size={48} style={{ marginBottom: "16px", opacity: 0.5, margin: '0 auto' }} />
          <p>{searchTerm ? "No matching nodes found." : "No active infrastructure nodes found."}</p>
        </div>
      </td>
    </tr>
  ) : (
    filteredDepts.map((d) => {
      // 1. Setup Display Variables
      const displayName = d.name || d.department_name || "Unknown Dept";
      const displayCode = d.dept_code || d.code || "N/A";
      const displayHeadOfDept = d.head_of_dept || "Not assigned";
      
      // 2. Calculate Relationship Data (Only once!)
      const assignedCount = staff.filter(
        (s) => Number(s.dept_id) === Number(d.id)
      ).length;

      // 3. System Safeguard Logic
      const isDeletable = assignedCount === 0;

      return (
        <tr 
          key={d.id} 
          style={tableRow}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <td style={td}>
            <div style={nodeInfo}>
              <div style={iconBox}>
                <Hexagon size={16} color="#10b981" strokeWidth={3} />
              </div>
              <div>
                <div style={deptNameText}>{displayName}</div>
                <div style={locationText}>
                  <MapPin size={12} /> {d.location || "Sector Unassigned"}
                </div>
              </div>
            </div>
          </td>
          
          <td style={td}>
            <span style={roleBadgeStyleFn("Doctor")}>{displayCode}</span>
          </td>

          <td style={td}>
            <div style={capacityText}>{displayHeadOfDept}</div>
          </td>
          
          <td style={td}>
            <div style={capacityText}>{assignedCount} Personnel</div>
          </td>
          
          <td style={td}>
            <div style={statusWrapper}>
              <span style={activeDot}></span> Connected
            </div>
          </td>
          
          <td style={tdRight}>
            <div style={actionGroup}>
              {/* EDIT BUTTON */}
              <button 
                style={editBtn} 
                onClick={() => { setFormData(d); setIsDeptModalOpen(true); }}
                title="Modify Node"
              >
                <Edit size={16} />
              </button>

              {/* DELETE BUTTON with dynamic styling */}
              <button 
                style={{
                  ...deleteBtn,
                  opacity: isDeletable ? 1 : 0.3,
                  cursor: isDeletable ? "pointer" : "not-allowed"
                }} 
                onClick={() => isDeletable 
                  ? handleDelete(d.id, displayName) 
                  : alert(`NODE PROTECTED: You must transfer ${assignedCount} staff members before decommissioning this node.`)
                }
                disabled={!isDeletable}
                title={isDeletable ? "Decommission Node" : "Node Busy"}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      );
    })
  )}
</tbody>
        </table>
      </div>

      {/* --- INFRASTRUCTURE REGISTRATION MODAL --- */}
      {isDeptModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <div>
                <h2 style={{ ...mainTitle, fontSize: "24px" }}>Register New Node</h2>
                <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "700", margin: "4px 0 0 0" }}>
                  SYSTEM INFRASTRUCTURE / UNIT INITIALIZATION
                </p>
              </div>
              <button onClick={() => setIsDeptModalOpen(false)} style={closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleRegister} style={formLayout}>
              <div style={inputGroup}>
                <label style={labelStyle}>Department Name</label>
                <input 
                id="dept_name"
                name="name"
                  required
                  style={inputStyle} 
                  placeholder="e.g. Cardiology" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Node Identifier (Dept Code)</label>
                <input 
                  required
                  style={inputStyle} 
                  placeholder="e.g. CARD-101" 
                  value={formData.dept_code}
                  onChange={(e) => setFormData({...formData, dept_code: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Physical Location / Floor</label>
                <input 
                  style={inputStyle} 
                  placeholder="e.g. Floor 2, Wing B" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Unit Classification</label>
                <select 
                  style={inputStyle}
                  value={formData.dept_type}
                  onChange={(e) => setFormData({...formData, dept_type: e.target.value})}
                >
                  <option value="Clinical">Clinical</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Diagnostic">Diagnostic</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
    <div style={{ ...inputGroup, flex: 1 }}>
      <label style={labelStyle}>Physical Location</label>
      <input 
        style={inputStyle} 
        placeholder="e.g. Wing B" 
        value={formData.location}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
      />
    </div>
    <div style={{ ...inputGroup, flex: 1 }}>
      <label style={labelStyle}>Extension</label>
      <input 
        style={inputStyle} 
        placeholder="e.g. Ext 402" 
        value={formData.contact_number}
        onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
      />
    </div>
  </div>

{/* ROW 4: DEPENDENT LEADERSHIP SELECTION */}
<div style={{ display: 'flex', gap: '16px' }}>
  
  {/* Field A: Select Category/Role */}
  <div style={{ ...inputGroup, flex: 1 }}>
    <label style={labelStyle}>Select Leadership Role</label>
    <select 
      style={inputStyle}
      value={selectedRoleFilter}
      onChange={(e) => handleRoleChange(e.target.value)}
    >
      <option value="">-- Choose Role --</option>
      <option value="Doctor">Doctors</option>
      <option value="Nurse">Nurses</option>
      <option value="Lab Technician">Lab Technicians</option>
      <option value="Receptionist">Admin/Reception</option>
    </select>
  </div>

  {/* Field B: Select Specific Staff (Filtered by Field A) */}
  <div style={{ ...inputGroup, flex: 1 }}>
    <label style={labelStyle}>Staff Name</label>
    <select 
      style={{
        ...inputStyle,
        opacity: selectedRoleFilter ? 1 : 0.6,
        cursor: selectedRoleFilter ? 'pointer' : 'not-allowed'
      }}
      disabled={!selectedRoleFilter}
      value={formData.head_of_dept}
      onChange={(e) => setFormData({...formData, head_of_dept: e.target.value})}
    >
      <option value="">
        {selectedRoleFilter ? `-- Select ${selectedRoleFilter} --` : "First pick a role ↑"}
      </option>
      
      {/* Dynamic Filtering Logic */}
      {staff
        .filter(s => s.role === selectedRoleFilter)
        .map(s => (
          <option key={s.id} value={s.full_name}>
            {selectedRoleFilter === "Doctor" ? `Dr. ${s.full_name}` : s.full_name}
          </option>
        ))
      }
    </select>
  </div>
</div>

  {/* ROW 5: Description */}
  <div style={inputGroup}>
    <label style={labelStyle}>Infrastructure Notes</label>
    <textarea 
      style={{ ...inputStyle, minHeight: "80px", resize: "none", paddingTop: "12px" }} 
      placeholder="Operational scope or unit notes..." 
      value={formData.description}
      onChange={(e) => setFormData({...formData, description: e.target.value})}
    />
  </div>

  <button type="submit" style={submitBtn}>
    <Activity size={18} /> INITIALIZE UNIT
  </button>
</form>
            
          </div>
        </div>
      )}
    </div>
  );
};

// ================== STYLES ==================
const container = { padding: "40px", background: "#f8fafc", minHeight: "100vh" };
const headerSection = { marginBottom: "32px" };
const breadcrumb = { fontSize: "11px", fontWeight: "900", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "8px" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const mainTitle = { fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0 };
const subTitle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", color: "#64748b", marginTop: "8px" };
const statusDot = { width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" };

const metricsGrid = { display: "flex", gap: "20px", marginBottom: "32px" };
const metricCard = { flex: 1, background: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" };
const metricLabel = { fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "0.05em" };
const metricValue = { fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "8px" };

const addBtn = { background: "#10b981", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "14px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" };

const registryContainer = { background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden" };
const searchWrapper = { padding: "20px", display: "flex", alignItems: "center", borderBottom: "1px solid #f1f5f9", gap: "12px" };
const searchIcon = { color: "#94a3b8" };
const searchInput = { border: "none", outline: "none", width: "100%", fontSize: "15px", fontWeight: "600", color: "#1e293b" };

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" };
const thRight = { ...th, textAlign: "right" };
const td = { padding: "20px 24px", borderBottom: "1px solid #f8fafc" };
const tdRight = { ...td, textAlign: "right" };
const tableRow = { transition: "0.2s" };

const nodeInfo = { display: "flex", alignItems: "center", gap: "16px" };
const iconBox = { padding: "8px", borderRadius: "10px", background: "#f0fdf4" };
const deptNameText = { fontSize: "15px", fontWeight: "800", color: "#0f172a" };
const locationText = { fontSize: "12px", fontWeight: "700", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" };
const capacityText = { fontSize: "14px", fontWeight: "700", color: "#475569" };

const statusWrapper = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: "#10b981" };
const activeDot = { width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" };

const actionGroup = { display: "flex", justifyContent: "flex-end", gap: "8px" };
const editBtn = { padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#10b981", cursor: "pointer" };
const deleteBtn = { padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", cursor: "pointer" };

const tableHeaderRow = { borderBottom: "1px solid #f1f5f9", background: "#fcfcfc" };

// --- MODAL STYLES ---
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContent = { background: "#fff", width: "550px", borderRadius: "32px", padding: "40px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" };
const closeBtn = { background: "none", border: "none", cursor: "pointer", color: "#94a3b8" };
const formLayout = { display: "flex", flexDirection: "column", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "11px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { padding: "14px", borderRadius: "14px", border: "2.5px solid #f1f5f9", fontSize: "15px", fontWeight: "700", color: "#0f172a", outline: "none", transition: "0.2s" };
const submitBtn = { ...addBtn, width: "100%", justifyContent: "center", padding: "16px", marginTop: "10px", fontSize: "14px" };

export default DeptNodes;