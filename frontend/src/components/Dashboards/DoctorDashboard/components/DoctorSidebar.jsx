import React from 'react';
import { Users, FileText, Activity, Calendar, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';

const DoctorSidebar = ({ activeTab, setActiveTab, onLogout, doctorName = "Dr. Sneha Kulkarni" }) => {
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
      backgroundColor: '#ffffff',
      color: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      zIndex: 100
    },
    logoSection: {
      padding: '40px 32px',
      borderBottom: '1px solid #f1f5f9'
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
      backgroundColor: isActive ? '#ecfdf5' : 'transparent',
      color: isActive ? '#059669' : '#64748b',
      transition: 'all 0.2s ease',
      fontWeight: isActive ? '700' : '500',
      border: isActive ? '1px solid #d1fae5' : '1px solid transparent'
    }),
    logoutSection: {
      padding: '24px',
      borderTop: '1px solid #f1f5f9'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      cursor: 'pointer',
      color: '#ef4444',
      borderRadius: '12px',
      transition: 'background 0.2s ease',
      fontWeight: '600',
      fontSize: '14px'
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoSection}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', color: '#0f172a' }}>
          Nex<span style={{ color: '#10b981' }}>Health</span>
        </h1>
        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Doctor's Portal
        </p>
      </div>

      <nav style={styles.navContainer}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            style={styles.navItem(activeTab === item.id)} 
            onClick={() => setActiveTab(item.id)}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {React.cloneElement(item.icon, { 
                size: 20, 
                color: activeTab === item.id ? '#059669' : '#94a3b8' 
              })}
              <span>{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={16} color="#059669" />}
          </div>
        ))}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {doctorName.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{doctorName}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>NexHealth Specialist</p>
          </div>
        </div>
      </div>
       
      <div style={styles.logoutSection}>
        <div 
          style={styles.logoutBtn}
          onClick={onLogout}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
};

export default DoctorSidebar;