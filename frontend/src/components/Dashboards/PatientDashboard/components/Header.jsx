import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../../../UserContext';
import { Bell, Settings, User, Camera, X, LogOut, ChevronRight, ShieldCheck, Lock, Download, Eye } from 'lucide-react';
import axios from 'axios';

const Header = ({ userData, onProfileUpdated }) => {
  const getImageWithCacheBust = (url) => {
    if (!url) return null;
    return url; // Keep it simple. The browser will handle the cache.
  };

  const { profileImage, setProfileImage } = useUser();
  const fileInputRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // New state for tabs
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  //password reset
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

  const avatarLetter = userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : 'P';

  //authentication
  const [showQRModal, setShowQRModal] = useState(false);
const [qrUri, setQrUri] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
const notificationItems = [
  { id: 1, title: 'Appointment Confirmed', desc: 'Your appointment is confirmed for tomorrow at 10:00 AM.' },
  { id: 2, title: 'Lab Report Uploaded', desc: 'Blood test report has been added to your Medical Vault.' },
  { id: 3, title: 'Medicine Reminder', desc: 'Time for your evening medicine dose.' },
];
  // Function to open directly to settings from header icon
const openSettings = () => {
  setActiveTab('settings');
  setIsProfileOpen(true);
};

const handleHeaderActionClick = (id) => {
  if (id === 'settings') {
    openSettings();
    return;
  }

  if (id === 'bell') {
    setIsNotificationOpen(true);
  }
};

useEffect(() => {
  localStorage.removeItem('patient_high_contrast_mode');
  document.body.style.filter = '';
  document.body.style.backgroundColor = '';
}, []);

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const token = localStorage.getItem('token');

  // 1. Prepare the file for the backend
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('http://localhost:8000/api/v1/patient/upload-profile-image', formData, {
       headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}` 
      }
    });

    // 3. 🟢 THE FIX: Save the permanent URL from the database into your state
    const permanentUrl = res.data.image_url;
    setProfileImage(permanentUrl);
    alert("Profile picture saved permanently!");
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Could not save image to database.");
  }
};

  const [formData, setFormData] = useState({
    full_name: userData?.full_name || '',
    phone_primary: '',
    phone_secondary: '', // The additional contact number
    email_professional: ''
     // Professional info field
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      full_name: userData?.full_name || ''
    }));
  }, [userData?.full_name]);
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true); // 🟢 Start loading
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/v1/patient/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (formData.full_name?.trim()) {
        onProfileUpdated?.({ full_name: formData.full_name.trim() });

        const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
        localStorage.setItem(
          'user_data',
          JSON.stringify({ ...storedUser, full_name: formData.full_name.trim() })
        );
      }

      alert("NexHealth Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Update failed. Please check your connection.");
    } finally {
      setIsUpdating(false); 
    }
  };

  const handleDataExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/patient/profile/export-pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for handling PDF files
      });
  
      // Create a download link for the PDF blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Medical_Record_${userData?.full_name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert("Your Medical Record PDF has been generated successfully.");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handle2FAToggle = async (isEnabled) => {
    if (isEnabled) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/v1/auth/2fa/setup', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // We use a free API to turn the URI into a scanable QR image
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(res.data.qr_uri)}`;
        setQrUri(qrImageUrl);
        setShowQRModal(true);
      } catch (err) {
        alert("Error initializing 2FA");
      }
    }
  };

  const confirm2FA = async () => {
    if (verificationCode.length !== 6) {
      alert("Please enter a valid 6-digit code.");
      return;
    }
  
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/v1/auth/2fa/verify', 
        { code: verificationCode }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("NexHealth Vault Secured! 2FA is now active.");
      setShowQRModal(false);
      setVerificationCode('');
      
      // 🟢 ADD THIS: Refresh the page to sync userData.is_2fa_enabled
      window.location.reload(); 
      
    } catch (error) {
      console.error("Verification failed:", error);
      alert(error.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
  
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      // 🟢 Keys match the 'PasswordUpdate' class in auth_schema.py exactly
      const payload = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword 
      };
  
      await axios.patch('http://localhost:8000/api/v1/patient/profile/change-password', 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("NexHealth Vault Password updated successfully!");
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Error details:", error.response?.data);
      alert(error.response?.data?.detail || "Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <header style={headerContainer}>
        <div style={{ flex: 1 }} /> 

        <div style={profileGroup}>
          {[ { Icon: Bell, id: 'bell' }, { Icon: Settings, id: 'settings' } ].map(({ Icon, id }) => (
            <button 
              key={id}
              onClick={() => handleHeaderActionClick(id)}
              onMouseEnter={() => setHoveredBtn(id)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{ ...actionButton, ...(hoveredBtn === id ? activeActionBtn : {}) }}
            >
              <Icon size={19} />
            </button>
          ))}
          
          <div style={verticalDivider} />

          <div 
            style={identityWrapper} 
            onClick={() => setIsProfileOpen(true)}
            onMouseEnter={() => setHoveredBtn('profile')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <div style={textContainer}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
    {userData?.is_2fa_enabled && <ShieldCheck size={14} color="#10b981" />}
    <span style={nameText}>{userData?.full_name || "Patient Name"}</span>
  </div>
  <span style={idBadge}>UHID: {userData?.id || "----"}</span>
</div>
            
            <div style={avatarSquare}>
            {profileImage ? (
  <img 
    src={getImageWithCacheBust(profileImage)} 
    alt="Profile" 
    style={avatarImgLarge} 
    onError={(e) => {
      e.target.style.display = 'none'; // Just hide the image
    }}
  />
) : (
  avatarLetter
)}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {isNotificationOpen && (
        <div style={drawerOverlay} onClick={() => setIsNotificationOpen(false)}>
          <div style={drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div style={drawerHeader}>
              <h3 style={drawerTitle}>Notifications</h3>
              <button style={closeBtn} onClick={() => setIsNotificationOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={drawerList}>
              {notificationItems.map((note) => (
                <div key={note.id} style={drawerItem}>
                  <div style={drawerIconWrap}>
                    <Bell size={14} color="#10b981" />
                  </div>
                  <div>
                    <div style={drawerItemTitle}>{note.title}</div>
                    <div style={drawerItemDesc}>{note.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div style={modalOverlay} onClick={() => setIsProfileOpen(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Patient Profile</h3>
              <button style={closeBtn} onClick={() => setIsProfileOpen(false)}><X size={20}/></button>
            </div>

            <div style={modalBody}>
            <div style={imageUploadSection}>
    <div style={largeAvatar} onClick={() => fileInputRef.current.click()}>
      {profileImage ? (
        <img src={getImageWithCacheBust(profileImage)} alt="Profile" style={avatarImgLarge} />
      ) : (
        avatarLetter
      )}
      <div style={cameraBadge}>
        <Camera size={16} />
      </div>
    </div>
    <input 
      type="file" 
      ref={fileInputRef} 
      onChange={handleImageUpload} 
      style={{ display: 'none' }} 
      accept="image/*" 
    />
    <div style={uploadHint}>Click to change profile picture</div>
  </div>

              <div style={tabNav}>
                <button onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? activeTabBtn : tabBtn}>Personal</button>
                <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? activeTabBtn : tabBtn}>Settings</button>
              </div>

              {activeTab === 'profile' ? (
                <div style={contentGrid}>
                  <div style={rowGrid}>
                    <div style={formGroup}>
                      <label style={inputLabel}>Full Name</label>
                      <input name="full_name" style={inputField} value={formData.full_name} onChange={handleInputChange} />
                    </div>
                    <div style={formGroup}>
                      <label style={inputLabel}>Personal UHID</label>
                      <input style={readOnlyInput} value={userData?.id} readOnly />
                    </div>
                  </div>

                  <div style={rowGrid}>
                    <div style={formGroup}>
                      <label style={inputLabel}>Secondary Contact</label>
                      <input name="phone_secondary" placeholder="+91 XXXXX XXXXX" style={inputField} onChange={handleInputChange} />
                    </div>
                    <div style={formGroup}>
                      <label style={inputLabel}>Professional Email</label>
                      <input name="email_professional" placeholder="work@example.com" style={inputField} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={footerActions}>
                    <button style={{...saveBtn, opacity: isUpdating ? 0.7 : 1}} onClick={handleUpdateProfile} disabled={isUpdating}>
                      {isUpdating ? "Saving Changes..." : "Update Profile"}
                    </button>
                    <button style={logoutBtn} onClick={() => {localStorage.clear(); window.location.href='/';}}>
                      <LogOut size={16}/> Logout Session
                    </button>
                  </div>
                </div>
              ) : (
                <div style={settingsSection}>
                  {!showPasswordChange ? (
                    <>
                      <div style={actionItem} onClick={() => setShowPasswordChange(true)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><Lock size={16} color="#64748b"/></div>
                          <span>Change Password</span>
                        </div>
                        <ChevronRight size={16} color="#94a3b8"/>
                      </div>

                      <div style={actionItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><ShieldCheck size={16} color="#10b981"/></div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>Two-Factor Auth</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Secure your medical vault</div>
                          </div>
                        </div>
                        <input 
  type="checkbox" 
  style={toggleStyle} 
  // This ensures the switch stays "ON" if the database says it's on
  checked={userData?.is_2fa_enabled || false}
  onChange={(e) => handle2FAToggle(e.target.checked)} 
  // Disable it if already enabled to prevent accidentally resetting the secret
  disabled={userData?.is_2fa_enabled} 
/>
                      </div>

                      <div style={actionItem} onClick={handleDataExport}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconCircle}><Download size={16} color="#64748b"/></div>
                          <span>Export Medical Records (JSON)</span>
                        </div>
                        <Download size={16} color="#10b981"/>
                      </div>

                    </>
                  ) : (
                    <div style={contentGrid}>
  <button 
    onClick={() => setShowPasswordChange(false)} 
    style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', textAlign: 'left', padding: '0 0 10px 0', fontWeight: 'bold' }}
  >
    ← Back to Settings
  </button>
  
  {/* Helper function to render password fields with Eye toggle */}
  {[
    { label: "Current Password", key: "currentPassword" },
    { label: "New Password", key: "newPassword" },
    { label: "Confirm New Password", key: "confirmPassword" }
  ].map((field) => (
    <div style={formGroup} key={field.key}>
      <label style={inputLabel}>{field.label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={showPasswords ? "text" : "password"} 
          style={{ ...inputField, paddingRight: '45px' }} // Space for the icon
          placeholder={field.label} 
          value={passwordData[field.key]} 
          onChange={(e) => setPasswordData({...passwordData, [field.key]: e.target.value})} 
        />
        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          style={eyeButtonStyle}
        >
          {showPasswords ? <Eye size={18} color="#10b981" /> : <Eye size={18} color="#94a3b8" />}
        </button>
      </div>
    </div>
  ))}

  <button 
    style={{...saveBtn, marginTop: '10px', opacity: isUpdating ? 0.7 : 1}} 
    onClick={handlePasswordUpdate} 
    disabled={isUpdating}
  >
    {isUpdating ? "Updating..." : "Update Password"}
  </button>
</div>
                  )}
                </div>
              )}
            </div> {/* Closing modalBody */}
          </div> 
        </div> 
      )}
      {/* 2FA Verification Modal */}
{showQRModal && (
  <div style={modalOverlay} onClick={() => setShowQRModal(false)}>
    <div style={{...modalContent, width: '380px', textAlign: 'center'}} onClick={(e) => e.stopPropagation()}>
      <div style={modalHeader}>
        <h3 style={modalTitle}>Security Verification</h3>
        <button style={closeBtn} onClick={() => setShowQRModal(false)}><X size={20}/></button>
      </div>

      <p style={{fontSize: '13px', color: '#64748b', marginBottom: '20px'}}>
        Scan this QR code with <b>Google Authenticator</b> to link your medical vault.
      </p>

      <div style={{
        backgroundColor: '#f8fafc', 
        padding: '20px', 
        borderRadius: '24px', 
        display: 'inline-block',
        border: '1px solid #e2e8f0'
      }}>
        <img src={qrUri} alt="2FA QR" style={{ borderRadius: '12px' }} />
      </div>

      <div style={{marginTop: '25px', textAlign: 'left'}}>
        <label style={inputLabel}>Authenticator Code</label>
        <input 
          placeholder="Enter 6-digit code" 
          style={{...inputField, textAlign: 'center', letterSpacing: '4px', fontSize: '18px'}} 
          maxLength={6}
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))} // Only numbers
        />
      </div>

      <button 
        style={{...saveBtn, marginTop: '20px', opacity: isUpdating ? 0.7 : 1}} 
        onClick={confirm2FA}
        disabled={isUpdating}
      >
        {isUpdating ? "Verifying..." : "Confirm & Enable"}
      </button>
      
      <p style={{fontSize: '11px', color: '#94a3b8', marginTop: '15px'}}>
        Make sure you save your backup codes in a safe place.
      </p>
    </div>
  </div>
)}
    </>
  );
};// ================== ALL REQUIRED STYLES ==================

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
const actionButton = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.3s ease' };
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
  transition: 'background 0.2s'
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

const toggleStyle = {
  width: '34px',
  height: '18px',
  cursor: 'pointer',
  accentColor: '#10b981' // Medical green
};
export default Header;