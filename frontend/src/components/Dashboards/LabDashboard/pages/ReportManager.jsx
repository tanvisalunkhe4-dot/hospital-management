import React from 'react';
import { FileUp } from 'lucide-react';

const ReportManager = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Lab Report Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3>Upload Manual Report</h3>
          <input type="file" style={{ marginBottom: '10px' }} />
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }}>
            <FileUp size={18} /> Upload PDF
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReportManager;