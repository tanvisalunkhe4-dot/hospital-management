import React from 'react';
import { Users, FileText, Activity, Calendar, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';

const DoctorSidebar = ({ activeTab, setActiveTab, doctorName }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'queue', label: 'Patient Queue', icon: <Users size={20} /> },
    { id: 'records', label: 'Medical Records', icon: <FileText size={20} /> },
    { id: 'reports', label: 'Lab Reports', icon: <Activity size={20} /> },
    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={20} /> },
  ];

  const styles = {
    sidebar: {
      width: '280px',
      backgroundColor: '#064e3b', // Deep Doctor Green
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
    },
    logoSection: {
      padding: '40px 32px',
      borderBottom: '1px solid #065f46'
    },
    navContainer: {
      flex: 1,
      padding: '24px 16px'
    },
    navItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderRadius: '12px',
      cursor: 'pointer',
      marginBottom: '8px',
      backgroundColor: isActive ? '#10b981' : 'transparent', // Brighter accent green for active
      color: isActive ? 'white' : '#a7f3d0',
      transition: 'all 0.2s ease',
      fontWeight: isActive ? '700' : '500'
    }),
    logoutSection: {
      padding: '24px',
      borderTop: '1px solid #065f46'
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoSection}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
          Nex<span style={{ color: '#10b981' }}>Health</span>
        </h1>
        <p style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
          Doctor's Portal
        </p>
      </div>

      <nav style={styles.navContainer}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            style={styles.navItem(activeTab === item.id)} 
            onClick={() => setActiveTab(item.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={16} />}
          </div>
        ))}
      </nav>

      <div style={styles.logoutSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', color: '#fecaca' }}>
          <LogOut size={20} />
          <span style={{ fontWeight: '600' }}>Sign Out</span>
        </div>
      </div>
    </aside>
  );
};

export default DoctorSidebar;