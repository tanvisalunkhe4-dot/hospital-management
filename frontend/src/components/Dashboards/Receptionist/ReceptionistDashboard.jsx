import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Calendar, Receipt, Search, 
  LogOut, LayoutDashboard, User, Bell, Settings,
  Users, CheckCircle, Clock, ArrowRight, ArrowLeft,
  MoreVertical, XCircle, LogIn, Phone, Filter, Download,
  X, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../../theme/theme'; 
import PatientRegistration from './PatientRegistration';
import BookAppointment from './BookAppointment';
import Billing from './Billing';
import DashboardHeader from '../../common/DashboardHeader';

const ReceptionistDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({ totalPatients: 0, appointmentsToday: 0 });
  const [recentPatients, setRecentPatients] = useState([]); 
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]); 
  const [allInvoices, setAllInvoices] = useState([]); 
  
  // NEW: State for Profile View
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const sidebarWidth = '280px';
  const hospId = localStorage.getItem('hospital_id') || 1;

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

  useEffect(() => {
    fetchData();
  }, [currentView]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'register', label: 'Register Patient', icon: <UserPlus size={18} /> },
    { id: 'appointments', label: 'Book Appointment', icon: <Calendar size={18} /> },
    { id: 'patients_list', label: 'Total Patients', icon: <Users size={18} /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt size={18} /> },
    { id: 'search', label: 'Patient Search', icon: <Search size={18} /> },
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
            Receptionist Desk
          </div>
        </div>

        <nav style={{ padding: '20px', flex: 1 }}>
          {menuItems.map((item) => (
            <div key={item.id} onClick={() => setCurrentView(item.id)} style={currentView === item.id ? navItemActive : navItem}>
              {item.icon} {item.label}
            </div>
          ))}
        </nav>


        <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={logoutBtn}>
          <LogOut size={18} /> Sign Out
        </button>
      </aside>
      

      <main style={{ marginLeft: sidebarWidth, flex: 1, padding: '40px' }}>
        
      <DashboardHeader 
  title="Reception Desk" 
  subtitle="Patient Queue & Registration" 
/>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentView} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
          >
            {/* 1. Updated Dashboard Overview */}
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

            {/* 2. Patient Directory */}
            {currentView === 'patients_list' && (
              <PatientDirectoryView 
                patients={allPatients} 
                onBack={() => setCurrentView('overview')} 
                refresh={fetchData}
                onViewProfile={(p) => setSelectedPatient(p)}
              />
            )}

            {/* 3. Today's Appointments Full View */}
            {currentView === 'today_appointments' && (
              <TodayAppointmentsView 
                appointments={todaysAppointments} 
                onBack={() => setCurrentView('overview')}
                hosp_id={hospId}
                refresh={fetchData}
              />
            )}

            {/* 4. Billing & Invoices */}
            {currentView === 'billing' && (
              <Billing 
                invoices={allInvoices} 
                hosp_id={hospId} 
                onBack={() => setCurrentView('overview')} 
                refresh={fetchData}
              />
            )}

            {/* 5. Patient Registration Form */}
            {currentView === 'register' && <PatientRegistration />}
            
            {/* 6. Book Appointment Form */}
            {currentView === 'appointments' && (
              <BookAppointment 
                hosp_id={hospId} 
                appointmentsList={upcomingAppointments}
                refresh={fetchData}
              />
            )}

            {/* 7. Search Placeholder */}
            {currentView === 'search' && (
              <div style={placeholderCard}>Patient Records Coming Soon</div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Side Sheet for Patient Profile */}
        <AnimatePresence>
          {selectedPatient && (
            <PatientProfileModal 
              patient={selectedPatient} 
              invoices={allInvoices} 
              onClose={() => setSelectedPatient(null)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const DashboardOverview = ({onAction, stats, recentPatients, onShowToday, onShowPatients, onShowBilling, pendingBills }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* Total Patients Card - Now Clickable */}
        <div onClick={onShowPatients} style={{ cursor: 'pointer' }}>
          <StatCard icon={<Users color="#059669" />} label="Total Patients" value={stats.totalPatients} trend="Live" />
        </div>

        {/* Appointments Today Card - Now Clickable */}
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

const PatientProfileModal = ({ patient, onClose, invoices }) => {
  const patientInvoices = invoices.filter(inv => inv.patient_id === patient.id);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={modalOverlay}
      />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={sideSheetStyle}
      >
        <div style={profileHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={avatarLarge}>{patient.first_name[0]}</div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                {patient.first_name} {patient.last_name}
              </h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <span style={idBadge}>Patient ID: #{patient.id}</span>
                <span style={statusBadgeGreen}>Active</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <h3 style={sectionTitle}>Personal Details</h3>
          <div style={infoGrid}>
            <InfoBox label="Contact Number" value={patient.phone_number} icon={<Phone size={14}/>} />
            <InfoBox label="Email Address" value={patient.email || 'Not Provided'} />
            <InfoBox label="Gender" value={patient.gender} />
            <InfoBox label="Date of Birth" value={new Date(patient.date_of_birth).toLocaleDateString()} />
          </div>

          <h3 style={{ ...sectionTitle, marginTop: '40px' }}>Recent Billing Activities</h3>
          {patientInvoices.length > 0 ? (
            <div style={miniTableContainer}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={miniTh}>Inv #</th>
                    <th style={miniTh}>Date</th>
                    <th style={miniTh}>Amount</th>
                    <th style={miniTh}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientInvoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={miniTd}>#{inv.id}</td>
                      <td style={miniTd}>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td style={miniTd}>₹{inv.total_amount}</td>
                      <td style={miniTd}><span style={inv.status === 'Paid' ? statusBadgeGreen : statusBadgeBlue}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyHistoryBox}>No billing records found.</div>
          )}
        </div>
        
        <div style={profileFooter}>
          <button style={editProfileBtn} onClick={() => alert("Coming soon")}>Edit Patient Data</button>
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

// TodayAppointmentsView & AppointmentTable remain largely same as your snippet

const TodayAppointmentsView = ({ appointments, onBack, hosp_id, refresh }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState(null);

  const waitingRoom = appointments.filter(a => a.status === 'Checked-In');
  const upcomingToday = appointments.filter(a => a.status !== 'Checked-In' && a.status !== 'Cancelled');

  const handleToggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleUpdateStatus = async (apptId, status) => {
    try {
      await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${apptId}/status?hosp_id=${hosp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      refresh();
      setActiveMenuId(null);
    } catch (err) { console.error(err); }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${rescheduleData.id}?hosp_id=${hosp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appointment_date: rescheduleData.appointment_date, 
          appointment_time: rescheduleData.appointment_time,
          status: 'Rescheduled' 
        })
      });
      setRescheduleData(null);
      refresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} onClick={() => setActiveMenuId(null)}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back to Dashboard</button>
      
      <div style={tableCardStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', color: '#059669' }}>Live Waiting Room</h3>
        <AppointmentTable 
          data={waitingRoom} 
          type="waiting" 
          toggleMenu={handleToggleMenu} 
          activeMenuId={activeMenuId}
          onCancel={(id) => handleUpdateStatus(id, 'Cancelled')}
          onReschedule={(appt) => setRescheduleData(appt)}
        />
      </div>

      <div style={{ ...tableCardStyle, borderStyle: 'dashed' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', color: '#64748b' }}>Remaining Schedule</h3>
        <AppointmentTable 
          data={upcomingToday} 
          type="scheduled" 
          onCheckIn={(id) => handleUpdateStatus(id, 'Checked-In')} 
          toggleMenu={handleToggleMenu} 
          activeMenuId={activeMenuId}
          onCancel={(id) => handleUpdateStatus(id, 'Cancelled')}
          onReschedule={(appt) => setRescheduleData(appt)}
        />
      </div>

      <AnimatePresence>
        {rescheduleData && (
          <div style={modalOverlay}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={modalContent}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <h3 style={{ margin: 0 }}>Reschedule Appointment</h3>
                 <X cursor="pointer" onClick={() => setRescheduleData(null)} />
               </div>
               <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>New Date</label>
                  <input type="date" required value={rescheduleData.appointment_date} onChange={e => setRescheduleData({...rescheduleData, appointment_date: e.target.value})} style={inputStyle} />
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>New Time</label>
                  <input type="time" required value={rescheduleData.appointment_time} onChange={e => setRescheduleData({...rescheduleData, appointment_time: e.target.value})} style={inputStyle} />
                  <button type="submit" style={{ ...miniBtn, marginTop: '10px' }}>Confirm New Time</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppointmentTable = ({ data, type, onCheckIn, onCancel, onReschedule, toggleMenu, activeMenuId }) => (
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
          <td style={tdStyle}><span style={timeBadgeStyle}>{appt.appointment_time}</span></td>
          <td style={tdStyle}>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontWeight: '700', color: '#1e293b' }}>
      {appt.patient_name ? appt.patient_name : `Patient #${appt.patient_id}`}
    </span>
    <span style={{ fontSize: '11px', color: '#64748b' }}>PID: #{appt.patient_id}</span>
  </div>
</td>
          <td style={tdStyle}>{appt.doctor_name}</td>
          <td style={tdStyle}>
            <span style={type === 'waiting' ? statusBadgeGreen : statusBadgeBlue}>
              {type === 'waiting' ? 'In Queue' : 'Expected'}
            </span>
          </td>
          <td style={{ ...tdStyle, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {type === 'scheduled' && (
                <button onClick={() => onCheckIn(appt.id)} style={checkInBtnMini}>
                  <LogIn size={14} /> Check-In
                </button>
              )}
              <div onClick={(e) => toggleMenu(e, appt.id)} style={{ cursor: 'pointer', padding: '4px' }}>
                <MoreVertical size={18} color="#64748b" />
              </div>
            </div>

            <AnimatePresence>
              {activeMenuId === appt.id && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={dropdownMenuStyle}>
                  <button onClick={() => onReschedule(appt)} style={menuItemStyle}>
                    <Calendar size={14} /> Reschedule
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                  <button onClick={() => onCancel(appt.id)} style={{ ...menuItemStyle, color: '#ef4444' }}>
                    <XCircle size={14} /> Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </td>
        </tr>
      )) : (
        <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No patients found.</td></tr>
      )}
    </tbody>
  </table>
);

/* --- STYLES --- */

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

const AppointmentRow = ({ name, info, contact, visitType, consultant, regTime, status }) => (
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
    <td style={tdStyle}><ArrowRight size={16} color="#94a3b8" cursor="pointer" /></td>
  </tr>
);

// Global UI Constants
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const navItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', color: '#64748b', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', cursor: 'pointer' };
const navItemActive = { ...navItem, backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '700' };
const logoutBtn = { margin: '20px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `1px solid #fee2e2`, borderRadius: '12px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', backgroundColor: 'white' };
const avatarMini = { width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' };
const tableCardStyle = { background: 'white', padding: '32px', borderRadius: '24px', border: `1px solid #e2e8f0`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' };
const miniBtn = { padding: '10px 18px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', marginBottom: '8px' };
const searchWrapper = { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px' };
const searchInput = { border: 'none', padding: '14px 0', width: '100%', outline: 'none', fontWeight: '600', fontSize: '14px' };
const iconBtn = { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '14px', cursor: 'pointer' };
const downloadBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'white', fontWeight: '700', color: '#475569', fontSize: '14px', cursor: 'pointer' };
const dropdownMenuStyle = { position: 'absolute', right: 0, top: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', width: '180px', zIndex: 100, overflow: 'hidden' };
const menuItemStyle = { width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' };
const filterDropdownStyle = { position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', width: '200px', zIndex: 100, padding: '8px' };
const filterHeader = { padding: '10px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const filterOptionStyle = (isActive) => ({ width: '100%', padding: '10px 12px', border: 'none', background: isActive ? '#f0fdf4' : 'none', borderRadius: '8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isActive ? '#059669' : '#475569', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
const statusBadgeGreen = { padding: '4px 10px', background: '#f0fdf4', color: '#059669', borderRadius: '8px', fontSize: '11px', fontWeight: '700' };
const statusBadgeBlue = { padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: '11px', fontWeight: '700' };
const timeBadgeStyle = { padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#1e293b' };
const checkInBtnMini = { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 };
const sideSheetStyle = { position: 'fixed', right: 0, top: 0, bottom: 0, width: '480px', backgroundColor: 'white', boxShadow: '-20px 0 50px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', zIndex: 1100 };
const avatarLarge = { width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800' };
const profileHeader = { padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const sectionTitle = { fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.05em' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const idBadge = { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b' };
const closeBtnStyle = { border: 'none', background: '#f1f5f9', color: '#64748b', padding: '8px', borderRadius: '10px', cursor: 'pointer' };
const miniTableContainer = { borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' };
const miniTh = { padding: '12px 16px', fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' };
const miniTd = { padding: '12px 16px', fontSize: '13px', color: '#475569' };
const emptyHistoryBox = { padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: '13px' };
const profileFooter = { padding: '24px 32px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' };
const editProfileBtn = { width: '100%', padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const placeholderCard = { padding: '100px', textAlign: 'center', background: 'white', borderRadius: '24px', color: '#94a3b8', fontWeight: '600' };
const modalContent = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' };

export default ReceptionistDashboard;