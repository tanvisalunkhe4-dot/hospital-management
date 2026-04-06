import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Calendar, Receipt, Search, 
  LogOut, LayoutDashboard, User, Bell, Settings,
  Users, CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../theme/theme'; 
import PatientRegistration from './PatientRegistration';

const ReceptionistDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [receptionistName, setReceptionistName] = useState('Staff Member');
  const [stats, setStats] = useState({ totalPatients: 0, appointmentsToday: 0 });
  const [recentPatients, setRecentPatients] = useState([]); 

  const sidebarWidth = '280px';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hospId = localStorage.getItem('hospital_id') || 1;
        
        const statsRes = await fetch(`http://localhost:8000/api/v1/receptionist/stats/${hospId}`);
        const statsData = await statsRes.json();
        setStats({
          totalPatients: statsData.total_patients || 0,
          appointmentsToday: statsData.appointments_today || 0
        });

        const patientsRes = await fetch(`http://localhost:8000/api/v1/receptionist/patients/recent`);
        const patientsData = await patientsRes.json();
        setRecentPatients(patientsData); 

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (currentView === 'overview') {
      fetchData();
    }
  }, [currentView]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'register', label: 'Register Patient', icon: <UserPlus size={18} /> },
    { id: 'appointments', label: 'Book Appointment', icon: <Calendar size={18} /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt size={18} /> },
    { id: 'search', label: 'Patient Search', icon: <Search size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: theme.typography.fontFamily }}>
      
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
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: theme.colors.text, margin: 0 }}>
              {menuItems.find(m => m.id === currentView)?.label}
            </h2>
            <p style={{ color: theme.colors.subtitle, margin: '4px 0 0' }}>Welcome back, {receptionistName}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={iconCircle}><Bell size={20} color={theme.colors.subtitle} /></div>
            <div style={iconCircle}><Settings size={20} color={theme.colors.subtitle} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', paddingLeft: '12px', borderLeft: `1px solid ${theme.colors.border}` }}>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{receptionistName}</p>
                 <p style={{ fontSize: '12px', color: theme.colors.subtitle, margin: 0 }}>ID: 22306142</p>
               </div>
               <div style={avatarStyle}><User size={20} color="white" /></div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {currentView === 'overview' && (
              <DashboardOverview 
                stats={stats} 
                recentPatients={recentPatients} 
                onAction={() => setCurrentView('register')} 
              />
            )}
            {currentView === 'register' && <PatientRegistration />}
            {currentView === 'appointments' && <div style={placeholderCard}>Appointment Module Coming Soon</div>}
            {currentView === 'billing' && <div style={placeholderCard}>Billing Module Coming Soon</div>}
            {currentView === 'search' && <div style={placeholderCard}>Patient Records Coming Soon</div>}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
};

/* --- SUB-COMPONENT: DASHBOARD OVERVIEW --- */
/* --- SUB-COMPONENT: DASHBOARD OVERVIEW --- */
const DashboardOverview = ({ onAction, stats, recentPatients }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <StatCard icon={<Users color="#059669" />} label="Total Patients" value={stats.totalPatients} trend="Live" />
        <StatCard icon={<Calendar color="#0891b2" />} label="Appointments Today" value={stats.appointmentsToday} trend="Today" />
        <StatCard icon={<CheckCircle color="#7c3aed" />} label="Consultations" value="0" trend="New" />
        <StatCard icon={<Clock color="#ea580c" />} label="Pending Bills" value="0" trend="Stable" />
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
                // 1. Calculate Age dynamically
                const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
                const gender = patient.gender ? patient.gender.charAt(0).toUpperCase() : 'U';
                
                // 2. Format the real Registration Time from the DB
                const regTime = patient.created_at 
                  ? new Date(patient.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A';
                
                return (
                  <AppointmentRow 
                    key={patient.id} 
                    name={`${patient.first_name} ${patient.last_name}`} 
                    info={`${age}y / ${gender}`}
                    contact={patient.phone_number}
                    visitType={patient.visit_type || "New Patient"} // REAL DATA
                    consultant={patient.doctor_name || "TBD"}       // REAL DATA
                    regTime={regTime}                               // REAL TIME
                    status={patient.status || "Registered"} 
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No recent registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */
const StatCard = ({ icon, label, value, trend }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid #e2e8f0`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', height: 'fit-content' }}>{trend}</span>
    </div>
    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: 0 }}>{label}</p>
    <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{value}</h4>
  </div>
);

const AppointmentRow = ({ name, info, contact, visitType, consultant, regTime, status }) => (
  <tr style={{ borderBottom: `1px solid #f8fafc` }}>
    <td style={tdStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontWeight: '600', color: '#334155' }}>{name}</span>
      </div>
    </td>
    <td style={tdStyle}>{info}</td>
    <td style={tdStyle}>{contact}</td>
    <td style={tdStyle}><span style={{ fontSize: '12px', color: '#64748b' }}>{visitType}</span></td>
    <td style={tdStyle}><span style={{ fontWeight: '500', color: '#0f172a' }}>{consultant}</span></td>
    <td style={tdStyle}><span style={{ fontSize: '12px', color: '#94a3b8' }}>{regTime}</span></td>
    <td style={tdStyle}>
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#f0fdf4', color: '#166534' }}>
        {status}
      </span>
    </td>
    <td style={tdStyle}><ArrowRight size={16} color="#94a3b8" cursor="pointer" /></td>
  </tr>
);

const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const navItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', color: '#64748b', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', cursor: 'pointer', transition: '0.2s' };
const navItemActive = { ...navItem, backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '700' };
const logoutBtn = { margin: '20px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `1px solid #fee2e2`, borderRadius: '12px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', backgroundColor: 'white' };
const iconCircle = { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'white' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableCardStyle = { background: 'white', padding: '32px', borderRadius: '24px', border: `1px solid #e2e8f0`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const miniBtn = { padding: '10px 18px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' };
const placeholderCard = { background: 'white', padding: '64px', borderRadius: '24px', border: `1px solid #e2e8f0`, textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '18px' };

export default ReceptionistDashboard;