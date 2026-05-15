import React from 'react';
import { 
  ClipboardList, 
  FlaskConical, 
  Beaker, 
  FileText, 
  History, 
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LabSidebar = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userData = JSON.parse(sessionStorage.getItem('user_data')) || {};
  const staffId = userData.staff_id || "LAB-2026-061"; 

  const menuItems = [
    { id: 'requests', label: 'Test Requests', icon: <ClipboardList size={20}/>, path: '/lab-dashboard/requests' },
    { id: 'samples', label: 'Sample Collection', icon: <FlaskConical size={20}/>, path: '/lab-dashboard/samples' },
    { id: 'processing', label: 'Test Processing', icon: <Beaker size={20}/>, path: '/lab-dashboard/processing' },
    { id: 'reports', label: 'Reports', icon: <FileText size={20}/>, path: '/lab-dashboard/reports' },
    { id: 'history', label: 'Lab Records', icon: <History size={20}/>, path: '/lab-dashboard/history' },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div style={sidebarContainer}>
      {/* Brand Header Section */}
      <div style={headerSection}>
        <h1 style={logoStyle}>
          Nex<span style={{ color: '#10b981' }}>Health</span>
        </h1>
        <div style={roleBadge}>
          ID: {staffId} | LAB TECHNICIAN
        </div>
      </div>

      {/* Navigation Section */}
      <nav style={navSection}>
        {menuItems.map((item) => {
          // Check if current URL matches the item path for styling
          const isActive = location.pathname.includes(item.path);
          
          return (
            <div 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id); // 1. Swaps the component in LabDashboard
                navigate(item.path);   // 2. Updates the URL path
              }}
              style={{
                ...navItemStyle,
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                color: isActive ? '#10b981' : '#64748b',
                fontWeight: isActive ? '700' : '600', 
                borderLeft: isActive ? `4px solid #10b981` : '4px solid transparent'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>
                {item.icon}
              </span> 
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Sign Out Section */}
      <div style={footerSection}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          <LogOut size={20} /> <span style={{ fontWeight: '700' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// --- Styles ---

const sidebarContainer = {
  width: '280px',
  height: '100vh',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #f1f5f9',
  position: 'fixed', 
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 100,
  flexShrink: 0 
};

const headerSection = {
  padding: '40px 24px 32px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const logoStyle = {
  fontSize: '26px',
  fontWeight: '900',
  margin: 0,
  letterSpacing: '-0.8px',
  color: '#0f172a'
};

const roleBadge = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#10b981',
  backgroundColor: '#f0fdf4',
  padding: '4px 10px',
  borderRadius: '6px',
  display: 'inline-block',
  width: 'fit-content',
  textTransform: 'uppercase'
};

const navSection = {
  flex: 1,
  padding: '0 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 16px',
  borderRadius: '0 12px 12px 0',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  fontSize: '15px'
};

const footerSection = {
  padding: '32px 24px',
  borderTop: '1px solid #f8fafc'
};

const logoutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#ef4444',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '15px',
  transition: 'transform 0.2s',
};

export default LabSidebar;