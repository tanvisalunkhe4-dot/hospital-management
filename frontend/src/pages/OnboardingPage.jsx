import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme/theme'; 

const NexHealthOnboarding = ({ onLoginRedirect }) => {
  const [role, setRole] = useState(null);
  const [step, setStep] = useState(0);
  const [patientVerifyMethod, setPatientVerifyMethod] = useState('abha'); 

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(1);
  };

  return (
    <div style={{ 
      height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: theme.typography.fontFamily,
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 1. LAYER 1: Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(1px) grayscale(100%)', opacity: 0.15, zIndex: 0, transform: 'scale(1.1)' 
      }} />
      
      <div style={{ position: 'absolute', inset: 0, backgroundColor: theme.colors.primaryDark, opacity: 0.05, zIndex: 1 }} />

      {/* 2. LAYER 2: Logo */}
      <div style={{ marginBottom: theme.spacing.huge, textAlign: 'center', zIndex: theme.zIndex.base + 1 }}>
         <span style={{ fontSize: '1.8rem', fontWeight: theme.typography.weight.bold, color: theme.colors.text }}>
            Nex<span style={{ color: theme.colors.primary }}>Health</span>
         </span>
      </div>

      {/* 3. LAYER 3: Floating Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          width: '90%', maxWidth: '560px', backgroundColor: theme.colors.cardWhite,
          borderRadius: theme.borderRadius.lg, boxShadow: theme.boxShadow.dropdown, 
          padding: '64px 48px', border: `1px solid ${theme.colors.border}`,
          zIndex: theme.zIndex.base, position: 'relative'
        }}
      >
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={backButtonStyle}>‹ Back</button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: Role Selection */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: theme.typography.weight.bold, color: theme.colors.primaryDark, marginBottom: '8px' }}>
                  Create your free account
                </h1>
                <p style={{ color: theme.colors.subtitle, fontSize: theme.typography.fontSize.sm }}>
                  Join India's unified healthcare ecosystem. ABDM Middleware Certified.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <RoleSelectionButton title="Continue as Patient" icon="👤" onClick={() => handleRoleSelect('Patient')} />
                <RoleSelectionButton title="Continue as Practitioner" icon="🏥" onClick={() => handleRoleSelect('Practitioner')} />
              </div>

              <div style={{ marginTop: '32px', textAlign: 'center', borderTop: `1px solid ${theme.colors.divider}`, paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: theme.colors.subtitle }}>
                  Already have an account? {' '}
                  <span onClick={onLoginRedirect} style={linkStyle}>Log In</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Verification Form */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: theme.typography.weight.bold, color: theme.colors.text }}>
                  {role === 'Patient' ? 'Link ABDM Record' : 'Facility Administration'}
                </h2>
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.subtitle, marginTop: '4px' }}>
                  {role === 'Patient' 
                    ? 'Authentication is conducted via OTP through NHA registries.' 
                    : 'Register as the primary administrator for your facility.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {role === 'Patient' ? (
                  <>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                       <VerificationSubOption title="ABHA ID" active={patientVerifyMethod === 'abha'} onClick={() => setPatientVerifyMethod('abha')} />
                       <VerificationSubOption title="Mobile Number" active={patientVerifyMethod === 'contact'} onClick={() => setPatientVerifyMethod('contact')} />
                    </div>
                    <label style={labelStyle}>{patientVerifyMethod === 'abha' ? 'ABHA Number' : 'Mobile Number'}</label>
                    <input type="text" placeholder={patientVerifyMethod === 'abha' ? "XX-XXXX-XXXX-XXXX" : "+91-XXXXXXXXXX"} style={inputStyle} />
                    <button style={primaryButtonStyle}>Create Patient Account</button>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '4px' }}>
                      <label style={labelStyle}>Hospital / HFR ID</label>
                      <input type="text" placeholder="e.g. HFR-1002-4452" style={inputStyle} />
                    </div>

                    <div style={infoBoxStyle}>
                      <p style={{ fontSize: '12px', color: theme.colors.primaryDark, margin: 0, lineHeight: '1.5' }}>
                        <b>Note:</b> This path is for <b>Hospital Admins only</b>. Once registered, you can invite Doctors, HODs, and Staff from your dashboard.
                      </p>
                    </div>

                    <button style={primaryButtonStyle}>Register Facility Admin</button>
                    
                    <p style={{ textAlign: 'center', fontSize: '13px', color: theme.colors.muted }}>
                      Are you a Doctor or Staff? <br/>
                      <span style={{ fontWeight: '600', color: theme.colors.text }}>Please use the invite link sent to your email.</span>
                    </p>
                  </>
                )}

                <p style={{ textAlign: 'center', fontSize: '13px', color: theme.colors.muted, marginTop: '16px' }}>
                  By clicking, you agree to the <span style={linkStyle}>Terms of Use</span> and <span style={linkStyle}>Privacy Policy</span>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. LAYER 4: Badges */}
      <div style={badgeContainerStyle}>
         <TrustBadge label="ABDM MIDDLEWARE" />
         <TrustBadge label="HIPAA SECURE" />
         <TrustBadge label="NHA CERTIFIED" />
      </div>
    </div>
  );
};

// --- STYLES & HELPERS ---

const infoBoxStyle = {
  padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', 
  border: `1px solid #dcfce7`, marginBottom: '8px'
};

const backButtonStyle = { 
  position: 'absolute', top: '24px', left: '24px', background: 'none', border: 'none', 
  color: theme.colors.primary, fontWeight: '600', cursor: 'pointer', fontSize: '14px' 
};

const roleButtonStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
  padding: '16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`,
  backgroundColor: '#fff', cursor: 'pointer', transition: '0.2s', width: '100%'
};

const inputStyle = {
  width: '100%', padding: '16px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`,
  fontSize: '16px', marginTop: '8px', outline: 'none', boxSizing: 'border-box', background: '#f9fafb'
};

const labelStyle = { fontSize: '13px', fontWeight: '600', color: theme.colors.text, display: 'block' };

const primaryButtonStyle = {
  width: '100%', padding: '16px', background: theme.colors.buttonGradient, color: 'white', border: 'none', 
  borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '12px',
  boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.2)' 
};

const linkStyle = { color: theme.colors.primary, cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' };

const badgeContainerStyle = { marginTop: '40px', display: 'flex', gap: '32px', opacity: 0.5, filter: 'grayscale(100%)', zIndex: 10 };

const RoleSelectionButton = ({ title, icon, onClick }) => (
  <button onClick={onClick} style={roleButtonStyle}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <span style={{ fontWeight: '500', color: theme.colors.text }}>{title}</span>
  </button>
);

const VerificationSubOption = ({ title, active, onClick }) => (
  <button onClick={onClick} style={{
      flex: 1, padding: '12px', borderRadius: '8px', 
      border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`, 
      background: active ? theme.colors.primaryLight : '#fff',
      color: active ? theme.colors.primaryDark : theme.colors.subtitle,
      fontWeight: '600', cursor: 'pointer', fontSize: '13px'
    }}>
    {title}
  </button>
);

const TrustBadge = ({ label }) => (
  <span style={{ fontSize: '10px', fontWeight: 'bold', color: theme.colors.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
);

export default NexHealthOnboarding;