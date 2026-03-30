import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, ShieldCheck, Info, Fingerprint, 
  ArrowLeft, KeyRound, RefreshCw, ChevronLeft 
} from 'lucide-react';
import theme from '../../theme/theme';
import logo from '../../assets/logo.png'; 
import abdmLogo from "../../assets/abdm_logo.png";

// --- 1. STYLES ---
const containerStyle = { 
  minHeight: '100vh', 
  background: 'radial-gradient(at top left, #f0fdf4, #ffffff)', 
  padding: '0 100px',
  fontFamily: '"Inter", sans-serif'
};

const navStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '10px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '40px'
};

const logoWrapper = { display: 'flex', alignItems: 'center' };
const hospitalLogoStyle = { height: '180px', width: 'auto' };
const abdmLogoStyle = { height: '180px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' };
const divider = { width: '2px', height: '45px', backgroundColor: '#cbd5e1', margin: '0 30px' };

const backBtn = { 
  display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', 
  border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '10px',
  color: '#475569', fontWeight: '700', cursor: 'pointer', transition: '0.2s'
};

const mainContent = { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '100px', alignItems: 'center' };

const tag = { 
  display: 'inline-block', background: '#d1fae5', color: '#065f46', 
  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', 
  marginBottom: '20px', textTransform: 'uppercase' 
};

const titleStyle = { fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, marginBottom: '25px' };
const descriptionStyle = { fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '40px' };

const formWrapper = { 
  background: '#fff', padding: '50px', borderRadius: '32px', 
  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
  position: 'relative'
};

const inputGroup = { marginBottom: '25px' };
const labelStyle = { display: 'block', fontWeight: '800', color: '#334155', fontSize: '13px', marginBottom: '8px' };
const inputStyle = { 
  width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
  fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
};

const alertBox = { 
  display: 'flex', gap: '12px', background: '#eff6ff', color: '#1e40af', 
  padding: '15px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '30px' 
};

const submitBtn = { 
  width: '100%', padding: '18px', background: theme.colors.buttonGradient, 
  color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', 
  fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', transition: '0.3s' 
};

const inlineBackBtn = {
  display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b',
  background: 'none', border: 'none', fontSize: '13px', fontWeight: '700',
  cursor: 'pointer', marginBottom: '20px', padding: 0
};

// --- 2. THE COMPONENT ---
const CreateAbha = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Aadhaar Form, 2: OTP
  const [timer, setTimer] = useState(60);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleGenerateOtp = () => {
    // In production, trigger your FastAPI endpoint here
    setStep(2);
    setTimer(60);
  };

  return (
    <div style={containerStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={logoWrapper}>
          <img src={logo} alt="NexHealth" style={hospitalLogoStyle} />
          <div style={divider} />
          <img src={abdmLogo} alt="ABDM Official" style={abdmLogoStyle} />
        </div>
        <button onClick={onBack} style={backBtn}>
          <ArrowLeft size={20} /> Return to Dashboard
        </button>
      </nav>

      <div style={mainContent}>
        {/* Left Info Column */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div style={tag}>Official ABDM Integration</div>
          <h1 style={titleStyle}>
            The Future of <br /> Healthcare is <span style={{ color: theme.colors.primary }}>Digital.</span>
          </h1>
          <p style={descriptionStyle}>
            By creating an **ABHA (Ayushman Bharat Health Account)**, you are joining India's unified digital health infrastructure.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ background: '#10b981', color: '#fff', padding: '10px', borderRadius: '10px' }}><ShieldCheck size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>Consent-Based Sharing</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>You control who sees your health records.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ background: '#10b981', color: '#fff', padding: '10px', borderRadius: '10px' }}><Fingerprint size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>Secure Identity</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Verified via Aadhaar multi-factor OTP.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Form Column */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={formWrapper}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '35px' }}>
                <div style={{ background: theme.colors.primary, padding: '12px', borderRadius: '15px' }}><UserPlus color="#fff" size={24} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Patient Registration</h2>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>IDENTITY VERIFICATION</span>
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                <input style={inputStyle} placeholder="As printed on your Aadhaar card" />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Date of Birth</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="DD" maxLength="2" />
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="MM" maxLength="2" />
                  <input style={{ ...inputStyle, flex: 2 }} placeholder="YYYY" maxLength="4" />
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Aadhaar Number</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle} placeholder="0000 0000 0000" />
                  <Fingerprint size={18} style={{ position: 'absolute', right: '15px', top: '15px', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={alertBox}>
                <Info size={16} />
                <span>We will send a 6-digit secure code to your Aadhaar-linked mobile.</span>
              </div>

              <button style={submitBtn} onClick={handleGenerateOtp}>Generate Secure OTP</button>
              
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '20px', lineHeight: 1.5 }}>
                NexHealth adheres to the **Digital Personal Data Protection (DPDP) Act 2026**.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={formWrapper}
            >
              {/* Back to Step 1 Arrow */}
              <button onClick={() => setStep(1)} style={inlineBackBtn}>
                <ChevronLeft size={16} /> Correct Registration Info
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '35px' }}>
                <div style={{ background: '#3b82f6', padding: '12px', borderRadius: '15px' }}><KeyRound color="#fff" size={24} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Verify OTP</h2>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>CHECK REGISTERED MOBILE</span>
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Enter 6-Digit Code</label>
                <input 
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '900' }} 
                  maxLength="6" 
                  placeholder="000000" 
                />
              </div>

              <div style={{ ...alertBox, background: '#f8fafc', color: '#64748b', justifyContent: 'center' }}>
                {timer > 0 ? (
                  <span>Resend code in <b>{timer}s</b></span>
                ) : (
                  <button 
                    onClick={() => setTimer(60)} 
                    style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <RefreshCw size={14} /> Resend OTP
                  </button>
                )}
              </div>

              <button style={{ ...submitBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                Verify & Create ABHA
              </button>
              
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '20px', lineHeight: 1.5 }}>
                Securely encrypted via ABDM Sandbox Gateway.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateAbha;