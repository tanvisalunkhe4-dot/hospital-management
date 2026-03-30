import React from 'react';
import { UploadCloud } from 'lucide-react';
import theme from '../../theme/theme';

const UploadRecords = ({ onBack }) => (
  <div style={containerStyle}>
    <button onClick={onBack} style={backBtn}>← Back</button>
    <div style={cardStyle}>
      <div style={headerStyle}><UploadCloud color={theme.colors.primary} /> <h2>Upload Records</h2></div>
      <input type="file" style={inputStyle} />
      <button style={primaryBtn}>Sync to ABDM</button>
    </div>
  </div>
);
const containerStyle = { padding: '120px 80px', minHeight: '100vh', backgroundColor: '#f8fafc' };
const cardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '550px' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' };
const primaryBtn = { width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };
const backBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const item = { padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' };
export default UploadRecords;