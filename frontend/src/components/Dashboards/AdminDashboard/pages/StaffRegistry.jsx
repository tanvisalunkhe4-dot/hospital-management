import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Users, LayoutGrid, Settings, Shield, Activity, 
  X, Edit, Trash2, UserPlus, Search, TrendingUp, AlertCircle,
  Save, Plus, MapPin, Phone, Briefcase, Clock, CheckCircle2, 
  GraduationCap, CreditCard, BarChart3, 
  User, Mail, Hash, Award, Calendar 
} from 'lucide-react';

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const FormField = ({ label, icon: Icon, children }) => (
  <div style={formSection}>
    <label style={labelStyle}>{label}</label>
    <div style={inputWithIcon}>
      <Icon size={16} color="#94a3b8" />
      {children}
    </div>
  </div>
);

const StaffAnalytics = ({ staff, depts }) => {
  const roleData = useMemo(() => {
    const counts = staff.reduce((acc, curr) => {
      const role = curr.role || 'Other';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [staff]);

  const deptData = useMemo(() => {
    return depts.map(d => ({
      name: d.name,
      count: staff.filter(s => parseInt(s.dept_id) === d.id || s.department === d.name).length
    })).filter(d => d.count > 0);
  }, [staff, depts]);

  const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
      <div style={analyticsCard}>
        <div style={analyticsTitle}>
          <Users size={16} color="#10b981" /> Personnel Distribution
        </div>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={analyticsCard}>
        <div style={analyticsTitle}>
          <BarChart3 size={16} color="#3b82f6" /> Departmental Load
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: '600'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: '600'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
const BASE_URL = "http://localhost:8000/api/v1/admin";const StaffFormModal = ({ isOpen, onClose, onSave, initialData, depts = [] }) => {    const initialFormState = {
    full_name: "", email: "", phone: "", role: "Doctor",
    department: "", qualification: "", experience: "",
    shift_type: "Day", salary: "", joining_date: new Date().toISOString().split('T')[0], 
    status: "Active", license_no: "", specialization: "", ward_no: "", is_hod: false
  };

  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData && isOpen) {
      // Map existing member data to your form's state structure
      setFormData({
        id: initialData.id,
        full_name: initialData.full_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role || "Doctor",
        // Convert dept_id to string so it matches the <select> value
        department: initialData.dept_id ? initialData.dept_id.toString() : "",
        qualification: initialData.qualification || "",
        experience: initialData.experience || "",
        shift_type: initialData.shift_type || "Day",
        salary: initialData.salary || "",
        is_hod: !!initialData.is_hod,
        license_no: initialData.license_no || "",
        ward_no: initialData.ward_no || "",
        specialization: initialData.specialization || ""
      });
    } else if (!initialData && isOpen) {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

 

  return (
    <div style={modalOverlay}>
      <div style={modalContainer}>
        {/* FIXED HEADER */}
        <div style={modalHeader}>
          <div style={headerTextGroup}>
            <div style={breadcrumbText}>Infrastructure / Deployment</div>
            <h2 style={modalTitle}>{initialData ? "Modify Personnel" : "Register New Personnel"}</h2>
            <p style={modalSubtitle}>Assign roles and clinical privileges to the system</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div style={formScrollContainer}>
        <form 
  id="staff-form" 
  onSubmit={(e) => { 
    e.preventDefault();
    onSave(formData); // Use the prop name 'onSave'
  }} 
  style={formLayout}
>
            <div style={sectionDivider}>Core Identity</div>
            <div style={rowGrid}>
              <FormField label="Full Name" icon={User}>
                <input style={nakedInput} placeholder="e.g. Dr. Arpit Sharma" value={formData.full_name || ""} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
              </FormField>
              <FormField label="Email Address" icon={Mail}>
                <input type="email" style={nakedInput} placeholder="name@nexhealth.com" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </FormField>
            </div>

            <div style={rowGrid}>
              <FormField label="Contact Number" icon={Phone}>
                <input style={nakedInput} placeholder="+91 00000 00000" value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </FormField>
              <FormField label="Designation" icon={Shield}>
              <select style={selectStyle} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Doctor">Doctor (Clinical)</option>
                  <option value="Nurse">Nurse (Care)</option>
                  <option value="Staff">Staff (Operations)</option>
                  <option value="Receptionist">Receptionist (Management)</option>
                  <option value="Lab Technician">Lab Technician (Clinical)</option>
                  <option value="Pharmacist">Pharmacist (Management)</option>
                </select>
              </FormField>
            </div>

            <div style={sectionDivider}>{formData.role} Specific Details</div>
            <div style={rowGrid}>
            <FormField label="Department" icon={Briefcase}>
  <select 
  style={selectStyle} 
  value={formData.department || ""} // Uses the string-mapped dept_id from the useEffect above
  onChange={(e) => setFormData({...formData, department: e.target.value})}
  required
>
  <option value="" disabled>Select Infrastructure Node</option>
  {depts.map((d) => (
    // Ensure the value is a string so the select component can track it correctly
    <option key={d.id} value={d.id.toString()}>
      {d.name} ({d.dept_code})
    </option>
  ))}
</select>
</FormField>
              
              {formData.role === "Doctor" && (
                <FormField label="License Number" icon={Hash}>
                  <input style={nakedInput} placeholder="MCI-12345" value={formData.license_no || ""} onChange={(e) => setFormData({...formData, license_no: e.target.value})} required />
                </FormField>
              )}
              {formData.role === "Nurse" && (
                <FormField label="Assigned Ward" icon={MapPin}>
                  <input style={nakedInput} placeholder="Ward 4B" value={formData.ward_no ||""} onChange={(e) => setFormData({...formData, ward_no: e.target.value})} />
                </FormField>
              )}
            </div>

            <div style={rowGrid}>
              <FormField label="Qualification" icon={Award}>
              <input 
  style={nakedInput} 
  placeholder="e.g. MBBS, MD" 
  value={formData.qualification || ""} // Fallback ensures it stays controlled
  onChange={(e) => setFormData({...formData, qualification: e.target.value})} 
/>
              </FormField>
              <FormField label="Experience" icon={Clock}>
                <input type="number" style={nakedInput} placeholder="Years" value={formData.experience ||""} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
              </FormField>
            </div>

            <div style={sectionDivider}>Administration</div>
            <div style={rowGrid}>
              <FormField label="Shift" icon={Calendar}>
                <select style={selectStyle} value={formData.shift_type ||""} onChange={(e) => setFormData({...formData, shift_type: e.target.value})}>
                  <option>Day</option>
                  <option>Night</option>
                </select>
              </FormField>
              <FormField label="Monthly Salary" icon={CreditCard}>
                <input type="number" style={nakedInput} placeholder="Amount in ₹" value={formData.salary ||""} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
              </FormField>
            </div>

            <div style={checkboxWrapper}>
              <input type="checkbox" id="hod" checked={formData.is_hod} onChange={(e) => setFormData({...formData, is_hod: e.target.checked})} />
              <label htmlFor="hod" style={checkboxLabel}>Designate as Head of Department (HOD)</label>
            </div>
            <div style={modalFooter}>
  <button 
    type="submit" // This is the ONLY thing the button needs
    style={submitBtn}
  >
    <Save size={18} /> {initialData ? "Update Infrastructure Node" : "Deploy Personnel Node"}
  </button>
</div>
          </form>

          
        </div>
        </div>

        
      </div>
    
  );
};

// ================== MAIN REGISTRY COMPONENT ==================
const StaffRegistry = ({ 
  depts = [],    
  staff = [], // This now comes directly from AdminDashboard
  searchTerm,
  setSearchTerm,
  handleEdit,
  handleDelete,
  onRefresh // Use this to trigger a reload in the parent after a save
}) => {
  const [notification, setNotification] = useState({ message: '', type: '' });

   const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [logs, setLogs] = useState([{ tag: 'SYS', text: 'Registry Initialized', id: 1 }]);

  const addLog = (tag, text) => {
    setLogs(prev => [{ tag, text, id: Date.now() }, ...prev].slice(0, 5));
  };

  const getRoleTheme = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return { bg: '#eff6ff', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.1)' }; // Blue
      case 'nurse': return { bg: '#faf5ff', text: '#a855f7', border: 'rgba(168, 85, 247, 0.1)' }; // Purple
      default: return { bg: '#f0fdf4', text: '#10b981', border: 'rgba(16, 185, 129, 0.1)' }; // Green
    }
  };
  

  const onSaveStaff = async (formData) => {
    const storedId = sessionStorage.getItem("hospital_id");
    const currentHospitalId = storedId ? parseInt(storedId) : null;    

    if (!currentHospitalId) {
      setNotification({ 
          message: 'System Error: Hospital ID missing. Please re-login.', 
          type: 'error' 
      });
      addLog('ERR', 'Hospital ID is Null');
      return;
  }
    try {
        const { id, department, staff_id, ...cleanData } = formData;

        // Base payload for both Add and Edit
        const payload = {
          ...cleanData,
          salary: formData.salary !== "" ? parseInt(formData.salary) : 0,
          experience: formData.experience !== "" ? parseInt(formData.experience) : 0,
          dept_id: formData.department ? parseInt(formData.department) : null,
          // Only send these if the role is Doctor, otherwise set to null
          license_no: formData.role === "Doctor" ? (formData.license_no || "") : null,
          specialization: formData.role === "Doctor" ? (formData.specialization || "") : null,
          ward_no: formData.role === "Nurse" ? (formData.ward_no || "") : null,
          is_hod: !!formData.is_hod,
          status: formData.status || "Active"
      };
        if (id) {
            // EDIT MODE: Use Query Parameter as requested by your 422 error
            await axios.put(
                `${BASE_URL}/staff/${id}?hospital_id=${currentHospitalId}`, 
                payload
            );
            addLog('UPD', `Node ${id} synchronized`);
        } else {
            // REGISTRATION MODE: 
            // Usually, POST requests keep hospital_id in the body.
            // If POST also gives a 422, move hospital_id to the URL here too.
            const registrationPayload = {
                ...payload,
                hospital_id: parseInt(currentHospitalId), // Keep in body for Registration
                password: "DefaultPassword123!" 
            };

            await axios.post(`${BASE_URL}/staff/register`, registrationPayload);
            addLog('NEW', 'New personnel node deployed');
        }

        setIsModalOpen(false); 
        if (onRefresh) onRefresh();
        setNotification({ message: 'Success!', type: 'success' });

    } catch (error) {
        console.error("Sync Error:", error.response?.data);
        addLog('ERR', 'Operation Failed');
        setNotification({ message: 'Error: Check system logs', type: 'error' });
    }
};
  const filteredStaff = staff.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    
    <div style={container}>
      <header style={headerWrapper}>
        <div style={titleArea}>
          <div style={breadcrumb}>Management / Personnel</div>
          <h1 style={mainTitle}>Staff Infrastructure</h1>
          <p style={statusSummary}><span style={pulseDot}></span>{staff.length} Active Nodes Registered</p>
        </div>
        <div style={actionArea}>
          <button onClick={() => { setEditingMember(null); setIsModalOpen(true); }} style={primaryActionBtn}>
            <UserPlus size={18} /> Register Staff
          </button>
        </div>
      </header>

     {/* 1. Statistics Row */}
     <div style={statsRow}>
        <div style={statCard}>
          <span style={statLabel}>Network Capacity</span>
          <div style={statValue}>{staff.length} Units</div>
          <span style={statIndicatorActive}></span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Access Level</span>
          <div style={statValue}>Master Admin</div>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Registry Status</span>
          <div style={{...statValue, color: "#10b981"}}>Stable</div>
        </div>
      </div>

      {/* 2. Main Content (Table & Audit) */}
      <div style={{...mainContentLayout, marginBottom: '32px'}}>
        <div style={registryWrapper}>
          <div style={filterBar}>
            <div style={searchContainer}>
              <Search size={16} color="#94a3b8" />
              <input style={searchInput} placeholder="Filter nodes by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                <th style={thStyle}>Personnel Node</th>
                <th style={thStyle}>HFR Identifier</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={nameText}>{member.full_name}</div>
                    <div style={subText}><Mail size={12} /> {member.email}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={hfrBadge}>{member.role?.toUpperCase().slice(0, 3)}-{member.id || "NEW"}</span>
                  </td>
                  <td style={tdStyle}><div style={statusWrapper}><span style={statusDot}></span>Connected</div></td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={actionGroup}>
                      <button style={editIconBtn} onClick={() => { setEditingMember(member); setIsModalOpen(true); }}><Edit size={16} /></button>
                      <button style={deleteIconBtn} onClick={() => handleDelete(member.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={auditCard}>
          <div style={auditHeader}><Activity size={16} color="#10b981" /><span style={auditTitle}>System Audit Trail</span></div>
          <div style={auditList}>
            {logs.map(log => (
              <div key={log.id} style={auditItem}>
                <span style={log.tag === 'ERR' ? auditTagSys : auditTagSync}>{log.tag}</span>
                <span style={auditText}>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Analytics Section (Now at the bottom) */}
      
{staff.length > 0 && (
    <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
        <h2 style={{...modalTitle, fontSize: '20px', marginBottom: '24px'}}>Infrastructure Analytics</h2>
        <StaffAnalytics staff={staff} depts={depts} />
    </div>
)}
      {notification.message && (
  <div style={{
    ...notificationBanner,
    backgroundColor: notification.type === 'success' ? '#f0fdf4' : '#fff1f2',
    color: notification.type === 'success' ? '#166534' : '#991b1b',
    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span style={{ fontWeight: '600', fontSize: '14px' }}>{notification.message}</span>
    </div>
    <button onClick={() => setNotification({ message: '', type: '' })} style={closeNotificationBtn}>
      <X size={16} />
    </button>
  </div>
)}
      <StaffFormModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  onSave={onSaveStaff} // Ensure this matches the prop name in the modal
  initialData={editingMember} 
  depts={depts}
/>
    </div>
  );
};

// ================== ALL STYLES  ==================
const container = { 
  padding: "40px", 
  backgroundColor: "#f8fafc", 
  minHeight: "100vh",
  fontFamily: "'Inter', system-ui, sans-serif" 
};

const headerWrapper = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "flex-end", 
  paddingBottom: "32px", 
  borderBottom: "1px solid #e2e8f0", 
  marginBottom: "32px" 
};

const titleArea = { display: "flex", flexDirection: "column", gap: "6px" };
const breadcrumb = { 
  fontSize: "11px", 
  fontWeight: "700", 
  color: "#94a3b8", 
  letterSpacing: "0.05em",
  textTransform: "uppercase" 
};

const mainTitle = { 
  fontSize: "32px", 
  fontWeight: "800", 
  color: "#0f172a", 
  margin: 0,
  letterSpacing: "-0.02em" 
};

const statusSummary = { 
  display: "flex", 
  alignItems: "center", 
  gap: "8px", 
  fontSize: "14px", 
  color: "#64748b",
  marginTop: "4px"
};

const pulseDot = { 
  width: "8px", 
  height: "8px", 
  backgroundColor: "#10b981", 
  borderRadius: "50%",
  boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)"
};

const actionArea = { display: "flex", alignItems: "center" };

const primaryActionBtn = { 
  backgroundColor: "#10b981", 
  color: "#fff", 
  border: "none", 
  padding: "12px 24px", 
  borderRadius: "12px", 
  display: "flex", 
  alignItems: "center", 
  gap: "10px", 
  fontWeight: "700", 
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
};

// ================== STATISTICS ROW ==================
const statsRow = { 
  display: "grid", 
  gridTemplateColumns: "repeat(3, 1fr)", 
  gap: "24px", 
  marginBottom: "32px" 
};

const statCard = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "20px", 
  border: "1px solid #e2e8f0", 
  position: "relative",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
};

const statLabel = { 
  fontSize: "12px", 
  color: "#94a3b8", 
  fontWeight: "700", 
  textTransform: "uppercase",
  letterSpacing: "0.025em" 
};

const statValue = { 
  fontSize: "32px", 
  fontWeight: "800", 
  color: "#1e293b", 
  marginTop: "8px" 
};

const statIndicatorActive = { 
  position: "absolute", 
  top: "24px", 
  right: "24px", 
  width: "8px", 
  height: "8px", 
  background: "#10b981", 
  borderRadius: "50%" 
};

// ================== MAIN CONTENT & REGISTRY ==================
const mainContentLayout = { 
  display: "grid", 
  gridTemplateColumns: "1fr 340px", 
  gap: "24px",
  alignItems: "start"
};

const registryWrapper = { 
  background: "#fff", 
  borderRadius: "20px", 
  border: "1px solid #e2e8f0", 
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
};

const filterBar = { 
  padding: "24px", 
  borderBottom: "1px solid #f1f5f9",
  background: "#fff"
};

const searchContainer = { 
  display: "flex", 
  alignItems: "center", 
  gap: "12px", 
  background: "#f8fafc", 
  padding: "12px 16px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0",
  transition: "border-color 0.2s ease"
};

const searchInput = { 
  border: "none", 
  background: "transparent", 
  outline: "none", 
  width: "100%",
  fontSize: "14px",
  color: "#1e293b" 
};

// ================== DATA TABLE STYLES ==================
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadRow = { background: "#f8fafc" };
const thStyle = { 
  textAlign: "left", 
  padding: "16px 24px", 
  fontSize: "11px", 
  color: "#94a3b8", 
  textTransform: "uppercase", 
  fontWeight: "800",
  letterSpacing: "0.05em"
};

const trStyle = { 
  borderBottom: "1px solid #f1f5f9",
  transition: "background-color 0.2s ease",
  cursor: "default"
};

const tdStyle = { padding: "18px 24px", verticalAlign: "middle" };
const nameText = { fontWeight: "700", color: "#1e293b", fontSize: "15px" };
const subText = { 
  fontSize: "13px", 
  color: "#94a3b8", 
  marginTop: "4px", 
  display: "flex", 
  alignItems: "center", 
  gap: "6px" 
};

const hfrBadge = { 
  background: "#f0fdf4", 
  color: "#10b981", 
  padding: "6px 12px", 
  borderRadius: "8px", 
  fontSize: "11px", 
  fontWeight: "800",
  border: "1px solid rgba(16, 185, 129, 0.1)",
  letterSpacing: "0.025em"
};

const statusWrapper = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" };
const statusDot = { width: "6px", height: "6px", background: "#10b981", borderRadius: "50%",boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" };

const actionGroup = { display: "flex", gap: "8px", justifyContent: "flex-end" };
const editIconBtn = { 
  background: "#f0fdf4", 
  border: "none", 
  padding: "10px", 
  borderRadius: "10px", 
  color: "#10b981", 
  cursor: "pointer",
  transition: "transform 0.1s ease"
};
const deleteIconBtn = { 
  background: "#fff1f2", 
  border: "none", 
  padding: "10px", 
  borderRadius: "10px", 
  color: "#f43f5e", 
  cursor: "pointer",
  transition: "transform 0.1s ease"
};

// ================== MODAL & FORM STYLES ==================
const modalOverlay = { 
  position: "fixed", 
  top: 0, left: 0, right: 0, bottom: 0, 
  backgroundColor: "rgba(15, 23, 42, 0.8)", 
  backdropFilter: "blur(12px)", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  zIndex: 2000 
};

const modalContainer = { 
  background: "#fff", 
  width: "100%", 
  maxWidth: "680px", 
  maxHeight: "85vh", 
  borderRadius: "32px", 
  display: "flex", 
  flexDirection: "column", 
  overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const modalHeader = { 
  padding: "32px 40px", 
  borderBottom: "1px solid #f1f5f9", 
  display: "flex", 
  justifyContent: "space-between",
  alignItems: "center"
};

const headerTextGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const breadcrumbText = { 
  fontSize: "10px", 
  fontWeight: "900", 
  color: "#10b981", 
  textTransform: "uppercase",
  letterSpacing: "0.1em"
};

const modalTitle = { fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0 };
const modalSubtitle = { fontSize: "14px", color: "#64748b", marginTop: "4px" };
const closeBtn = { 
  background: "#f8fafc", 
  border: "1px solid #e2e8f0", 
  color: "#94a3b8", 
  cursor: "pointer",
  padding: "8px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const formScrollContainer = { 
  padding: "32px 40px", 
  overflowY: "auto", 
  flex: 1,
  scrollbarWidth: "thin",
  scrollbarColor: "#e2e8f0 transparent"
};

const formLayout = { display: "flex", flexDirection: "column", gap: "28px" };

const sectionDivider = { 
  fontSize: "11px", 
  fontWeight: "900", 
  color: "#94a3b8", 
  textTransform: "uppercase", 
  borderBottom: "1px solid #f1f5f9", 
  paddingBottom: "10px", 
  marginTop: "12px",
  letterSpacing: "0.05em"
};

const rowGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" };
const formSection = { display: "flex", flexDirection: "column", gap: "10px" };
const labelStyle = { fontSize: "13px", fontWeight: "700", color: "#475569" };

const inputWithIcon = { 
  display: "flex", 
  alignItems: "center", 
  gap: "14px", 
  background: "#f8fafc", 
  border: "1px solid #e2e8f0", 
  padding: "14px 18px", 
  borderRadius: "14px",
  transition: "all 0.2s ease"
};

const nakedInput = { 
  border: "none", 
  background: "transparent", 
  outline: "none", 
  fontSize: "15px", 
  width: "100%", 
  color: "#1e293b",
  fontWeight: "500"
};

const selectStyle = { ...nakedInput, cursor: "pointer", appearance: "none" };

const checkboxWrapper = { 
  display: "flex", 
  alignItems: "center", 
  gap: "12px", 
  background: "#f0fdf4", 
  padding: "20px", 
  borderRadius: "16px",
  border: "1px solid rgba(16, 185, 129, 0.1)"
};

const checkboxLabel = { fontSize: "14px", fontWeight: "600", color: "#166534" };

const modalFooter = { 
  padding: "24px 40px", 
  borderTop: "1px solid #f1f5f9", 
  background: "#fff" 
};

const submitBtn = { 
  width: "100%", 
  background: "#10b981", 
  color: "#fff", 
  border: "none", 
  padding: "18px", 
  borderRadius: "18px", 
  fontWeight: "800", 
  cursor: "pointer", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  gap: "12px", 
  fontSize: "16px",
  boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.4)",
  transition: "transform 0.2s ease, background-color 0.2s ease"
};

// ================== AUDIT & SIDEBAR CARDS ==================
const auditCard = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "20px", 
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
};

const auditHeader = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" };
const auditTitle = { fontWeight: "800", fontSize: "14px", textTransform: "uppercase", color: "#1e293b" };
const auditList = { display: "flex", flexDirection: "column", gap: "18px" };

const auditItem = { 
  display: "flex", 
  gap: "12px", 
  fontSize: "12px", 
  alignItems: "flex-start",
  lineHeight: "1.5"
};

const auditTagSync = { 
  background: "#f0fdf4", 
  color: "#10b981", 
  padding: "2px 8px", 
  borderRadius: "6px", 
  fontWeight: "900",
  fontSize: "10px"
};

const auditTagSys = { 
  background: "#eff6ff", 
  color: "#3b82f6", 
  padding: "2px 8px", 
  borderRadius: "6px", 
  fontWeight: "900",
  fontSize: "10px"
};

const auditText = { color: "#475569", fontWeight: "500" };

const notificationBanner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  borderRadius: "12px",
  marginBottom: "24px",
  animation: "slideDown 0.3s ease-out",
};

const analyticsCard = { background: "#fff", padding: "28px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" };
const analyticsTitle = { fontSize: "12px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" };
const closeNotificationBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "inherit",
  opacity: 0.6,
  display: "flex",
  alignItems: "center"
};
export default StaffRegistry;