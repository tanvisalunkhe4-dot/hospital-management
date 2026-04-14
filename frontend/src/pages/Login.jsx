import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Building2, ChevronRight, ShieldCheck, CheckCircle2, Crown } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/theme'; 

const Login = ({ onForgotPassword, onSignupRedirect }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Patient'); 
  const [formData, setFormData] = useState({ 
    identifier: '', 
    password: '', 
    hospitalId: '', 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Clear old session data to prevent data leaking between hospital switches
      localStorage.clear();

      const response = await axios.post('http://localhost:8000/api/v1/auth/login',{
        role: role,
        identifier: formData.identifier,
        password: formData.password,
        // Send the HFR-ID (e.g., HFR-905-1134) to help the backend find the right DB entry
        hospitalId: (role === 'Admin' || role === 'Staff') ? formData.hospitalId : null
      });
  
      const { access_token, user } = response.data;
      
      // 2. Store security token
      localStorage.setItem('token', access_token);
      
      // 3. CRITICAL: Store the numeric hospital_id (e.g., 3 for City Care) 
      // This ensures your Dashboard fetches the CORRECT data silo.
      if (user.hospital_id) {
        localStorage.setItem('hospital_id', user.hospital_id);
      }
      
      localStorage.setItem('user_data', JSON.stringify(user));
  
      // --- ROUTING LOGIC ---
      if (user.role === 'Super Admin') {
        navigate('/nex-master-control'); 
      } else if (user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'Staff') {
        navigate('/staff-portal');
      } else {
        navigate('/patient-dashboard/overview');      }
  
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Connection to NexHealth Server failed";
      alert(`Login Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={gridOverlay} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={loginCardStyle}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={logoStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></h1>
          <p style={subtitleStyle}>
            {role === 'Super Admin' ? 'Network Infrastructure Management' : 
             role === 'Patient' ? 'Access your digital health records' : 'Enterprise Hospital Management'}
          </p>
        </div>

        <div style={segmentedControlStyle}>
          {['Patient', 'Staff', 'Admin', 'Super Admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                ...tabButtonStyle,
                fontSize: '11px', 
                color: role === r ? '#fff' : '#64748b',
                background: role === r ? (r === 'Super Admin' ? "#059669" : theme.colors.primary) : 'transparent',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          <AnimatePresence mode="wait">
            {(role === 'Admin' || role === 'Staff') && (
              <motion.div 
                key="hosp-id"
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                style={inputGroup}
              >
                <label style={labelStyle}>Hospital Registration ID</label>
                <div style={inputWrapper}>
                  <Building2 size={18} style={inputIcon} />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. HFR-PUNE-001" 
                    style={inputStyle}
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={inputGroup}>
            <label style={labelStyle}>
              {role === 'Super Admin' ? 'Master Email' : 
               role === 'Patient' ? 'Registered Mobile / Email' : 'Professional Staff ID'}
            </label>
            <div style={inputWrapper}>
              <Mail size={18} style={inputIcon} />
              <input 
                type="text" 
                required 
                placeholder={role === 'Super Admin' ? "admin@nexhealth.com" : "Identifier"} 
                style={inputStyle} 
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
          </div>

          <div style={inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Security Password</label>
              <span onClick={onForgotPassword} style={linkStyle}>Forgot Password?</span>
            </div>
            <div style={inputWrapper}>
              <Lock size={18} style={inputIcon} />
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                style={inputStyle} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" style={{
            ...primaryButtonStyle,
            background: role === 'Super Admin' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }} disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        {role !== 'Super Admin' && (
          <div style={footerStyle}>
            <p>New to the network? <span onClick={onSignupRedirect} style={signupLink}>Create an Account</span></p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Styles
const pageWrapperStyle = { height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#f8fafc' };
const gridOverlay = { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.3 };
const loginCardStyle = { width: '90%', maxWidth: '460px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 10, border: '1px solid rgba(255, 255, 255, 0.5)' };
const logoStyle = { fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.05em', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '13px', marginTop: '4px', fontWeight: '500' };
const segmentedControlStyle = { display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '14px', marginBottom: '24px' };
const tabButtonStyle = { flex: 1, padding: '10px 4px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.3s ease' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#334155', marginLeft: '4px' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '16px', color: '#94a3b8' };
const inputStyle = { width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const primaryButtonStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '10px' };
const linkStyle = { color: '#10b981', fontWeight: '600', cursor: 'pointer', fontSize: '12px' };
const signupLink = { color: '#10b981', fontWeight: '800', cursor: 'pointer' };
const footerStyle = { marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' };

export default Login;