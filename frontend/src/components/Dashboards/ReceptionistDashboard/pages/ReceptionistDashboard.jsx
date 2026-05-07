import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Calendar, Receipt, Search, 
  LogOut, LayoutDashboard, User, Bell, Settings,
  Users, CheckCircle, Clock, ArrowRight, ArrowLeft,
  MoreVertical, XCircle, LogIn, Phone, Filter, Download,
  X, CreditCard, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../../../theme/theme'; 
import PatientRegistration from './PatientRegistration';
import BookAppointment from './BookAppointment';
import Billing from './Billing';

const ReceptionistDashboard = () => {
  // --- DYNAMIC CREDENTIALS LOGIC ---
  const rawData = sessionStorage.getItem('user_data');
  const userData = rawData ? JSON.parse(rawData) : {};
  
  const activeName = userData.full_name || 'Unknown Staff'; 
  const activeStaffId = userData.staff_id || userData.id || 'N/A'; 
  const hospId = userData.hospital_id || sessionStorage.getItem('hospital_id') || 1;

  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({ totalPatients: 0, appointmentsToday: 0 });
  const [recentPatients, setRecentPatients] = useState([]); 
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]); 
  const [allInvoices, setAllInvoices] = useState([]); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const sidebarWidth = '280px';
  const pendingCount = allInvoices.filter(inv => inv.status === 'Pending').length;

  const fetchData = async () => {
    try {
      const statsRes = await fetch(`http://localhost:8000/api/v1/receptionist/stats/${hospId}`);
      const statsData = await statsRes.json();
      setStats({
        totalPatients: statsData.total_patients || 0,
        appointmentsToday: statsData.appointments_today || 0
      });

      const patientsRes = await fetch(`http://localhost:8000/api/v1/receptionist/patients/recent?hosp_id=${hospId}`);
      const patientsData = await patientsRes.json();
      setRecentPatients(patientsData); 

      const apptsTodayRes = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/today?hosp_id=${hospId}`);
      const apptsTodayData = await apptsTodayRes.json();
      setTodaysAppointments(apptsTodayData);

      const upcomingRes = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/upcoming?hosp_id=${hospId}`);
      const upcomingData = await upcomingRes.json();
      setUpcomingAppointments(upcomingData);

      const allPatientsRes = await fetch(`http://localhost:8000/api/v1/receptionist/patients/all?hosp_id=${hospId}`);
      const allPatientsData = await allPatientsRes.json();
      setAllPatients(allPatientsData);

      const invoicesRes = await fetch(`http://localhost:8000/api/v1/receptionist/invoices/all?hosp_id=${hospId}`);
      const invoicesData = await invoicesRes.json();
      setAllInvoices(invoicesData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Logic to handle patient Check-In
  const handleCheckIn = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${appointmentId}/check-in?hosp_id=${hospId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchData(); // Refresh all data to move patient to waiting room
      } else {
        const errorData = await response.json();
        alert(`Check-in failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error during check-in:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentView]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'register', label: 'Register Patient', icon: <UserPlus size={18} /> },
    { id: 'appointments', label: 'Book Appointment', icon: <Calendar size={18} /> },
    { id: 'patients_list', label: 'Total Patients', icon: <Users size={18} /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: theme.typography.fontFamily }}>
      
      {/* Sidebar */}
      <aside style={{ width: sidebarWidth, backgroundColor: theme.colors.cardWhite, borderRight: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: theme.colors.text, letterSpacing: '-0.05em', margin: 0 }}>
            Nex<span style={{ color: theme.colors.primary }}>Health</span>
          </h1>
          <div style={{ fontSize: '11px', fontWeight: '800', color: theme.colors.primary, background: '#ecfdf5', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginTop: '8px', textTransform: 'uppercase' }}>
            ID: {activeStaffId} | RECEPTIONIST
          </div>
        </div>

        <nav style={{ padding: '20px', flex: 1 }}>
          {menuItems.map((item) => (
            <div key={item.id} onClick={() => setCurrentView(item.id)} style={currentView === item.id ? navItemActive : navItem}>
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        <button onClick={() => { sessionStorage.clear(); window.location.href='/login'; }} style={logoutBtn}>
          <LogOut size={18} /> Sign Out
        </button>
      </aside>
      

      <main style={{ marginLeft: sidebarWidth, flex: 1, padding: '40px' }}>
        
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
  <div>
    <h2 style={{ fontSize: '26px', fontWeight: '800', color: theme.colors.text, margin: 0 }}>
      {currentView === 'today_appointments' ? "Today's Schedule" : 
       currentView === 'patients_list' ? "Patient Directory" :
       currentView === 'billing' ? "Billing & Invoices" :
       menuItems.find(m => m.id === currentView)?.label}
    </h2>
    <p style={{ color: theme.colors.subtitle, margin: '4px 0 0' }}>
      Welcome back, {activeName}
    </p>
  </div>

  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
    <div style={iconCircle}><Bell size={20} color={theme.colors.subtitle} /></div>
    <div style={iconCircle}><Settings size={20} color={theme.colors.subtitle} /></div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', paddingLeft: '12px', borderLeft: `1px solid ${theme.colors.border}` }}>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{activeName}</p>
        <p style={{ fontSize: '12px', color: theme.colors.subtitle, margin: 0 }}>
          Staff ID: {activeStaffId}
        </p>
      </div>
      <div style={avatarStyle}>
        <User size={20} color="white" />
      </div>
    </div>
  </div>
</header>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentView} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
          >
            {currentView === 'overview' && (
              <DashboardOverview 
                stats={stats} 
                todaysAppointments={todaysAppointments} 
                pendingBills={pendingCount}
                recentPatients={recentPatients} 
                onAction={() => setCurrentView('register')} 
                onShowToday={() => setCurrentView('today_appointments')}
                onShowPatients={() => setCurrentView('patients_list')}
                onShowBilling={() => setCurrentView('billing')}
                onViewPatient={(p) => setSelectedPatient(p)}
                hosp_id={hospId}
                refresh={fetchData} 
              />
            )}

            {currentView === 'patients_list' && (
              <PatientDirectoryView 
                patients={allPatients} 
                onBack={() => setCurrentView('overview')} 
                refresh={fetchData}
                onViewProfile={(p) => setSelectedPatient(p)}
              />
            )}

{currentView === 'today_appointments' && (
  <TodayAppointmentsView 
    appointments={todaysAppointments} 
    onBack={() => setCurrentView('overview')}
    hosp_id={hospId}
    refresh={fetchData}
    onCheckIn={handleCheckIn}
    onReschedule={(appt) => setReschedulingAppt(appt)} 
  />
)}

            {currentView === 'billing' && (
              <Billing 
                invoices={allInvoices} 
                hosp_id={hospId} 
                onBack={() => setCurrentView('overview')} 
                refresh={fetchData}
              />
            )}

            {currentView === 'register' && (
              <PatientRegistration onBack={() => setCurrentView('overview')} />
            )}

            {currentView === 'appointments' && (
              <BookAppointment 
                hosp_id={hospId} 
                appointmentsList={upcomingAppointments}
                refresh={fetchData}
                onBack={() => setCurrentView('overview')} 
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
  {selectedPatient && (
    <PatientProfileModal 
      patient={selectedPatient} 
      invoices={allInvoices} 
      onClose={() => setSelectedPatient(null)} 
      refresh={fetchData} 
      hosp_id={hospId}
    />
  )}
</AnimatePresence>
      </main>
    </div>
  );
};

/* --- SHARED STYLES --- */

const iconCircle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #e2e8f0',
  cursor: 'pointer'
};



/* --- SUB-COMPONENTS --- */

const DashboardOverview = ({onAction, stats, recentPatients, onShowToday, onShowPatients, onShowBilling, pendingBills, onViewPatient }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div onClick={onShowPatients} style={{ cursor: 'pointer' }}>
          <StatCard icon={<Users color="#059669" />} label="Total Patients" value={stats.totalPatients} trend="Live" />
        </div>
        <div onClick={onShowToday} style={{ cursor: 'pointer' }}>
          <StatCard icon={<Calendar color="#0891b2" />} label="Appointments Today" value={stats.appointmentsToday} trend="Today" />
        </div>
        <StatCard icon={<CheckCircle color="#7c3aed" />} label="Consultations" value={stats.appointmentsToday} trend="Active" />
        <div onClick={onShowBilling} style={{ cursor: 'pointer' }}>
          <StatCard icon={<Clock color="#ea580c" />} label="Pending Bills" value={pendingBills} trend="Attention" />
        </div>
      </div>

      <div style={tableCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.text, margin: 0 }}>Recent Registrations</h3>
          <button onClick={onAction} style={miniBtn}>+ New Registration</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Patient Name</th>
              <th style={thStyle}>Age/Sex</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Visit Type</th>
              <th style={thStyle}>Consultant</th>
              <th style={thStyle}>Reg. Time</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {recentPatients && recentPatients.length > 0 ? (
              recentPatients.map((patient) => {
                const birthDate = new Date(patient.date_of_birth);
                const age = isNaN(birthDate.getTime()) ? 'N/A' : new Date().getFullYear() - birthDate.getFullYear();
                const gender = patient.gender ? patient.gender.charAt(0).toUpperCase() : 'U';
                const regTime = patient.created_at 
                  ? new Date(patient.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A';
                return (
                  <AppointmentRow 
                    key={patient.id} 
                    name={`${patient.first_name} ${patient.last_name}`} 
                    info={`${age}y / ${gender}`}
                    contact={patient.phone_number}
                    visitType={patient.visit_type || "General"} 
                    consultant={patient.doctor_name || "TBD"}       
                    regTime={regTime}                               
                    status={patient.status || "Registered"} 
                    onClick={() => onViewPatient(patient)}
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No recent registrations found.</td>
              </tr>
              
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PatientDirectoryView = ({ patients, onBack, refresh, onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  useEffect(() => {
    const handleClickOutside = () => {
      setIsFilterOpen(false);
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.phone_number && p.phone_number.includes(searchTerm));
    const matchesFilter = filterType === "All" || p.gender === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back to Dashboard</button>
      
      <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
        <div style={searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search all patients..." 
            style={searchInput} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            style={{ ...iconBtn, backgroundColor: filterType !== "All" ? "#ecfdf5" : "white", borderColor: filterType !== "All" ? "#059669" : "#e2e8f0" }} 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
          >
            <Filter size={18} color={filterType !== "All" ? "#059669" : "#64748b"} />
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={filterDropdownStyle}>
                <div style={filterHeader}>Filter By Gender</div>
                {["All", "Male", "Female"].map(type => (
                  <button key={type} onClick={() => setFilterType(type)} style={filterOptionStyle(filterType === type)}>
                    {type} {filterType === type && <CheckCircle size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button style={downloadBtn}><Download size={18} /> Export CSV</button>
      </div>

      <div style={tableCardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Patient Name</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Age/Gender</th>
              <th style={thStyle}>Registered On</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? filteredPatients.map((p) => (
              <tr key={p.id} style={{ borderBottom: `1px solid #f8fafc` }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={avatarMini}>{p.first_name[0]}</div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{p.first_name} {p.last_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>PID: #{p.id}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}><Phone size={14} color="#059669" /> {p.phone_number}</td>
                <td style={tdStyle}>{p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 'N/A'}Y / {p.gender}</td>
                <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={{ ...tdStyle, position: 'relative' }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }}
                    style={{ cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={18} color="#94a3b8" />
                  </div>
                  
                  <AnimatePresence>
                    {activeMenuId === p.id && (
                      <PatientActionMenu 
                        onView={() => { onViewProfile(p); setActiveMenuId(null); }} 
                        onEdit={() => console.log("Edit")} 
                        onArchive={() => console.log("Archive")}
                      />
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PatientActionMenu = ({ onView, onEdit, onArchive }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={dropdownMenuStyle}>
    <button onClick={(e) => { e.stopPropagation(); onView(); }} style={menuItemStyle}>
      <User size={14} /> View Profile
    </button>
    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={menuItemStyle}>
      <Settings size={14} /> Edit Details
    </button>
    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
    <button onClick={(e) => { e.stopPropagation(); onArchive(); }} style={{ ...menuItemStyle, color: '#ef4444' }}>
      <XCircle size={14} /> Archive
    </button>
  </motion.div>
);

const PatientProfileModal = ({ patient, onClose, invoices, refresh, hosp_id }) => {
  const patientInvoices = invoices ? invoices.filter(inv => inv.patient_id === patient.id) : [];
  
  const [formData, setFormData] = useState({
    // --- 1. PERSONAL ---
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    gender: patient.gender || '',
    date_of_birth: patient.date_of_birth || '',
    phone_number: patient.phone_number || '',
    email: patient.email || '',
    address: patient.address || '',
    
    // --- 2. IDENTITY (ABDM Ready) ---
    abha_id: patient.abha_id || '', // 14 digit ID
    id_type: patient.id_type || 'Aadhar',
    id_number: patient.id_number || '',
    
    // --- 3. CLINICAL ---
    blood_group: patient.blood_group || '',
    weight: patient.weight || '',
    height: patient.height || '',
    allergies: patient.allergies || '',
    chronic_conditions: patient.chronic_conditions || '', // e.g., Diabetes, Hypertension
    
    // --- 4. PROFESSIONAL & SOCIAL ---
    occupation: patient.occupation || '',
    marital_status: patient.marital_status || '',
    emergency_contact: patient.emergency_contact || '',
    emergency_relation: patient.emergency_relation || '',
    
    // --- 5. INSURANCE ---
    insurance_provider: patient.insurance_provider || '',
    policy_number: patient.policy_number || ''
  });

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/patients/${patient.id}?hosp_id=${hosp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if(refresh) refresh(); 
        onClose();
      }
    } catch (e) { console.error("Update failed", e); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={modalOverlay} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} style={sideSheetStyle}>
        
        <div style={profileHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={avatarLarge}>{formData.first_name ? formData.first_name[0] : 'P'}</div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                {formData.first_name} {formData.last_name}
              </h2>
              <span style={idBadge}>PID: #{patient.id}</span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* SECTION 1: PERSONAL BIODATA */}
          <h3 style={sectionTitle}>Personal Biodata</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={miniLabel}>First Name</label>
              <input style={modalInput} value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div>
              <label style={miniLabel}>Last Name</label>
              <input style={modalInput} value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
            <div>
              <label style={miniLabel}>Gender</label>
              <select style={modalInput} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={miniLabel}>Date of Birth</label>
              <input style={modalInput} type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={miniLabel}>Full Address</label>
              <input style={modalInput} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          {/* SECTION 2: IDENTITY & ABDM */}
          <h3 style={sectionTitle}>Identity & ABDM</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={miniLabel}>ABHA Number (14-Digit Digital ID)</label>
              <input style={{...modalInput, borderColor: '#10b981', backgroundColor: '#f0fdf4'}} placeholder="00-0000-0000-0000" value={formData.abha_id} onChange={e => setFormData({...formData, abha_id: e.target.value})} />
            </div>
            <div>
              <label style={miniLabel}>Govt ID Type</label>
              <select style={modalInput} value={formData.id_type} onChange={e => setFormData({...formData, id_type: e.target.value})}>
                <option value="Aadhar">Aadhar</option>
                <option value="PAN">PAN</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            <div>
              <label style={miniLabel}>ID Number</label>
              <input style={modalInput} value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} />
            </div>
          </div>

          {/* SECTION 3: CLINICAL SUMMARY */}
          <h3 style={sectionTitle}>Clinical Vital Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <select style={modalInput} value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
              <option value="">Blood Grp</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <input style={modalInput} placeholder="Weight (kg)" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            <input style={modalInput} placeholder="Height (cm)" type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={miniLabel}>Known Allergies / Chronic Conditions</label>
            <textarea style={{...modalInput, height: '60px', padding: '10px'}} placeholder="e.g. Peanuts, Hypertension, Asthma..." value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
          </div>

          {/* SECTION 4: PROFESSIONAL & EMERGENCY */}
          <h3 style={sectionTitle}>Professional & Emergency</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={miniLabel}>Occupation</label>
              <input style={modalInput} value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
            </div>
            <div>
              <label style={miniLabel}>Marital Status</label>
              <select style={modalInput} value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <div>
              <label style={miniLabel}>Emergency Contact</label>
              <input style={modalInput} placeholder="Phone No." value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} />
            </div>
            <div>
              <label style={miniLabel}>Relation</label>
              <input style={modalInput} placeholder="Spouse/Parent" value={formData.emergency_relation} onChange={e => setFormData({...formData, emergency_relation: e.target.value})} />
            </div>
          </div>

          {/* SECTION 5: INSURANCE BOX */}
          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #dbeafe', marginBottom: '24px' }}>
             <h4 style={{ color: '#2563eb', fontSize: '12px', margin: '0 0 12px 0' }}>INSURANCE POLICY</h4>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input style={modalInput} placeholder="Provider Name" value={formData.insurance_provider} onChange={e => setFormData({...formData, insurance_provider: e.target.value})} />
                <input style={modalInput} placeholder="Policy / Member ID" value={formData.policy_number} onChange={e => setFormData({...formData, policy_number: e.target.value})} />
             </div>
          </div>
        </div>

        <div style={profileFooter}>
          <button style={saveBtnStyle} onClick={handleUpdate}>Save Master Profile</button>
        </div>
      </motion.div>
    </>
  );
};
const InfoBox = ({ label, value, icon }) => (
  <div style={{ marginBottom: '16px' }}>
    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>{label}</span>
    <div style={{ fontSize: '14px', color: '#334155', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon} {value}
    </div>
  </div>
);

const TodayAppointmentsView = ({ appointments, onBack, hosp_id, refresh, onCheckIn }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

 // 1. Patients currently with the doctor
 const inConsultation = appointments.filter(a => a.status === 'In Consultation');
  
 // 2. Patients who have arrived and are waiting
 const waitingRoom = appointments.filter(a => a.status === 'Checked In');

 // 3. Patients scheduled for later
 const upcomingToday = appointments.filter(a => 
   !['Checked In', 'In Consultation', 'Cancelled', 'Completed'].includes(a.status)
 );
 
  const handleAction = async (type, appt) => {
    setActiveMenuId(null);
    const baseUrl = `http://localhost:8000/api/v1/receptionist/appointments/${appt.id}`;
    const queryParams = `?hosp_id=${hosp_id}`;

    try {
      switch (type) {
        case 'CHECK_IN':
          await onCheckIn(appt.id);
          break;
        case 'CANCEL':
          if (!window.confirm(`Are you sure you want to cancel ${appt.patient_name}'s appointment?`)) return;
          const response = await fetch(`${baseUrl}${queryParams}`, { method: 'DELETE' });
          if (response.ok) refresh();
          break;
        case 'RESCHEDULE':
          setRescheduleAppt(appt);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error(`Error performing ${type}:`, error);
    }
  };

  const handleRescheduleSubmit = async (newDate, newTime) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${rescheduleAppt.id}/reschedule?hosp_id=${hosp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_date: newDate, appointment_time: newTime })
      });
      if (response.ok) {
        setRescheduleAppt(null);
        refresh();
      }
    } catch (error) {
      console.error("Reschedule failed:", error);
    }
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }} 
      onClick={() => setActiveMenuId(null)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back to Dashboard</button>
      </div>
      
      {/* 1. NEW: Active Consultations Block */}
     {/* 1. Active Consultations Block */}
{inConsultation.length > 0 && (
  <div style={{ ...tableCardStyle, borderColor: '#fdba74', backgroundColor: 'white' }}> 
    {/* ^ Softened orange border (#fdba74) */}
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      {/* Change this dot to Orange and add a subtle pulse if you can */}
      <div style={{ 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: '#ea580c' 
      }}></div>
      
      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ea580c' }}>
        Currently In Consultation
      </h3>
    </div>
    
    <AppointmentTable 
      data={inConsultation} 
      onAction={() => {}} 
      activeMenuId={activeMenuId}
      setActiveMenuId={setActiveMenuId}
      isConsulting={true}
    />
  </div>
)}

      {/* 2. Live Waiting Room */}
      <div style={tableCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', animation: 'pulse 2s infinite' }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#059669' }}>Live Waiting Room (Checked In)</h3>
        </div>
        <AppointmentTable 
          data={waitingRoom} 
          onAction={handleAction}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
        />
      </div>

      {/* 3. Remaining Schedule */}
      <div style={{ ...tableCardStyle, borderStyle: 'dashed', borderColor: '#cbd5e1', overflow: 'visible' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', color: '#64748b' }}>Remaining Schedule</h3>
        <AppointmentTable 
          data={upcomingToday} 
          onAction={handleAction}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
        />
      </div>

      <AnimatePresence>
        {rescheduleAppt && (
          <RescheduleModal 
            appt={rescheduleAppt} 
            onClose={() => setRescheduleAppt(null)} 
            onConfirm={handleRescheduleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AppointmentTable = ({ data, onAction, activeMenuId, setActiveMenuId, isConsulting }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
        <th style={thStyle}>Time</th>
        <th style={thStyle}>Patient Name & PID</th>
        <th style={thStyle}>Doctor</th>
        <th style={thStyle}>Status</th>
        <th style={thStyle}>Action</th>
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? data.map((appt) => (
        <tr key={appt.id} style={{ borderBottom: `1px solid #f8fafc` }}>
          {/* Updated Time Logic: Truncates 12:00:00 to 12:00 */}
          <td style={tdStyle}>
            <span style={{
              ...timeBadgeStyle,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontWeight: '600'
            }}>
              {appt.appointment_time.substring(0, 5)}
            </span>
          </td>
          
          <td style={tdStyle}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>{appt.patient_name}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>PID: #{appt.patient_id}</span>
            </div>
          </td>
          <td style={tdStyle}>{appt.doctor_name}</td>
          <td style={tdStyle}>
            <span style={
             appt.status === 'In Consultation' 
             ? { ...statusBadgeBlue, backgroundColor: '#fff7ed', color: '#ea580c' } 
             : appt.status === 'Checked In' 
               ? statusBadgeGreen 
               : statusBadgeBlue }>
              {appt.status}
            </span>
          </td>
          <td style={{ ...tdStyle, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isConsulting ? (
                /* Updated: Changed color from #0284c7 to #ea580c to match status */
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c', fontWeight: '700', fontSize: '13px' }}>
                  <Clock size={16} /> With Doctor
                </div>
              ) : appt.status === 'Checked In' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '600', fontSize: '13px' }}>
                  <CheckCircle size={16} /> In Waiting Room
                </div>
              ) : (
                <>
                  <button onClick={() => onAction('CHECK_IN', appt)} style={miniBtn}>Check In</button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === appt.id ? null : appt.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                      <MoreVertical size={18} color="#94a3b8" />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === appt.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                          animate={{ opacity: 1, scale: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={dropdownMenuStyle}
                        >
                          <button onClick={() => onAction('RESCHEDULE', appt)} style={menuItemStyle}>
                            <Calendar size={14} /> Reschedule
                          </button>
                          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                          <button onClick={() => onAction('CANCEL', appt)} style={{ ...menuItemStyle, color: '#ef4444' }}>
                            <XCircle size={14} /> Cancel
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </td>
        </tr>
      )) : (
        <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No appointments found.</td></tr>
      )}
    </tbody>
  </table>
);

const RescheduleModal = ({ appt, onClose, onConfirm }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <>
      <div style={modalOverlay} onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={rescheduleCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Reschedule Appointment</h3>
          <X size={20} onClick={onClose} style={{ cursor: 'pointer', color: '#94a3b8' }} />
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={avatarMini}>{appt.patient_name[0]}</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>{appt.patient_name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Current: {appt.appointment_time}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>New Date</label>
            <input type="date" style={modalInput} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>New Time</label>
            <input type="time" style={modalInput} onChange={(e) => setTime(e.target.value)} />
          </div>
          <button 
            style={confirmBtn} 
            onClick={() => onConfirm(date, time)}
            disabled={!date || !time}
          >
            Confirm Reschedule
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* --- STYLES --- */
const rescheduleCard = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '32px',
  borderRadius: '24px',
  width: '400px',
  zIndex: 10001,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
};



const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748b' };

const confirmBtn = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '8px'
};

/* --- CONSTANTS & HELPERS --- */
const StatCard = ({ icon, label, value, trend }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid #e2e8f0`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>{trend}</span>
    </div>
    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: 0 }}>{label}</p>
    <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{value}</h4>
  </div>
);

const AppointmentRow = ({ name, info, contact, visitType, consultant, regTime, status, onClick }) => (
  <tr style={{ borderBottom: `1px solid #f8fafc` }}>
    <td style={tdStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={avatarMini}>{name.charAt(0).toUpperCase()}</div>
        <span style={{ fontWeight: '600', color: '#334155' }}>{name}</span>
      </div>
    </td>
    <td style={tdStyle}>{info}</td>
    <td style={tdStyle}>{contact}</td>
    <td style={tdStyle}>{visitType}</td>
    <td style={tdStyle}>{consultant}</td>
    <td style={tdStyle}>{regTime}</td>
    <td style={tdStyle}><span style={statusBadgeGreen}>{status}</span></td>
    <td style={tdStyle}>
      <div onClick={onClick} style={{ cursor: 'pointer', padding: '4px' }}>
        <ArrowRight size={18} color="#059669" />
      </div>
    </td>  
  </tr>
);

// Global UI Constants
const navItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', color: '#64748b', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', cursor: 'pointer' };
const navItemActive = { ...navItem, backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '700' };
const logoutBtn = { margin: '20px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `1px solid #fee2e2`, borderRadius: '12px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', backgroundColor: 'white' };

const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'left' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#334155' };
const miniBtn = { padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const tableCardStyle = { background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const avatarMini = { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#059669' };
const avatarLarge = { width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' };
const statusBadgeGreen = { padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const statusBadgeBlue = { padding: '4px 8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' };
const searchWrapper = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' };
const iconBtn = { padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const downloadBtn = { ...iconBtn, gap: '8px', padding: '10px 16px', color: '#64748b', fontWeight: '600', fontSize: '14px' };
const filterDropdownStyle = { position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 20, padding: '8px' };
const filterHeader = { padding: '8px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const filterOptionStyle = (active) => ({ width: '100%', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: active ? '#f0fdf4' : 'transparent', color: active ? '#059669' : '#475569', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' });
const dropdownMenuStyle = { position: 'absolute', top: '100%', right: 0, width: '180px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', zIndex: 30, padding: '6px', marginTop: '4px' };
const menuItemStyle = { width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'transparent', color: '#475569', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' };
const timeBadgeStyle = { padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#334155' };
const profileHeader = { padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const profileFooter = { padding: '32px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' };
const editProfileBtn = { width: '100%', padding: '14px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: '700', cursor: 'pointer' };
const idBadge = { padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#64748b' };
const sectionTitle = { fontSize: '14px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const closeBtnStyle = { border: 'none', background: '#f1f5f9', color: '#64748b', padding: '8px', borderRadius: '10px', cursor: 'pointer' };
const miniTableContainer = { borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' };
const miniTh = { padding: '12px 16px', fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' };
const miniTd = { padding: '12px 16px', fontSize: '13px', color: '#475569' };
const emptyHistoryBox = { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };

/* --- MODAL & BUTTON STYLES --- */
const saveBtnStyle = { 
  width: '100%', 
  padding: '16px', 
  backgroundColor: '#059669', 
  color: 'white', 
  border: 'none', 
  borderRadius: '12px', 
  fontWeight: '700', 
  cursor: 'pointer',
  fontSize: '15px',
  marginTop: '10px'
};

const modalInput = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '10px', 
  border: '1px solid #e2e8f0', 
  fontSize: '14px', 
  outline: 'none',
  backgroundColor: '#ffffff'
};

const miniLabel = { 
  fontSize: '11px', 
  fontWeight: '800', 
  color: '#94a3b8', 
  textTransform: 'uppercase', 
  marginBottom: '6px', 
  display: 'block' 
};

const sideSheetStyle = { 
  position: 'fixed', 
  top: 0, 
  right: 0, 
  bottom: 0, 
  width: '480px', 
  backgroundColor: 'white', 
  boxShadow: '-10px 0 50px rgba(0,0,0,0.1)', 
  zIndex: 1000, 
  display: 'flex', 
  flexDirection: 'column' 
};

const modalOverlay = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.3)', 
  backdropFilter: 'blur(4px)', 
  zIndex: 999 
};
const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #e2e8f0"
};
export default ReceptionistDashboard;