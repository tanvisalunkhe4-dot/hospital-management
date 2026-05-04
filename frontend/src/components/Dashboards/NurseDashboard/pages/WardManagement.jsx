import React from 'react';

const WardManagement = () => {
  return (
    <div style={pageContainer}>
      <h1 style={headerStyle}>Ward Management</h1>
      <p style={subHeader}>Manage bed assignments and ward occupancy.</p>
    </div>
  );
};

// --- BASIC STYLES TO MATCH YOUR THEME ---
const pageContainer = { padding: '40px' };
const headerStyle = { fontSize: '24px', fontWeight: '800', color: '#1e293b' };
const subHeader = { color: '#64748b', marginTop: '8px' };

// 🟢 THIS LINE FIXES THE ERROR
export default WardManagement;