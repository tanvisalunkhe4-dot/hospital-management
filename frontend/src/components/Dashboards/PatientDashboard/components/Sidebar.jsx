import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, User, Calendar, 
  FileText, CreditCard, Power, Heart
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { id: 'overview', label: 'Health Overview', icon: LayoutGrid, path: '/patient-dashboard/overview' },
    { id: 'profile', label: 'Personal Profile', icon: User, path: '/patient-dashboard/profile' },
    { id: 'appointments', label: 'My Appointments', icon: Calendar, path: '/patient-dashboard/appointments' },
    { id: 'records', label: 'Medical Records', icon: FileText, path: '/patient-dashboard/records' },
    { id: 'billing', label: 'Bills & Payments', icon: CreditCard, path: '/patient-dashboard/billing' },
  ];
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <aside style={sidebarStyle}>
      {/* Brand Identity */}
      <div style={logoSection}>
        <div style={logoIcon}>
          <Heart size={24} color="#059669" fill="#059669" />
        </div>
        <div>
          <h2 style={logoText}>Nex<span style={{ color: '#059669' }}>Health</span></h2>
          <div style={badge}>PATIENT NODE</div>
        </div>
      </div>

      {/* Navigation Group */}
      <div style={navGroup}>
        <nav style={navLinks}>
          {menuItems.map((item) => (
            <NavLink 
              key={item.id}
              to={item.path}
              style={({ isActive }) => (isActive ? activeBtn : navBtn)}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Account & Terminate */}
      <div style={footerSection}>
        {/* ✅ Professional Terminate Button */}
        
        <button 
  style={{
    ...terminateBtn,
    ...(isHovered ? { backgroundColor: '#fff1f2', color: '#ef4444', borderColor: '#fee2e2' } : {})
  }}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onClick={() => {
    localStorage.clear();
    window.location.href = '/';
  }}
>
  <Power size={18} /> 
  <span>Terminate Session</span>
</button>
      </div>
    </aside>
  );
};

// ================== "ENTERPRISE NODE" THEME ==================

const sidebarStyle = { 
  width: '280px', 
  backgroundColor: '#ffffff', 
  borderRight: '1px solid #e2e8f0', 
  display: 'flex', 
  flexDirection: 'column', 
  padding: '40px 24px 20px 24px', 
  height: '100vh',
  position: 'sticky', // This is the secret!
  top: 0,
  left: 0,
  flexShrink: 0, // Prevents the sidebar from getting squished
  zIndex: 1000,
  overflowY: 'auto', 
  msOverflowStyle: 'none',  /* IE and Edge */
  scrollbarWidth: 'none',
};
const hideScrollbarGlobal = `
  aside::-webkit-scrollbar {
    display: none;
  }
`;

const navGroup = { 
  flex: 1,
  marginBottom: '20px' // Ensures there's a gap before the footer
};
const logoSection = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px', paddingLeft: '8px' };
const logoIcon = { backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '16px', display: 'flex' };
const logoText = { fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' };
const badge = { fontSize: '10px', fontWeight: '800', color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: '8px', marginTop: '6px', display: 'inline-block', letterSpacing: '0.5px' };

const groupLabel = { fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px', paddingLeft: '12px' };

const navLinks = { display: 'flex', flexDirection: 'column', gap: '10px' }; // Increased gap between links

const navBtn = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '16px', 
  padding: '16px 20px', 
  color: '#64748b', 
  textDecoration: 'none',
  borderRadius: '16px', 
  transition: 'all 0.3s ease',
  fontSize: '16px', // Increased font size
  fontWeight: '600'
};

const activeBtn = { 
  ...navBtn, 
  backgroundColor: '#f0fdf4', 
  color: '#059669', 
  fontWeight: '700',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
};
// Replace your existing footerSection and terminateBtn styles with these:

const footerSection = { 
  paddingTop: '24px', 
  borderTop: '1px solid #f1f5f9',
  marginTop: 'auto' // This pushes the button to the bottom perfectly
};

const terminateBtn = { 
  width: '100%',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  gap: '12px', 
  color: '#64748b', // Subtle grey by default
  backgroundColor: '#f8fafc', 
  border: '1px solid #e2e8f0', 
  padding: '14px', 
  cursor: 'pointer', 
  fontSize: '14px', 
  fontWeight: '600',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
};



const userCard = { display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px' };
const avatar = { width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' };
const userName = { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 };
const userStatus = { fontSize: '13px', color: '#94a3b8', margin: 0 };
const userInfo = { lineHeight: '1.2' };



export default Sidebar;