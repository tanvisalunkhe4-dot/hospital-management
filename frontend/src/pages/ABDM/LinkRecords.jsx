import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link, ArrowLeft, Database, Info, 
  Share2, KeyRound, RefreshCw, ChevronLeft, Activity
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
  padding: '20px 0', 
  borderBottom: '1px solid #e2e8f0', marginBottom: '40px'
};

const logoWrapper = { display: 'flex', alignItems: 'center' };
const hospitalLogoStyle = { height: '55px', width: 'auto' };
const abdmLogoStyle = { height: '75px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' };
const divider = { width: '2px', height: '45px', backgroundColor: '#cbd5e1', margin: '0 30px' };

const backBtn = { 
  display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', 
  border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '10px',
  color: '#475569', fontWeight: '700', cursor: 'pointer', transition: '0.2s'
};

const mainContent = { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '100px', alignItems: 'center' };

const formWrapper = { 
  background: '#fff', padding: '50px', borderRadius: '32px', 
  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
  position: 'relative'
};

const inputStyle = { 
  width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
  fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
};

const primaryBtn = { 
  width: '100%', padding: '18px', background: theme.colors.buttonGradient, 
  color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', 
  fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', transition: '0.3s' 
};

const inlineBackBtn = {
  display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b',
  background: 'none', border: 'none', fontSize: '13px', fontWeight: '700',
  cursor: 'pointer', marginBottom: '20px', padding: 0
};

// --- 2. COMPONENT ---
const LinkRecords = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Discover, 2: OTP Link
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  return (
    <div style={containerStyle}>
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
        {/* Left Section: Information */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', marginBottom: '20px' }}>
            RECORD SYNCHRONIZATION
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, marginBottom: '25px' }}>
            Link Local <br /> <span style={{ color: theme.colors.primary }}>Health Records.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '40px' }}>
            Securely map NexHealth clinical data to the patient's ABHA profile for seamless longitudinal history.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ background: '#10b981', color: '#fff', padding: '10px', borderRadius: '10px' }}><Database size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>Automated Discovery</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Scan our hospital database for matching patient profiles.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ background: '#10b981', color: '#fff', padding: '10px', borderRadius: '10px' }}><Share2 size={20} /></div>
              <div>
                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>ABDM Interoperability</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Make records accessible across the national network.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Linking Card */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="link-step-1"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={formWrapper}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '35px' }}>
                <div style={{ background: theme.colors.primary, padding: '12px', borderRadius: '15px' }}>
                  <Link color="#fff" size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Link Records</h2>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>DISCOVER MATCHING PROFILES</span>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontWeight: '800', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
                  Patient ABHA ID
                </label>
                <input style={inputStyle} placeholder="name@abdm or 14-digit ABHA number" />
              </div>

              <div style={{ display: 'flex', gap: '12px', background: '#f0fdf4', color: '#166534', padding: '15px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '30px' }}>
                <Activity size={16} />
                <span>Scanning NexHealth database for clinical records...</span>
              </div>

              <button style={primaryBtn} onClick={() => setStep(2)}>Discover & Request Link</button>
            </motion.div>
          ) : (
            <motion.div 
              key="link-step-2"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={formWrapper}
            >
              <button onClick={() => setStep(1)} style={inlineBackBtn}>
                <ChevronLeft size={16} /> Edit ABHA ID
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '35px' }}>
                <div style={{ background: '#3b82f6', padding: '12px', borderRadius: '15px' }}>
                  <KeyRound color="#fff" size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Link Verification</h2>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>SECURE CONSENT VIA OTP</span>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontWeight: '800', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
                  6-Digit Consent Code
                </label>
                <input 
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '900' }} 
                  maxLength="6" 
                  placeholder="000000" 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '15px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '30px', justifyContent: 'center' }}>
                {timer > 0 ? (
                  <span>Resend in <b>{timer}s</b></span>
                ) : (
                  <button onClick={() => setTimer(60)} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '800', cursor: 'pointer' }}>
                    Resend OTP
                  </button>
                )}
              </div>

              <button style={{ ...primaryBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                Verify & Link Records
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LinkRecords;