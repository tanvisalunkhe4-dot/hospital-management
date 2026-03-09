import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme/theme'; 

const ADMIN_PIN = "1234"; // Your existing PIN logic

const AddHospitalModal = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: '', 
    hfrId: '', 
    email: '', 
    phone: '',
    category: 'Private', 
    type: 'Multi-Specialty',
    address: '',
    city: '',
    state: 'Maharashtra',
    licenseNo: '',
    bedCapacity: ''
  });

  const handleVerify = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid Admin Credentials");
      setPinInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        style={isAuthenticated ? largeModalStyle : modalStyle}
      >
        
        <div style={headerStyle}>
          <div>
            <h2 style={{ color: theme.colors.primaryDark, margin: 0 }}>
              {isAuthenticated ? "Register New Healthcare Facility" : "Admin Verification"}
            </h2>
            {isAuthenticated && <p style={{ fontSize: '13px', color: theme.colors.subtitle, margin: '4px 0 0 0' }}>Super Admin Portal: Facility Onboarding</p>}
          </div>
          <button onClick={() => { setIsAuthenticated(false); onClose(); }} style={closeButtonStyle}>✕</button>
        </div>

        {!isAuthenticated ? (
          /* --- (Your Existing Password Step Remains Untouched) --- */
          <div style={formGridStyle}>
            <p style={{ fontSize: '14px', color: theme.colors.subtitle }}>Please enter your Super Admin PIN to continue.</p>
            <input 
              type="password" 
              placeholder="Enter PIN" 
              style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            {error && <p style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>{error}</p>}
            <button style={primaryButtonStyle} onClick={handleVerify}>Verify Identity</button>
          </div>
        ) : (
          /* --- UPDATED PROFESSIONAL LARGE FORM --- */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section 1: Official Identity */}
            <div style={sectionContainer}>
              <h4 style={sectionTitle}>Facility Identity (ABDM)</h4>
              <div style={grid2}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Hospital Name (Legal)</label>
                  <input type="text" placeholder="e.g. Apollo Healthcare" style={inputStyle} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>ABDM HFR ID</label>
                  <input type="text" placeholder="HFR-XXXX-XXXX" style={inputStyle} onChange={(e) => setFormData({...formData, hfrId: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Admin Details */}
            <div style={sectionContainer}>
              <h4 style={sectionTitle}>Primary Contact (For Invite)</h4>
              <div style={grid2}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Admin Email</label>
                  <input type="email" placeholder="admin@hospital.com" style={inputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="text" placeholder="+91 XXXXX XXXXX" style={inputStyle} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Section 3: Operational Details */}
            <div style={sectionContainer}>
              <h4 style={sectionTitle}>Operational Scale</h4>
              <div style={grid3}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Facility Type</label>
                  <select style={inputStyle} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option>Multi-Specialty</option>
                    <option>General Hospital</option>
                    <option>Clinic</option>
                    <option>Diagnostic Center</option>
                  </select>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Bed Capacity</label>
                  <input type="number" placeholder="0" style={inputStyle} onChange={(e) => setFormData({...formData, bedCapacity: e.target.value})} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option>Private</option>
                    <option>Government</option>
                    <option>Semi-Govt</option>
                    <option>NGO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Physical Address */}
            <div style={sectionContainer}>
              <h4 style={sectionTitle}>Location Information</h4>
              <div style={inputGroup}>
                <label style={labelStyle}>Full Address</label>
                <input type="text" placeholder="Street, Building, Area" style={inputStyle} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{...grid2, marginTop: '12px'}}>
                <div style={inputGroup}>
                  <label style={labelStyle}>City</label>
                  <input type="text" placeholder="City" style={inputStyle} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>State</label>
                  <input type="text" value={formData.state} style={inputStyle} readOnly />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                style={{ ...primaryButtonStyle, background: '#e5e7eb', color: '#374151' }} 
                onClick={() => setIsAuthenticated(false)}
              >
                Back to Verification
              </button>
              <button 
                style={primaryButtonStyle} 
                onClick={() => { console.log("Onboarding Hospital:", formData); onClose(); }}
              >
                Onboard Facility & Send Invite
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- UPDATED STYLES ---

const largeModalStyle = { 
  width: '95%', 
  maxWidth: '800px', 
  backgroundColor: '#fff', 
  padding: '40px', 
  borderRadius: theme.borderRadius.lg, 
  boxShadow: theme.boxShadow.dropdown,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const sectionContainer = {
  padding: '20px',
  borderRadius: '8px',
  border: `1px solid ${theme.colors.border}`,
  backgroundColor: '#f9fafb'
};

const sectionTitle = {
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: theme.colors.primary,
  marginTop: 0,
  marginBottom: '16px',
  fontWeight: '700'
};

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };

// --- Reused styles ---
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(6px)' };
const modalStyle = { width: '95%', maxWidth: '400px', backgroundColor: '#fff', padding: '40px', borderRadius: theme.borderRadius.lg, boxShadow: theme.boxShadow.dropdown };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '16px' };
const closeButtonStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.colors.muted };
const formGridStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: theme.colors.text };
const inputStyle = { width: '100%', padding: '12px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '14px' };
const primaryButtonStyle = { flex: 1, padding: '14px', background: theme.colors.buttonGradient, color: 'white', border: 'none', borderRadius: theme.borderRadius.sm, fontWeight: 'bold', cursor: 'pointer' };

export default AddHospitalModal;