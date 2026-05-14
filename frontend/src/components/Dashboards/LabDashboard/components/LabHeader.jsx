import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

const LabHeader = () => {
  return (
    <header style={{ 
      height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px'
    }}>
      <div style={{ color: '#64748b', fontSize: '14px' }}>
        Dashboard / <span style={{ color: '#1e293b', fontWeight: '600' }}>Lab Overview</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Bell size={20} color="#64748b" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}></p>
            <p style={{ margin: 0, fontSize: '12px', color: '#10b981' }}>Senior Lab Tech</p>
          </div>
          <UserCircle size={35} color="#cbd5e1" />
        </div>
      </div>
    </header>
  );
};
export default LabHeader;