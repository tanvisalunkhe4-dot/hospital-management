import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, LayoutGrid, Settings, Shield, Activity, 
  X, Edit, Trash2, UserPlus, Search, 
  Save, Plus, MapPin, Phone, Briefcase, 
  GraduationCap, CreditCard 
} from 'lucide-react';

const AdminDashboard = () => {

  const hospitalId = localStorage.getItem('hospital_id') || 1; 

  const initialFormState = { 
    full_name: '', email: '', password: '', role: 'Doctor', 
    dept_id: '', hospital_id: hospitalId,
    salary: '', qualification: '', specialization: '', license_no: '',
    shift_type: 'Day', ward_no: '', is_hod: false
  };
  const [activeTab, setActiveTab] = useState('Staff');
  const [staff, setStaff] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const roleBadgeStyle = (role) => {
  const isDoctor = role === 'Doctor';
  const isNurse = role === 'Nurse';}
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptFormData, setDeptFormData] = useState({
    name: '', dept_code: '', location: '', 
    contact_number: '', dept_type: 'Clinical', hospital_id: hospitalId
  });


  const roleBadgeStyleFn = (role) => {
    const isDoctor = role === 'Doctor';
    const isNurse = role === 'Nurse';
    return {
      background: isDoctor ? '#ecfdf5' : isNurse ? '#eff6ff' : '#f8fafc',
      color: isDoctor ? '#059669' : isNurse ? '#2563eb' : '#64748b',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '800',
      border: `1px solid ${isDoctor ? '#10b981' : isNurse ? '#3b82f6' : '#e2e8f0'}`
    };
  };

  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    role: 'Doctor', 
    dept_id: '',
    hospital_id: hospitalId,
    salary: '',
    qualification: '',
    specialization: '', 
    license_no: '',
    shift_type: 'Day',
    ward_no: '',
    is_hod: false
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/admin/staff/${hospitalId}`),
        axios.get(`http://localhost:8000/api/v1/admin/departments/${hospitalId}`)
      ]);
      setStaff(staffRes.data);
      setDepts(deptRes.data);
    } catch (err) {
      console.error("Data fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hospitalId]);

  // --- FORM HANDLERS ---
  
  
  
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Move 'name' and 'hospital_id' to params because the backend expects 'query'
      const response = await axios.post(
        `http://localhost:8000/api/v1/admin/departments`, 
        {
          // This is the BODY (for location, dept_code, etc.)
          dept_code: deptFormData.dept_code,
          location: deptFormData.location,
          contact_number: deptFormData.contact_number,
          dept_type: deptFormData.dept_type.split(' ')[0]
        },
        {
          // This is the QUERY (what the error 'loc: ["query", "..."]' is asking for)
          params: {
            name: deptFormData.name,
            hospital_id: parseInt(hospitalId)
          }
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        setIsDeptModalOpen(false);
        setDeptFormData({ 
          name: '', dept_code: '', location: '', 
          contact_number: '', dept_type: 'Clinical', 
          hospital_id: hospitalId 
        });
        fetchData(); 
        alert("✅ Department Node Deployed!");
      }
    } catch (err) {
      console.error("New Error Check:", err.response?.data);
      alert("Check console if it fails again.");
    }
  };
  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      
      setFormData({
        ...initialFormState,
        full_name: member.full_name || "",
        email: member.email || "",
        role: member.role || "Doctor",
        dept_id: member.dept_id || member.department?.id || "",

        // Qualification & Salary (Checks multiple sources)
        qualification: member.qualification || member.doctor?.qualification || "",
        salary: member.salary || member.doctor?.salary || "",

        // Medical Credentials (Handles nesting from FastAPI/PostgreSQL)
        license_no: member.license_no || member.doctor?.license_no || member.doctor?.mci_license || "",
        specialization: member.specialization || member.doctor?.specialization || "",
        
        // Nurse Specific
        shift_type: member.shift_type || member.nurse?.shift_type || "Day",
        ward_no: member.ward_no || member.nurse?.ward_no || "",
        
        is_hod: member.is_hod || member.doctor?.is_hod || false,
      });
    } else {
      setEditingMember(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };
  const StaffCard = ({ member, onUpdate, onDelete, roleBadgeStyleFn }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState({
      ...member,
      license_no: member.doctor?.license_no || member.license_no || '',
      specialization: member.doctor?.specialization || member.specialization || '',
      qualification: member.qualification || member.doctor?.qualification || '',
      salary: member.salary || member.doctor?.salary || ''
    });
  
    const handleSave = () => {
      onUpdate(localData);
      setIsEditing(false);
    };
  
    return (
      <div style={expandedCardStyle}>
        {/* CARD HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={avatarStyle}>{member.full_name[0]}</div>
            <div>
              {isEditing ? (
                <input style={nakedInput} value={localData.full_name} onChange={(e) => setLocalData({...localData, full_name: e.target.value})} />
              ) : (
                <h3 style={{ margin: 0 }}>{member.full_name}</h3>
              )}
              <span style={roleBadgeStyleFn(member.role)}>{member.role}</span>
            </div>
          </div>
          <div style={actionContainerStyle}>
            {isEditing ? (
              <button onClick={handleSave} style={saveIconStyle}><Save size={16} /></button>
            ) : (
              <button onClick={() => setIsEditing(true)} style={editButtonStyle}><Edit size={16} /></button>
            )}
            <button onClick={() => onDelete(member.id)} style={deleteButtonStyle}><Trash2 size={16} /></button>
          </div>
        </div>
  
        <hr style={dividerStyle} />
  
        {/* EXPANDED INFO SECTION */}
        <div style={infoGridStyle}>
          <div style={infoBlock}>
            <label style={labelStyle}>Employment Profile</label>
            <div style={dataRow}><GraduationCap size={14}/> 
              {isEditing ? <input value={localData.qualification} onChange={(e) => setLocalData({...localData, qualification: e.target.value})} /> : (member.qualification || 'N/A')}
            </div>
            <div style={dataRow}><CreditCard size={14}/> 
              {isEditing ? <input type="number" value={localData.salary} onChange={(e) => setLocalData({...localData, salary: e.target.value})} /> : `₹${member.salary || 0}`}
            </div>
          </div>
  
          {member.role === 'Doctor' && (
            <div style={infoBlock}>
              <label style={labelStyle}>Medical Credentials</label>
              <div style={dataRow}><Shield size={14}/> {member.doctor?.license_no || member.license_no || 'No License'}</div>
              <div style={dataRow}><Activity size={14}/> {member.doctor?.specialization || member.specialization || 'General'}</div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const handleAssignDoctor = async (staffId, deptId) => {
    try {
      // Note: We parseInt here because the backend expects an integer for IDs
      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/staff/${staffId}`, 
        { dept_id: parseInt(deptId) } 
      );
  
      if (response.status === 200) {
        fetchData(); // This refreshes the staff list, updating the card UI immediately
        alert("Staff Node Relocated successfully.");
      }
    } catch (error) {
      console.error("Assignment error", error);
      alert("Check the console: Ensure your PUT endpoint accepts 'dept_id'");
    }
  };
  const handleEdit = (member) => {
    setEditingMember(member);
    
    setFormData({
      // 1. Identity & Access (Matches top-level keys)
      full_name: member.full_name || "",
      email: member.email || "",
      role: member.role || "Doctor",
      dept_id: member.dept_id || member.department?.id || "",
      hospital_id: hospitalId,
  
      // 2. Employment Profile (Checks top-level and doctor/nurse sub-objects)
      qualification: member.qualification || member.doctor?.qualification || "",
      salary: member.salary || member.doctor?.salary || member.nurse?.salary || "",
  
      // 3. Medical Credentials (Specific to Doctors)
      license_no: member.doctor?.license_no || member.license_no || "",
      specialization: member.doctor?.specialization || member.specialization || "",
      is_hod: member.doctor?.is_hod || member.is_hod || false,
  
      // 4. Nursing Assignment (Specific to Nurses)
      shift_type: member.nurse?.shift_type || member.shift_type || "Day",
      ward_no: member.nurse?.ward_no || member.ward_no || ""
    });
  
    setIsModalOpen(true);
  };
const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to decommission this staff node?")) {
      try {
        const response = await axios.delete(`http://localhost:8000/api/v1/admin/staff/${id}`);
        if (response.status === 200) {
          fetchData(); // FIXED: Changed from fetchStaffList
          console.log("Node Decommissioned");
        }
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingMember;
    
    // Ensure numeric values for the backend
    const payload = {
      ...formData,
      hospital_id: parseInt(hospitalId),
      salary: formData.salary ? parseInt(formData.salary) : 0,
      dept_id: formData.dept_id ? parseInt(formData.dept_id) : null
    };
  
    const url = isEditing 
      ? `http://localhost:8000/api/v1/admin/staff/${editingMember.id}` 
      : 'http://localhost:8000/api/v1/admin/staff/register';
    
    try {
      const response = await axios({
        method: isEditing ? 'PUT' : 'POST',
        url: url,
        data: payload // Use the cleaned payload here
      });
  
      if (response.status === 200 || response.status === 201) {
        setIsModalOpen(false);
        setEditingMember(null);
        setFormData(initialFormState);
        fetchData();
        alert(isEditing ? "Node Updated" : "Node Registered");
      }
    } catch (error) {
      console.error("Submission error", error.response?.data);
      alert("Check console: Schema validation failed.");
    }
  };
const filteredStaff = staff.filter((member) => {
  const search = searchTerm.toLowerCase();
  return (
    (member.full_name?.toLowerCase() || "").includes(search) ||
    (member.role?.toLowerCase() || "").includes(search) ||
    (member.email?.toLowerCase() || "").includes(search)
  );
});
  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={brandStyle}>
          Nex<span style={{ color: '#10b981' }}>Health</span>
          <div style={badgeStyle}>ADMIN CONTROL</div>
        </div>
        <nav style={navStyle}>
          <NavItem icon={<Users size={18} />} label="Staff Registry" active={activeTab === 'Staff'} onClick={() => setActiveTab('Staff')} />
          <NavItem icon={<LayoutGrid size={18} />} label="Department Nodes" active={activeTab === 'Depts'} onClick={() => setActiveTab('Depts')} />
          <NavItem icon={<Settings size={18} />} label="System Config" active={activeTab === 'Config'} onClick={() => setActiveTab('Config')} />
          <NavItem icon={<Shield size={18} />} label="Security" active={activeTab === 'Security'} onClick={() => setActiveTab('Security')} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>{activeTab} Management</h1>
            <p style={subtitleStyle}>System Node: HFR-{hospitalId}-SYS</p>
          </div>
          {activeTab === 'Staff' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={searchContainer}>
                <Search size={18} color="#94a3b8" />
                <input style={searchInput} placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => handleOpenModal()} style={registerButtonStyle}><UserPlus size={18} /> Add Staff Node</button>
            </div>
          )}
        </header>

        {/* METRICS */}
        <div style={metricsGrid}>
          <MetricCard label="Total Personnel" value={staff.length} />
          <MetricCard label="Active Departments" value={depts.length} />
          <MetricCard label="Database Sync" value="Verified" color="#10b981" />
        </div>

        {/* DATA DISPLAY */}
        <div style={activeTab === 'Staff' ? contentGrid : { ...contentGrid, gridTemplateColumns: '1fr' }}>
          <section style={cardStyle}>
            {activeTab === 'Staff' && (
               <table style={tableStyle}>
               <thead>
                 <tr>
                   <th style={thStyle}>STAFF IDENTITY</th>
                   <th style={thStyle}>ROLE & DEPARTMENT</th>
                   <th style={thStyle}>STATUS</th>
                   <th style={thStyle}>ACTIONS</th>
                 </tr>
               </thead>
               <tbody>
  {filteredStaff && filteredStaff.length > 0 ? (
    filteredStaff.map((member) => (
      <tr key={member.id} style={trStyle}> 
        {/* 1. STAFF IDENTITY */}
        <td style={{ padding: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>{member.full_name}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{member.email}</div>
        </td>

        {/* 2. ROLE & DEPARTMENT */}
        <td style={{ padding: '15px' }}>
  {/* The Badge */}
  <span style={roleBadgeStyleFn(member.role)}>{member.role}</span>
  
  {/* The Department Label */}
  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
    {member.department_name || member.department?.name || "General Ward"}
  </div>
</td>

        {/* 3. STATUS */}
        <td style={{ padding: '15px' }}>
          <span style={{
            background: '#eff6ff',
            color: '#2563eb',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '800'
          }}>
            Active
          </span>
        </td>

        {/* 4. ACTIONS */}
        <td style={{ padding: '15px' }}>
          <div style={actionContainerStyle}>
            <button onClick={() => handleEdit(member)} style={editButtonStyle}>
              <Edit size={18} />
            </button>
            <button onClick={() => handleDelete(member.id)} style={deleteButtonStyle}>
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
        No staff records found.
      </td>
    </tr>
  )}
</tbody>
             </table>
            )}
            
            {activeTab === 'Depts' && (
  <div style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
      <h3 style={{ margin: 0, color: '#1e293b' }}>Hospital Hierarchy Nodes</h3>
      <button onClick={() => setIsDeptModalOpen(true)} style={registerButtonStyle}>
        <Plus size={18} /> Initialize New Dept
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {depts.map(d => {
        const assignedCount = staff.filter(s => s.dept_id === d.id).length;
        return (
          <div 
            key={d.id} 
            onClick={() => setSelectedDept(d)} // Click to open Detail Modal
            style={{...deptCardStyle, cursor: 'pointer', transition: '0.2s', border: '1px solid #e2e8f0'}}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '18px' }}>{d.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  <MapPin size={14} /> {d.location || 'Unassigned Wing'}
                </div>
              </div>
              <span style={roleBadgeStyleFn('Doctor')}>{d.dept_code}</span>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <Users size={16} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{assignedCount} Personnel</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{d.dept_type}</div>
            </div>
            
            <button style={{ 
              width: '100%', marginTop: '15px', padding: '8px', borderRadius: '6px', 
              border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b',
              fontSize: '12px', fontWeight: '600' 
            }}>
              Manage Node Details
            </button>
          </div>
        );
      })}
    </div>
    {/* MODAL: DEPARTMENT DETAIL VIEW */}
{selectedDept && (
  <div style={modalOverlayStyle}>
    <div style={{ ...modalContentStyle, maxWidth: '650px', padding: '0', overflow: 'hidden' }}>
      {/* HEADER SECTION */}
      <div style={{ background: '#10b981', padding: '30px', color: 'white', position: 'relative' }}>
        <X 
          size={24} 
          style={{ position: 'absolute', right: '20px', top: '20px', cursor: 'pointer' }} 
          onClick={() => setSelectedDept(null)} 
        />
        <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, letterSpacing: '1px' }}>
          HIERARCHY NODE: {selectedDept.dept_code}
        </div>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{selectedDept.name}</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
            <MapPin size={14}/> {selectedDept.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
            <Phone size={14}/> {selectedDept.contact_number || 'Internal Ext.'}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* LEFT: PERSONNEL DIRECTORY */}
        <div>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '15px' }}>Active Personnel</h4>
          <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {staff.filter(s => s.dept_id === selectedDept.id).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                  {s.full_name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{s.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{s.role}</div>
                </div>
              </div>
            ))}
            {staff.filter(s => s.dept_id === selectedDept.id).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#cbd5e1', fontSize: '12px', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                No personnel linked to this node.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: NODE ASSIGNMENT */}
        <div>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '15px' }}>Assign New Node</h4>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <p style={{ fontSize: '12px', color: '#166534', marginBottom: '12px', lineHeight: '1.5' }}>
              Select a staff member from the global registry to link them to this department.
            </p>
            <select id="modal-assign-select" style={{ ...inputStyle, background: 'white' }}>
              <option value="">Available Personnel...</option>
              {staff.filter(s => s.dept_id !== selectedDept.id).map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const val = document.getElementById('modal-assign-select').value;
                if(val) handleAssignDoctor(val, selectedDept.id);
              }}
              style={{ 
                width: '100%', marginTop: '10px', background: '#10b981', color: 'white', 
                border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <UserPlus size={18} /> Confirm Link
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div style={{ padding: '20px 30px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Edit size={16}/> Edit Metadata
        </button>
        <button style={{ background: '#fee2e2', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>
          Decommission Node
        </button>
      </div>
    </div>
  </div>
)}
  </div>
)}
          </section>

          {activeTab === 'Staff' && (
            <aside style={auditCardStyle}>
              <h3 style={auditTitle}><Activity size={16} /> System Logs</h3>
              <LogItem time="Now" type="SYNC" text="Registry operational" />
            </aside>
          )}
        </div>
      </main>

      {/* MODAL: DEPARTMENT */}
      {isDeptModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Initialize Department</h2>
              <X cursor="pointer" onClick={() => setIsDeptModalOpen(false)} />
            </div>
            
            <form onSubmit={handleDeptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={formSection}>
                <label style={labelStyle}>Identity</label>
                <div style={rowStyle}>
                  <input style={{...inputStyle, flex: 2}} placeholder="Full Name (e.g. Pediatrics)" value={deptFormData.name} onChange={(e) => setDeptFormData({...deptFormData, name: e.target.value})} required />
                  <input style={{...inputStyle, flex: 1}} placeholder="Code (PED)" value={deptFormData.dept_code} onChange={(e) => setDeptFormData({...deptFormData, dept_code: e.target.value.toUpperCase()})} />
                </div>
              </div>

              <div style={formSection}>
                <label style={labelStyle}>Location & Contact</label>
                <div style={inputWithIcon}>
                   <MapPin size={16} color="#94a3b8" />
                   <input style={nakedInput} placeholder="Building/Floor/Wing" value={deptFormData.location} onChange={(e) => setDeptFormData({...deptFormData, location: e.target.value})} />
                </div>
                <div style={inputWithIcon}>
                   <Phone size={16} color="#94a3b8" />
                   <input style={nakedInput} placeholder="Intercom Extension" value={deptFormData.contact_number} onChange={(e) => setDeptFormData({...deptFormData, contact_number: e.target.value})} />
                </div>
              </div>

              <div style={formSection}>
                <label style={labelStyle}>Classification</label>
                <select style={inputStyle} value={deptFormData.dept_type} onChange={(e) => setDeptFormData({...deptFormData, dept_type: e.target.value})}>
                  <option value="Clinical">Clinical (Treatment)</option>
                  <option value="Diagnostic">Diagnostic (Lab/Imaging)</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Support">Support Services</option>
                </select>
              </div>
              <button 
  type="submit" 
  style={{
    background: '#10b981', // NexHealth Emerald
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
    width: '100%',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
    transition: '0.3s'
  }}
>
  <Save size={18} /> Deploy Department Node
</button>
                         </form>
          </div>
        </div>
      )}

  

{/* MODAL: STAFF */}
{isModalOpen && (
  <div style={modalOverlayStyle}>
    <div style={modalContentStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{editingMember ? 'Edit Staff Node' : 'Initialize Staff Node'}</h2>
        <X cursor="pointer" onClick={() => setIsModalOpen(false)} />
      </div>
      
      <form onSubmit={handleFormSubmit} style={formScrollContainer}>
        {/* 1. IDENTITY SECTION */}
        <div style={formSection}>
          <label style={labelStyle}>Identity & Access</label>
          <input 
            style={inputStyle} 
            placeholder="Full Name" 
            value={formData.full_name} 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
            required 
          />
          <input 
            style={inputStyle} 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          
          {!editingMember && (
            <input 
              style={inputStyle} 
              type="password" 
              placeholder="Temporary Password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          )}
          
          <div style={rowStyle}>
            <select 
              style={{...inputStyle, flex: 1}} 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Pharmacist">Pharmacist</option>
            </select>

            <select 
              style={{...inputStyle, flex: 1.5}} 
              value={formData.dept_id} 
              onChange={(e) => setFormData({...formData, dept_id: e.target.value})} 
              required
            >
              <option value="">-- Assign Dept --</option>
              {depts?.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. EMPLOYMENT SECTION */}
        <div style={formSection}>
          <label style={labelStyle}>Employment Profile</label>
          <div style={rowStyle}>
            <div style={inputWithIcon}>
              <GraduationCap size={16} color="#94a3b8"/>
              <input 
                style={nakedInput} 
                placeholder="Qualification" 
                value={formData.qualification} 
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              />
            </div>
            <div style={inputWithIcon}>
              <CreditCard size={16} color="#94a3b8"/>
              <input 
                style={nakedInput} 
                type="number" 
                placeholder="Salary" 
                value={formData.salary} 
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* 3. ROLE-SPECIFIC FIELDS */}
        {formData.role === 'Doctor' && (
          <div style={specialFieldsContainer}>
            <label style={labelStyle}>Medical Credentials</label>
            <input 
              style={inputStyle} 
              placeholder="License No (MCI-XXXX)" 
              value={formData.license_no} 
              onChange={(e) => setFormData({...formData, license_no: e.target.value})} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Specialization" 
              value={formData.specialization} 
              onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
            />
          </div>
        )}

        {formData.role === 'Nurse' && (
          <div style={specialFieldsContainer}>
            <label style={labelStyle}>Nursing Assignment</label>
            <div style={rowStyle}>
              <select 
                style={inputStyle} 
                value={formData.shift_type} 
                onChange={(e) => setFormData({...formData, shift_type: e.target.value})}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
              </select>
              <input 
                style={inputStyle} 
                placeholder="Ward No." 
                value={formData.ward_no} 
                onChange={(e) => setFormData({...formData, ward_no: e.target.value})} 
              />
            </div>
          </div>
        )}

        <button type="submit" style={updatedSaveButtonStyle}>
          <Save size={18} /> Commit to Registry
        </button>
      </form>
    </div>
  </div>
)}
</div>
  );
};

// --- STYLES ---
const containerStyle = { display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' };
const sidebarStyle = { width: '260px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '32px 24px' };
const brandStyle = { fontSize: '22px', fontWeight: '800', marginBottom: '40px', letterSpacing: '-0.5px' };
const badgeStyle = { fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', width: 'fit-content', marginTop: '4px' };
const navStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const navItemStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' };
const mainStyle = { flex: 1, padding: '40px', overflowY: 'auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const titleStyle = { fontSize: '26px', fontWeight: '700', color: '#1e293b', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '13px', margin: 0 };
const searchContainer = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '0 16px', borderRadius: '12px' };
const searchInput = { border: 'none', padding: '12px 0', outline: 'none', fontSize: '14px', width: '200px' };
const registerButtonStyle = { background: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const metricsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' };
const metricCardStyle = { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' };
const metricLabel = { color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' };
const metricValue = { fontSize: '28px', fontWeight: '800', margin: 0 };
const contentGrid = { display: 'grid', gridTemplateColumns: '2.8fr 1fr', gap: '24px' };
const cardStyle = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const auditCardStyle = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { textAlign: 'left', padding: '16px', fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const actionBtn = { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', marginRight: '6px', cursor: 'pointer', color: '#64748b' };
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalContentStyle = { background: '#fff', padding: '32px', borderRadius: '24px', width: '95%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' };
const formScrollContainer = { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '8px' };
const formSection = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#fcfdfe', width: '100%', boxSizing: 'border-box' };
const rowStyle = { display: 'flex', gap: '10px' };
const inputWithIcon = { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', flex: 1, background: '#fcfdfe' };
const nakedInput = { border: 'none', background: 'transparent', padding: '12px 0', fontSize: '14px', outline: 'none', width: '100%' };
const specialFieldsContainer = { background: '#f0fdf4', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #dcfce7' };
const roleBadgeStyle = { background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' };
const statusBadgeStyle = { background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' };
const saveButtonStyle = { background: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' };
const auditTitle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '16px', fontWeight: '700' };
const logItemStyle = { display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '12px' };
const logBadge = { color: '#10b981', fontWeight: 'bold' };
const hodCheckContainer = { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' };
const hodLabelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' };
const deptCardStyle = { padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', transition: '0.2s' };

// Sub-Components
const MetricCard = ({ label, value, color }) => (
    <div style={metricCardStyle}>
      <p style={metricLabel}>{label}</p>
      <h2 style={{ ...metricValue, color: color || '#1e293b' }}>{value}</h2>
    </div>
);
const NavItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{ ...navItemStyle, background: active ? '#ecfdf5' : 'transparent', color: active ? '#10b981' : '#64748b' }}>
      {icon} {label}
    </div>
);
const LogItem = ({ time, type, text }) => (
    <div style={logItemStyle}>
      <span style={{color: '#94a3b8'}}>{time}</span>
      <span style={logBadge}>{type}</span>
      <span style={{color: '#475569'}}>{text}</span>
    </div>
);
const updatedSaveButtonStyle = { 
  background: '#10b981', // Medical Green
  color: '#fff', 
  border: 'none', 
  padding: '14px', 
  borderRadius: '12px', 
  fontWeight: '600', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px', 
  marginTop: '10px',
  transition: '0.2s',
  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' 
};
const deployButtonStyle = {
  background: '#10b981', // NexHealth Green
  color: '#fff',
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '20px',
  transition: '0.2s',
  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
  width: '100%'
};
const actionContainerStyle = {
  display: 'flex',      // Align children side-by-side
  flexDirection: 'row', // Horizontal layout
  gap: '8px',          // Space between buttons
  alignItems: 'center'
};

const editButtonStyle = {
  background: '#f1f5f9',
  color: '#64748b',
  border: 'none',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  transition: '0.2s',
};

const deleteButtonStyle = {
  background: '#fee2e2', // Light red for danger
  color: '#ef4444',      // Red icon
  border: 'none',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  transition: '0.2s',
};
const expandedCardStyle = {
  background: '#fff',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  padding: '24px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

const avatarStyle = {
  width: '48px',
  height: '48px',
  background: '#ecfdf5',
  color: '#10b981',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold'
};

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '24px',
  marginTop: '16px'
};


const infoBlock = { display: 'flex', flexDirection: 'column', gap: '8px' };
const dataRow = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' };
const dividerStyle = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' };
const saveIconStyle = { background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' };

export default AdminDashboard;