import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Building2, ShieldCheck, 
  Database, Lock, Smartphone, Mail, ChevronRight 
} from 'lucide-react';
import theme from '../theme/theme'; 

const NexHealthOnboarding = ({ onLoginRedirect }) => {
  const [role, setRole] = useState(null);
  const [step, setStep] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  
  // Patient-specific sub-method
  const [patientMethod, setPatientMethod] = useState('phone'); 

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(1);
  };

  const handleSignup = async () => {
    // 1. Frontend Validation
    if (!identifier || !password) {
      alert("Please fill in all security fields.");
      return;
    }
 

    setIsLoading(true);
    try {
      // 2. Prepare Payload for FastAPI
      // For Admin: Identifier is the HFR ID
      // For Patient: Identifier is Phone/Email
      const payload = {
        role: role,
        identifier: identifier,
        password: password,
        hospital_id: role === 'Admin' ? identifier : null 
      };

      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Success Feedback
        alert(`Successfully registered as ${role}!`);
        onLoginRedirect(); 
      } else {
        // 4. Detailed Error from Backend (e.g. "Hospital ID not found")
        alert(`Registration Error: ${data.detail || "Server error"}`);
      }
    } catch (err) {
      alert("Network Error: Could not connect to NexHealth API.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      {/* Animated Background Grid */}
      <motion.div 
        animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={gridLayer} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={logoContainerStyle}
      >
         <span style={logoTextStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        style={cardStyle}
      >
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={backButtonStyle}>
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={headerTextStyle}>
                <h1 style={titleStyle}>Join NexHealth</h1>
                <p style={subtitleStyle}>Select your portal to begin your digital healthcare journey.</p>
              </div>

              <div style={flexColumnGap}>
                <RoleButton 
                  title="Patient Portal" 
                  desc="Access your Ayushman Bharat health records." 
                  icon={<User size={24} />} 
                  onClick={() => handleRoleSelect('Patient')} 
                />
                <RoleButton 
                  title="Hospital Admin" 
                  desc="Register your facility and manage medical staff." 
                  icon={<Building2 size={24} />} 
                  onClick={() => handleRoleSelect('Admin')} 
                />
              </div>

              <div style={footerDividerStyle}>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Already have an account? <span onClick={onLoginRedirect} style={linkStyle}>Log In</span>
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={stepTitleStyle}>{role === 'Patient' ? 'Patient Sign Up' : 'Admin Registration'}</h2>
                <p style={stepSubtitleStyle}>
                  {role === 'Patient' 
                    ? 'Use your personal contact details to register.' 
                    : 'Enter your verified Hospital HFR ID to link the facility.'}
                </p>
              </div>

              <div style={flexColumnGap}>
                {role === 'Patient' && (
                  <div style={methodToggleGroup}>
                    <MethodToggle 
                      active={patientMethod === 'phone'} 
                      onClick={() => setPatientMethod('phone')} 
                      icon={<Smartphone size={14} />} 
                      label="Phone" 
                    />
                    <MethodToggle 
                      active={patientMethod === 'email'} 
                      onClick={() => setPatientMethod('email')} 
                      icon={<Mail size={14} />} 
                      label="Email" 
                    />
                  </div>
                )}

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>
                    {role === 'Patient' 
                      ? (patientMethod === 'phone' ? 'Mobile Number' : 'Personal Email') 
                      : 'Hospital Registration (HFR ID)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={role === 'Patient' 
                        ? (patientMethod === 'phone' ? '+91 XXXXX XXXXX' : 'name@example.com') 
                        : 'e.g. HOSP-MH-1029'} 
                      style={inputStyle} 
                    />
                    <div style={inputIconStyle}>
                       {role === 'Admin' ? <Building2 size={16} /> : (patientMethod === 'phone' ? <Smartphone size={16} /> : <Mail size={16} />)}
                    </div>
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Security Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      style={inputStyle} 
                    />
                    <Lock size={16} style={inputIconStyle} />
                  </div>
                </div>

                {/* ABDM Consent Checkbox */}
            

                <button 
                  style={{...primaryButtonStyle, opacity: isLoading ? 0.7 : 1}} 
                  onClick={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : `Complete ${role} Signup`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={badgeContainerStyle}>
         <div style={trustItem}><ShieldCheck size={14} /> ABDM COMPLIANT</div>
         <div style={trustItem}><Database size={14} /> AES-256 ENCRYPTED</div>
      </div>
    </div>
  );
};

// --- STYLES (Keep existing but update primaryButtonStyle and inputStyle) ---
const pageContainerStyle = { height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" };
const gridLayer = { position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, black, transparent)' };
const logoContainerStyle = { marginBottom: '32px', zIndex: 2 };
const logoTextStyle = { fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.04em' };
const cardStyle = { width: '90%', maxWidth: '480px', backgroundColor: '#fff', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '48px', border: '1px solid #f1f5f9', zIndex: 2, position: 'relative' };
const headerTextStyle = { textAlign: 'center', marginBottom: '32px' };
const titleStyle = { fontSize: '26px', fontWeight: '800', color: '#0f172a' };
const subtitleStyle = { color: '#64748b', fontSize: '14px', marginTop: '6px' };
const flexColumnGap = { display: 'flex', flexDirection: 'column', gap: '16px' };
const inputGroupStyle = { marginBottom: '12px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' };
const inputStyle = { width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', background: '#f8fafc', transition: '0.2s outline' };
const inputIconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const primaryButtonStyle = { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '12px', transition: '0.3s' };
const roleButtonStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' };
const backButtonStyle = { position: 'absolute', top: '20px', left: '24px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' };
const methodToggleGroup = { display: 'flex', gap: '8px', marginBottom: '8px' };
const linkStyle = { color: '#10b981', cursor: 'pointer', fontWeight: '700' };
const footerDividerStyle = { marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' };
const badgeContainerStyle = { marginTop: '32px', display: 'flex', gap: '24px', zIndex: 2 };
const trustItem = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' };
const consentRowStyle = { display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '4px' };
const checkboxStyle = { accentColor: '#10b981', marginTop: '3px' };
const consentTextStyle = { fontSize: '11px', color: '#64748b', lineHeight: '1.4', margin: 0 };
const stepTitleStyle = { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 };
const stepSubtitleStyle = { fontSize: '13px', color: '#64748b', marginTop: '4px' };

// Sub-components
const RoleButton = ({ title, desc, icon, onClick }) => (
  <motion.button whileHover={{ y: -4, borderColor: '#10b981' }} onClick={onClick} style={roleButtonStyle}>
    <div style={{ background: '#f0fdf4', color: '#10b981', padding: '12px', borderRadius: '10px' }}>{icon}</div>
    <div>
      <div style={{ fontWeight: '700', color: '#0f172a' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>{desc}</div>
    </div>
  </motion.button>
);

const MethodToggle = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px', borderRadius: '8px', border: `1px solid ${active ? '#10b981' : '#e2e8f0'}`,
    background: active ? '#f0fdf4' : '#fff', color: active ? '#10b981' : '#64748b',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  }}>
    {icon} {label}
  </button>
);

export default NexHealthOnboarding;