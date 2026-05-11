import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, ShoppingCart, 
  Package, Users, AlertCircle, LogOut 
} from 'lucide-react';

const PharmacistSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/pharmacist' },
    { name: 'Prescriptions', icon: <ClipboardList size={20}/>, path: '/pharmacist/prescriptions' },
    { name: 'Dispensing', icon: <ShoppingCart size={20}/>, path: '/pharmacist/dispense' },
    { name: 'Inventory', icon: <Package size={20}/>, path: '/pharmacist/inventory' },
    { name: 'Suppliers', icon: <Users size={20}/>, path: '/pharmacist/suppliers' },
    { name: 'Stock Alerts', icon: <AlertCircle size={20}/>, path: '/pharmacist/alerts' },
  ];

  return (
    <div style={sidebarContainer}>
      <div style={logoSection}>
        <h2 style={logoText}>Nex<span>Health</span></h2>
        <small style={roleBadge}>PHARMACY DEPT</small>
      </div>

      <nav style={navStyle}>
        {menuItems.map((item) => (
          <div 
            key={item.name}
            onClick={() => navigate(item.path)}
            style={{
              ...navItem,
              backgroundColor: location.pathname === item.path ? '#10b981' : 'transparent',
              color: location.pathname === item.path ? '#fff' : '#64748b'
            }}
          >
            {item.icon}
            <span style={{fontWeight: '600'}}>{item.name}</span>
          </div>
        ))}
      </nav>

      <div style={logoutSection}>
        <div style={navItem} onClick={() => {sessionStorage.clear(); navigate('/login');}}>
          <LogOut size={20} color="#ef4444" />
          <span style={{color: '#ef4444', fontWeight: '700'}}>Logout</span>
        </div>
      </div>
    </div>
  );
};

const sidebarContainer = { width: '260px', height: '100vh', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '30px 20px' };
const logoSection = { marginBottom: '40px', textAlign: 'center' };
const logoText = { margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' };
const roleBadge = { color: '#10b981', fontWeight: '800', fontSize: '10px', letterSpacing: '1px' };
const navStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' };
const navItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' };
const logoutSection = { borderTop: '1px solid #f1f5f9', paddingTop: '20px' };

export default PharmacistSidebar;