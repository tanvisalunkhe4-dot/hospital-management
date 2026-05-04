import React, { useState, useRef, useEffect } from 'react';
import { useUser } from "../../../../UserContext";
import { Bell, Settings, User, Camera, X, LogOut, ChevronRight, ShieldCheck, Lock, Download, Eye,EyeOff, Building2, Activity, Database,  } from 'lucide-react';
import axios from 'axios';

const AdminHeader = ({ userData, onProfileUpdated }) => {
  const { profileImage, setProfileImage } = useUser();
  const fileInputRef = useRef(null);
  
  // UI States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 1. LIVE FORM DATA: Initialize with userData from backend
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync state when live userData prop updates
  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department_name || 'Administration'
      });
    }
  }, [userData]);

  // 2. LIVE NOTIFICATIONS: Fetch system logs from backend
  useEffect(() => {
    const fetchSystemLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/v1/admin/system-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data); 
      } catch (err) {
        console.error("Could not fetch live logs");
      }
    };
    if (isNotificationOpen) fetchSystemLogs();
  }, [isNotificationOpen]);

  // 3. LIVE IMAGE UPLOAD (Admin Endpoint)
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('file', file);

    setIsUpdating(true);
try {
  const token = localStorage.getItem('token');
  const res = await axios.post(
    'http://localhost:8000/api/v1/admin/upload-profile-image', 
    uploadData, 
    {
      headers: { 
        'Content-Type': 'multipart/form-data', 
        Authorization: `Bearer ${token}` 
      }
    }
  );

  // 🟢 MATCH THE KEY: Backend returns 'profile_url', not 'image_url'
  const newImageUrl = `http://localhost:8000${res.data.profile_url}`;
  
  setProfileImage(newImageUrl); // Update global context
  alert("Admin Avatar Updated Successfully!");
} catch (err) {
  console.error(err);
  alert("Failed to save image to server. Check terminal for 404/500 errors.");
} finally {
  setIsUpdating(false);
}
  };

  // 4. LIVE PASSWORD UPDATE
  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/v1/admin/profile/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Security credentials updated.");
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.detail || "Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminExport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // This is vital for PDF files
      });

      // Creates the download link for the PDF blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NexHealth_Revenue_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Operational Error: Could not generate live audit. Ensure Backend is active.");
    }
  };

 
  const avatarLetter = userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <header style={headerContainer}>
        <div style={branchBranding}>
          <Building2 size={20} color="#10b981" />
          <span style={branchText}>{userData?.hospital_name || "NexHealth Master Node"}</span>
        </div>

        <div style={{ flex: 1 }} /> 

        <div style={profileGroup}>
          {/* Settings Icon */}
          <button 
            onClick={() => {
              setIsProfileOpen(true);
              setActiveTab('settings');
            }} 
            style={actionButton}
            title="System Configuration"
          >
            <Settings size={19} strokeWidth={2.5} />
          </button>

          {/* Notification Icon */}
          <button 
            onClick={() => setIsNotificationOpen(true)} 
            style={actionButton}
            title="System Logs"
          >
            <div style={notificationBadge} />
            <Bell size={19} strokeWidth={2.5} />
          </button>

          <div style={verticalDivider} />

          <div style={identityWrapper} onClick={() => setIsProfileOpen(true)}>
            <div style={textContainer}>
              <div style={statusWrapper}>
                <div style={onlineIndicator} />
                <span style={nameText}>{userData?.full_name || "Admin"}</span>
              </div>
              <span style={adminBadge}>STAFF ID: {userData?.id || "ADM-00"}</span>
            </div>
            <div style={adminAvatarSquare}>
              {/* Fallback chain: context state -> userData prop -> Initial letter */}
              {profileImage || userData?.profile_url ? (
                <img 
                  src={profileImage || `http://localhost:8000${userData.profile_url}`} 
                  alt="Admin" 
                  style={avatarImgSmall} 
                />
              ) : (
                avatarLetter
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer (Live Logs) */}
      {isNotificationOpen && (
        <div style={drawerOverlay} onClick={() => setIsNotificationOpen(false)}>
          <div style={drawerPanel} onClick={e => e.stopPropagation()}>
            <div style={drawerHeader}>
              <h3 style={drawerTitle}>Live System Logs</h3>
              <button onClick={() => setIsNotificationOpen(false)} style={closeBtn}><X size={20}/></button>
            </div>
            <div style={drawerList}>
              {notifications.length > 0 ? notifications.map(log => (
                <div key={log.id} style={drawerItem}>
                  <div style={drawerIconWrap}><Activity size={14} color="#10b981" /></div>
                  <div>
                    <div style={drawerItemTitle}>{log.title}</div>
                    <div style={drawerItemDesc}>{log.desc}</div>
                  </div>
                </div>
              )) : <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px'}}>No active logs recorded</p>}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div style={modalOverlay} onClick={() => setIsProfileOpen(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Admin Control Center</h3>
              <button onClick={() => setIsProfileOpen(false)} style={closeBtn}><X size={20}/></button>
            </div>

            <div style={modalBody}>
              <div style={imageUploadSection}>
                <div style={largeAvatar} onClick={() => fileInputRef.current.click()}>
                  {profileImage || userData?.profile_url ? (
                    <img src={profileImage || `http://localhost:8000${userData.profile_url}`} style={avatarImgLarge} alt="Admin" />
                  ) : (
                    avatarLetter
                  )}
                  <div style={cameraBadge}><Camera size={16} /></div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                <div style={uploadHint}>Click to update professional avatar</div>
              </div>

              <div style={tabNav}>
                <button onClick={() => {setActiveTab('profile'); setShowPasswordChange(false);}} style={activeTab === 'profile' ? activeTabBtn : tabBtn}>Authority</button>
                <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? activeTabBtn : tabBtn}>Settings</button>
              </div>

              {activeTab === 'profile' ? (
                <div style={contentGrid}>
                  <div style={rowGrid}>
                    <div style={formGroup}>
                      <label style={inputLabel}>Full Name</label>
                      <input 
                        style={inputField} 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                      />
                    </div>
                    <div style={formGroup}>
                      <label style={inputLabel}>Access Role</label>
                      <input style={readOnlyInput} value={userData?.role || "System Admin"} readOnly />
                    </div>
                  </div>
                  <button style={saveBtn} onClick={() => alert("Changes Synchronized with Master Node")} disabled={isUpdating}>
                    {isUpdating ? "Processing..." : "Apply Operational Changes"}
                  </button>
                  <button style={logoutBtn} onClick={() => {localStorage.clear(); window.location.href='/';}}>
                    <LogOut size={16}/> Terminate Session
                  </button>
                </div>
              ) : (
                <div style={settingsSection}>
                  {!showPasswordChange ? (
                    <>
                      <div style={actionItem} onClick={() => setShowPasswordChange(true)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><Lock size={16} color="#64748b"/></div>
                          <span>Modify Security Credentials</span>
                        </div>
                        <ChevronRight size={16} color="#94a3b8"/>
                      </div>

                      <div style={actionItem} onClick={() => handleAdminExport('revenue')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><Download size={16} color="#3b82f6"/></div>
                          <span>Export Hospital Revenue Audit</span>
                        </div>
                        <Download size={16} color="#10b981"/>
                      </div>

                      <div style={actionItem} onClick={() => alert("Running Integrity Check...")}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><Database size={16} color="#10b981"/></div>
                          <span>Database Integrity Check</span>
                        </div>
                        <Activity size={16} color="#10b981"/>
                      </div>
                    </>
                  ) : (
<div style={contentGrid}>
   <button onClick={() => setShowPasswordChange(false)} style={backLink}>← Back to Settings </button>
   
   {/* Current Password */}
   <div style={formGroup}>
      <label style={inputLabel}>Current Password</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={showPasswords ? "text" : "password"} 
          style={inputField} 
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
        />
        <button 
          type="button"
          onClick={() => setShowPasswords(!showPasswords)} 
          style={eyeButtonStyle}
        >
          {showPasswords ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
        </button>
      </div>
   </div>

   {/* New Password */}
   <div style={formGroup}>
      <label style={inputLabel}>New Password</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={showPasswords ? "text" : "password"} 
          style={inputField} 
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
        />
        <button 
          type="button"
          onClick={() => setShowPasswords(!showPasswords)} 
          style={eyeButtonStyle}
        >
          {showPasswords ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
        </button>
      </div>
   </div>

   {/* Confirm New Password */}
   <div style={formGroup}>
      <label style={inputLabel}>Confirm New Password</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={showPasswords ? "text" : "password"} 
          style={inputField} 
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
        />
        <button 
          type="button"
          onClick={() => setShowPasswords(!showPasswords)} 
          style={eyeButtonStyle}
        >
          {showPasswords ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
        </button>
      </div>
   </div>

   <button style={saveBtn} onClick={handlePasswordUpdate} disabled={isUpdating}>
      {isUpdating ? "Updating..." : "Update Security Password"}
   </button>
</div>)}
                </div>  
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Admin Specific Styles (Add to your existing CSS block)
const branchBranding = { display: 'flex', alignItems: 'center', gap: '12px' };
const branchText = { fontWeight: '800', color: '#0f172a', fontSize: '15px', letterSpacing: '-0.3px' };
const adminBadge = { fontSize: '10px', color: '#10b981', fontWeight: '800', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', marginTop: '2px' };
const adminAvatarSquare = { width: '44px', height: '44px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' };
const backLink = { background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', textAlign: 'left', paddingBottom: '10px', fontWeight: 'bold' };


const headerContainer = { 
  height: '74px', margin: '20px 40px 0 40px', backgroundColor: 'rgba(255, 255, 255, 0.85)', 
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(241, 245, 249, 0.7)', 
  borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 30px', position: 'sticky', top: '20px', 
  zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)', transition: 'all 0.4s ease' 
};
const contentGrid = { display: 'flex', flexDirection: 'column', gap: '15px' };
const rowGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const avatarImg = { width: '100%', height: '100%', borderRadius: '30px', objectFit: 'cover' };
const settingsSection = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' };
const footerActions = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' };
const saveBtn = { width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' };
const logoutBtn = { width: '100%', padding: '14px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const tabNav = { display: 'flex', gap: '20px', borderBottom: '1px solid #f1f5f9', marginBottom: '25px' };
const tabBtn = { 
  padding: '10px 5px', 
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '2px solid transparent', // Use transparent as the base
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
  borderBottom: '2px solid #10b981' // This now overwrites the same property (borderBottom)
};
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const avatarImgSmall = { width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' };
const avatarImgLarge = { width: '100%', height: '100%', borderRadius: '30px', objectFit: 'cover' };
const readOnlyInput = { width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '600', backgroundColor: '#f8fafc', color: '#94a3b8', outline: 'none' };

const settingsList = { display: 'flex', flexDirection: 'column', gap: '5px' };
const saveProfileBtn = { width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' };
const profileGroup = { display: 'flex', alignItems: 'center', gap: '20px' };
const activeActionBtn = { transform: 'translateY(-3px)', color: '#10b981', borderColor: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' };
const verticalDivider = { width: '1px', height: '30px', backgroundColor: '#f1f5f9' };
const identityWrapper = { display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.2s' };
const textContainer = { display: 'flex', flexDirection: 'column', textAlign: 'right' };
const nameText = { fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' };
const idBadge = { fontSize: '11px', color: '#10b981', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' };
const avatarSquare = { width: '44px', height: '44px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', transition: 'all 0.3s ease' };

// Modal Styles
const modalOverlay = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100vw', 
  height: '100vh', 
  backgroundColor: 'rgba(15, 23, 42, 0.4)', // Darkened slightly for better focus
  backdropFilter: 'blur(8px)', 
  zIndex: 2000, 
  display: 'flex', 
  justifyContent: 'center', // 🟢 Changed from flex-end to center
  alignItems: 'center',      // 🟢 Keeps it vertically centered
  padding: '20px' 
};
const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: '8px',
  transition: 'background 0.2s',
  // Adds a subtle hover effect
  '&:hover': {
    backgroundColor: '#f1f5f9'
  }
};
const modalContent = { 
  width: '480px',            // Slightly wider for the two-column grid
  maxHeight: '90vh', 
  overflowY: 'auto',
  backgroundColor: '#ffffff', 
  borderRadius: '32px',      // Softer corners for a premium feel
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
  padding: '30px',
  position: 'relative'
};


const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const modalTitle = { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 };
const closeBtn = { border: 'none', background: '#f1f5f9', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b' };
const modalBody = { display: 'flex', flexDirection: 'column' }; // FIXED: This was missing
const drawerOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(15, 23, 42, 0.2)',
  zIndex: 1900,
  display: 'flex',
  justifyContent: 'flex-end',
};
const drawerPanel = {
  width: '360px',
  height: '100vh',
  backgroundColor: '#ffffff',
  boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.15)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
const drawerHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const drawerTitle = { margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' };
const drawerList = { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' };
const drawerItem = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
};
const drawerIconWrap = {
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  backgroundColor: '#ecfdf5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const drawerItemTitle = { fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' };
const drawerItemDesc = { fontSize: '12px', color: '#64748b', lineHeight: '1.45' };
const imageUploadSection = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' };
const largeAvatar = { width: '100px', height: '100px', borderRadius: '30px', backgroundColor: '#10b981', color: '#fff', fontSize: '40px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' };
const cameraBadge = { position: 'absolute', bottom: '-5px', right: '-5px', width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f8fafc' };
const uploadHint = { fontSize: '12px', color: '#94a3b8', marginTop: '12px', fontWeight: '600' };
const formGroup = { marginBottom: '20px' };
const inputLabel = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px', marginLeft: '4px' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '14px', color: '#94a3b8' };
const actionList = { marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' };
const actionItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' };
const inputField = { 
  width: '100%', 
  padding: '12px', // Removed the 40px left padding to fit the new grid design
  borderRadius: '14px', 
  border: '1px solid #e2e8f0', 
  fontSize: '14px', 
  fontWeight: '600', 
  color: '#0f172a', 
  outline: 'none' 
};
const iconCircle = {
  width: '36px',
  height: '36px',
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};


const statusWrapper = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    justifyContent: 'flex-end' 
  };
  
  const onlineIndicator = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  };
  
  const notificationBadge = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '7px',
    height: '7px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid white'
  };
  
  const actionButton = { 
    position: 'relative',
    background: '#f8fafc', // Softer grey background
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    width: '42px', 
    height: '42px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    color: '#64748b', 
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffffff',
      color: '#10b981',
      borderColor: '#10b981',
      transform: 'translateY(-1px)'
    }
  };
const toggleStyle = {
  width: '34px',
  height: '18px',
  cursor: 'pointer',
  accentColor: '#10b981' // Medical green
};
export default AdminHeader;