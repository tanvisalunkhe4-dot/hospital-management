import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Bed, 
  ClipboardList, LogOut, Heart, 
  HeartPulse, Pill, FileSearch 
} from 'lucide-react';

const NurseSidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  const menuGroups = [
    {
      group: 'Clinical Operations',
      items: [
        { id: 'overview', label: 'Nurse Overview', icon: LayoutDashboard, path: '/nurse-dashboard/overview' },
        { id: 'ward', label: 'Ward Management', icon: Bed, path: '/nurse-dashboard/ward' },
      ]
    },
    {
      group: 'Patient Care',
      items: [
        { id: 'monitoring', label: 'Patient Monitoring', icon: Activity, path: '/nurse-dashboard/monitoring' },
        // NOTE: Check if you have created VitalsManagement.jsx in your /pages folder
        { id: 'vitals', label: 'Vitals Management', icon: HeartPulse, path: '/nurse-dashboard/vitals' },
        { id: 'treatment', label: 'Treatment Support', icon: Pill, path: '/nurse-dashboard/treatment' },
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'records', label: 'Records Access', icon: FileSearch, path: '/nurse-dashboard/records' },
        { id: 'notes', label: 'Nursing Notes', icon: ClipboardList, path: '/nurse-dashboard/notes' },
      ]
    }
  ];
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <aside style={sidebarStyle}>
      {/* Brand Identity */}
      <div style={logoSection}>
        <div style={logoIcon}>
          <Heart size={24} color="#059669" fill="#059669" />
        </div>
        <div>
          <h2 style={logoText}>Nex<span style={{ color: '#059669' }}>Health</span></h2>
          <div style={badge}>NURSE NODE</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div style={navGroup}>
        {menuGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '32px' }}>
            <h4 style={groupLabelStyle}>{group.group}</h4>
            <nav style={navLinks}>
              {group.items.map((item) => (
                <NavLink 
                  key={item.id}
                  to={item.path}
                  style={({ isActive }) => (isActive ? activeBtn : navBtn)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div style={footerSection}>
        <button 
          style={{
            ...terminateBtn,
            ...(isHovered ? terminateHover : {})
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleLogout}
        >
          <LogOut size={18} /> 
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

// ================== STYLING (Matching Screenshot) ==================
// Add this to your styles section at the bottom of NurseSidebar.jsx
const navGroup = { 
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px' // Provides spacing between Clinical, Patient Care, and Admin groups
};
const sidebarStyle = { 
  width: '280px', 
  backgroundColor: '#ffffff', 
  borderRight: '1px solid #f1f5f9', 
  display: 'flex', 
  flexDirection: 'column', 
  padding: '32px 24px', 
  height: '100vh',
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

const logoSection = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  marginBottom: '48px' 
};

const logoIcon = { 
  backgroundColor: '#f0fdf4', 
  padding: '10px', 
  borderRadius: '12px', 
  display: 'flex'
};

const logoText = { 
  fontSize: '22px', 
  fontWeight: '800', 
  color: '#1e293b', 
  margin: 0, 
  letterSpacing: '-0.5px' 
};

const badge = { 
  fontSize: '10px', 
  fontWeight: '700', 
  color: '#059669', 
  background: '#d1fae5', 
  padding: '2px 8px', 
  borderRadius: '4px', 
  display: 'inline-block' 
};

const groupLabelStyle = { 
  fontSize: '11px', 
  fontWeight: '700', 
  color: '#94a3b8', 
  textTransform: 'uppercase', 
  letterSpacing: '1px', 
  marginBottom: '16px',
  paddingLeft: '12px'
};

const navLinks = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '4px' 
};

const navBtn = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  padding: '12px 16px', 
  color: '#64748b', 
  textDecoration: 'none',
  borderRadius: '8px', 
  transition: 'all 0.2s ease',
  fontSize: '14px', 
  fontWeight: '600'
};

const activeBtn = { 
  ...navBtn, 
  backgroundColor: '#f0fdf4', 
  color: '#059669', 
  boxShadow: 'inset 0 0 0 1px #d1fae5'
};

const footerSection = { 
  marginTop: 'auto',
  paddingTop: '20px', 
  borderTop: '1px solid #f1f5f9' 
};

const terminateBtn = { 
  width: '100%',
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  color: '#64748b',
  backgroundColor: '#f8fafc', 
  border: '1px solid #e2e8f0', 
  padding: '12px', 
  cursor: 'pointer', 
  fontSize: '14px', 
  fontWeight: '600',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
};

const terminateHover = {
  backgroundColor: '#fff1f2',
  color: '#ef4444',
  borderColor: '#fee2e2'
};

export default NurseSidebar;