import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Building2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/theme';

const Login = ({ onSignupRedirect, onForgotPassword }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState("Patient");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    hospitalId: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { identifier, password, hospitalId } = formData;

    const loginData = {
      identifier: identifier.trim(),
      password: password,
      hospital_id: hospitalId.trim(),
      role: role
    };

    try {
      sessionStorage.clear();

      const isStaffOrAdmin = ['Admin', 'Staff', 'Doctor'].includes(role);

      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/login',
        {
          role: loginData.role,
          identifier: loginData.identifier,
          password: loginData.password,
          hospital_id: isStaffOrAdmin ? loginData.hospital_id : null
        }
      );

      const { access_token, user } = response.data;

      sessionStorage.setItem('token', access_token);
      sessionStorage.setItem('user_role', user.role);

      if (user.hospital_id) {
        sessionStorage.setItem('hospital_id', user.hospital_id);
      }

      sessionStorage.setItem('user_data', JSON.stringify(user));

      const normalizedRole = user.role.replace(" ", "");

      if (normalizedRole === 'SuperAdmin') {
        navigate('/nex-master-control');
      } else if (normalizedRole === 'Admin') {
        navigate('/admin-dashboard');
      } else if (normalizedRole === 'Doctor') {
        navigate('/doctor-portal');
      } else if (normalizedRole === 'Nurse') {
        navigate('/nurse-dashboard/overview');
      } else if (normalizedRole === 'Receptionist') {
        navigate('/reception-desk');
      } else if (
        normalizedRole === 'Staff' ||
        normalizedRole === 'LabTechnician' ||
        normalizedRole === 'Lab Technician' ||
        normalizedRole === 'Pharmacist'
      ) {
        navigate('/doctor-portal');
      } else {
        navigate('/patient-dashboard/overview');
      }

    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        "Connection to NexHealth Server failed";
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
          <h1 style={logoStyle}>
            Nex<span style={{ color: theme.colors.primary }}>Health</span>
          </h1>
          <p style={subtitleStyle}>
            {role === 'SuperAdmin'
              ? 'Network Infrastructure Management'
              : role === 'Patient'
              ? 'Access your digital health records'
              : 'Enterprise Hospital Management'}
          </p>
        </div>

        <div style={segmentedControlStyle}>
          {['Patient', 'Staff', 'Admin', 'SuperAdmin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                ...tabButtonStyle,
                fontSize: '11px',
                color: role === r ? '#fff' : '#64748b',
                background:
                  role === r
                    ? r === 'SuperAdmin'
                      ? "#059669"
                      : theme.colors.primary
                    : 'transparent',
              }}
            >
              {r === 'SuperAdmin' ? 'Super Admin' : r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          <AnimatePresence mode="wait">
            {['Admin', 'Staff', 'Doctor'].includes(role) && (
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
                    value={formData.hospitalId}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalId: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={inputGroup}>
            <label style={labelStyle}>
              {role === 'SuperAdmin'
                ? 'Master Email'
                : role === 'Patient'
                ? 'Registered Mobile / Email'
                : 'Professional Staff ID'}
            </label>
            <div style={inputWrapper}>
              <Mail size={18} style={inputIcon} />
              <input
                type="text"
                required
                placeholder={
                  role === 'SuperAdmin'
                    ? "admin@nexhealth.com"
                    : "Identifier"
                }
                style={inputStyle}
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
              />
            </div>
          </div>

          <div style={inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Security Password</label>
              <span onClick={onForgotPassword} style={linkStyle}>
                Forgot Password?
              </span>
            </div>
            <div style={inputWrapper}>
              <Lock size={18} style={inputIcon} />
              <input
                type="password"
                required
                placeholder="••••••••"
                style={inputStyle}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            style={primaryButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        {role !== 'SuperAdmin' && (
          <div style={footerStyle}>
            <p>
              New to the network?{" "}
              <span onClick={onSignupRedirect} style={signupLink}>
                Create an Account
              </span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Styles ---
const pageWrapperStyle = { height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#f8fafc' };
const gridOverlay = { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.3 };
const loginCardStyle = { width: '90%', maxWidth: '460px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 10 };
const logoStyle = { fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '13px', marginTop: '4px' };
const segmentedControlStyle = { display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '14px', marginBottom: '24px' };
const tabButtonStyle = { flex: 1, padding: '10px 4px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#334155' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '16px', color: '#94a3b8' };
const inputStyle = { width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const primaryButtonStyle = { padding: '16px', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', background: 'linear-gradient(135deg, #10b981, #059669)' };
const linkStyle = { color: '#10b981', cursor: 'pointer' };
const signupLink = { color: '#10b981', cursor: 'pointer', fontWeight: '800' };
const footerStyle = { marginTop: '24px', textAlign: 'center', fontSize: '13px' };

export default Login;