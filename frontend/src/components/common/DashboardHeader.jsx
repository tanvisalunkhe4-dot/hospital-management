import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, Settings, ShieldCheck, LogOut, X, User, Camera } from 'lucide-react';

const DashboardHeader = ({ title, subtitle }) => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data') || '{}');
    } catch { return {}; }
  }, []);

  const [userData, setUserData] = useState(storedUser);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [fullName, setFullName] = useState(storedUser?.full_name || '');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const role = userData?.role || 'Staff';

  // --- Theme Logic based on Role ---
  const themeColor = role === 'Admin' ? '#3b82f6' : // Blue for Admin
                     role === 'Receptionist' ? '#f59e0b' : // Orange for Receptionist
                     '#10b981'; // Green for Nurse/Doctor/Patient

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setFullName(res.data?.full_name || '');
        localStorage.setItem('user_data', JSON.stringify(res.data));
      } catch (error) { console.error('Sync failed:', error); }
    };
    fetchMe();
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const displayName = userData?.full_name || "NexHealth User";
  const displayId = role === 'Patient' ? `UHID: ${userData?.id}` : `Staff: ${userData?.staff_id || '----'}`;

  return (
    <>
      <header style={headerContainer}>
        <div style={{ flex: 1 }}>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle || `Welcome back, ${role}`}</p>
        </div>

        <div style={rightGroup}>
          <button style={iconBtn} onClick={() => setIsNotificationsOpen(true)}><Bell size={18} /></button>
          <button style={iconBtn} onClick={() => setIsSettingsOpen(true)}><Settings size={18} /></button>
          
          <div style={divider} />
          
          <div style={identity} onClick={() => setIsSettingsOpen(true)}>
            <div style={{ textAlign: 'right' }}>
              <div style={nameText}>{displayName}</div>
              <div style={{ ...metaText, color: themeColor }}>{displayId}</div>
            </div>
            <div style={{ ...avatarBox, background: themeColor }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal (Matching your UI request) */}
      {isSettingsOpen && (
        <div style={overlay} onClick={() => setIsSettingsOpen(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={drawerHeader}>
              <h3 style={drawerTitle}>Account Settings</h3>
              <button style={closeBtn} onClick={() => setIsSettingsOpen(false)}><X size={18} /></button>
            </div>

            <div style={profileSection}>
                <div style={{...avatarLarge, background: themeColor}}>{displayName.charAt(0).toUpperCase()}</div>
                <div style={roleBadge}>{role} Portal Access</div>
            </div>

            <div style={formGrid}>
              <div>
                <label style={label}>Full Name</label>
                <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label style={label}>Registered Email</label>
                <input style={{ ...input, background: '#f8fafc' }} value={userData?.email || 'N/A'} readOnly />
              </div>
            </div>

            <div style={actions}>
              <button style={{...saveBtn, background: themeColor}} onClick={() => alert('Saved!')}>Update Profile</button>
              <button style={logoutBtn} onClick={handleLogout}><LogOut size={16} /> Secure Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- STYLES ---
const headerContainer = { height: '74px', margin: '20px 0', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 10, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' };
const subtitleStyle = { margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
const rightGroup = { display: 'flex', alignItems: 'center', gap: '12px' };
const iconBtn = { width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };
const divider = { width: 1, height: 28, background: '#e2e8f0', margin: '0 4px' };
const identity = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const nameText = { fontSize: '14px', fontWeight: 800, color: '#0f172a' };
const metaText = { fontSize: '10px', fontWeight: 800, letterSpacing: '0.3px' };
const avatarBox = { width: '40px', height: '40px', borderRadius: '10px', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' };
const modal = { width: '400px', background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const drawerHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const drawerTitle = { margin: 0, fontSize: '18px', fontWeight: 800 };
const profileSection = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' };
const avatarLarge = { width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 900 };
const roleBadge = { fontSize: '11px', fontWeight: 700, background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', color: '#475569' };
const formGrid = { display: 'grid', gap: '16px' };
const label = { fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' };
const input = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' };
const actions = { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' };
const saveBtn = { padding: '14px', borderRadius: '14px', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const logoutBtn = { 
  width: '100%', 
  padding: '14px', 
  backgroundColor: '#fff', 
  color: '#ef4444', 
  borderRadius: '16px', 
  fontWeight: '700', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '8px',
  border: '1px solid #fee2e2' // Ensure this is the ONLY border key here
};
const closeBtn = { border: 'none', background: '#f1f5f9', borderRadius: '8px', padding: '6px', cursor: 'pointer' };
const tabBtn = { 
  padding: '10px 5px', 
  // 🟢 CHANGE: Use specific properties instead of shorthand 'border'
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'transparent', 
  background: 'none', 
  fontSize: '14px', 
  fontWeight: '700', 
  color: '#94a3b8', 
  cursor: 'pointer', 
  transition: 'all 0.3s' 
};

const activeTabBtn = { 
  ...tabBtn, 
  color: '#10b981', 
  // 🟢 CHANGE: Only update the color, don't re-declare the whole border
  borderBottomColor: '#10b981' 
};
export default DashboardHeader;