// src/pages/SolutionsPage.jsx
import React from 'react';
import theme from '../theme/theme';

const SolutionsPage = ({ onBack }) => {
  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtnStyle}>← Back to Home</button>
      <h1 style={{ color: theme.colors.primaryDark, marginBottom: '24px' }}>Tailored Solutions</h1>
      
      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={{ color: theme.colors.primary }}>For Individual Clinics</h3>
          <p>Streamline your OPD and send digital prescriptions directly to WhatsApp.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: theme.colors.primary }}>For Diagnostic Labs</h3>
          <p>Manage test reports and sync them instantly with the patient's ABHA record.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: theme.colors.primary }}>For Large Hospitals</h3>
          <p>Comprehensive HMS with Role-Based Access for doctors, nurses, and admins.</p>
        </div>
      </div>
    </div>
  );
};

// Simple Styles
const containerStyle = { padding: '100px 10vw', backgroundColor: '#fff' };
const backBtnStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' };
const cardStyle = { padding: '24px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };

export default SolutionsPage;