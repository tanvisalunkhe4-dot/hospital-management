// src/pages/ABDMPage.jsx
import React from 'react';
import theme from '../theme/theme';

const ABDMPage = ({ onBack }) => {
  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtnStyle}>← Back to Home</button>
      <h1 style={{ color: '#1a365d' }}>ABDM & ABHA Integration</h1>
      <p style={{ color: '#4b5563', fontSize: '18px', maxWidth: '800px' }}>
        NexHealth is built on the building blocks of the National Digital Health Ecosystem (NDHE). 
        We ensure your facility is future-ready and compliant.
      </p>

      <div style={listStyle}>
        <div style={listItem}>
          <strong style={{color: theme.colors.primary}}>✓ ABHA ID Creation:</strong>
          <span> Onboard patients instantly using Aadhaar or Mobile verification.</span>
        </div>
        <div style={listItem}>
          <strong style={{color: theme.colors.primary}}>✓ Health Records (PHR):</strong>
          <span> Securely share and link medical records across the NDHM network.</span>
        </div>
        <div style={listItem}>
          <strong style={{color: theme.colors.primary}}>✓ Verified Practitioners:</strong>
          <span> Integration with the Healthcare Professionals Registry (HPR).</span>
        </div>
      </div>
    </div>
  );
};

const containerStyle = { padding: '100px 10vw', minHeight: '100vh' };
const backBtnStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '30px' };
const listStyle = { marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' };
const listItem = { fontSize: '18px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' };

export default ABDMPage;