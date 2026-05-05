import React from 'react';
import { Bell, User, Search, Settings } from 'lucide-react';

const DoctorHeader = ({ doctorName }) => {
  return (
    <header style={headerStyle}>
      <div style={searchWrapper}>
        <Search size={18} color="#94a3b8" />
        <input type="text" placeholder="Search patient history..." style={searchInput} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={iconBadge}><Bell size={20} /></div>
        <div style={iconBadge}><Settings size={20} /></div>
        <div style={profileSection}>
          <div style={textRight}>
            <p style={nameStyle}>Dr. {doctorName}</p>
            <p style={roleStyle}>NexHealth Specialist</p>
          </div>
          <div style={avatarStyle}><User size={20} /></div>
        </div>
      </div>
    </header>
  );
};

// Styles for Header
const headerStyle = { height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px', width: '400px' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' };
const profileSection = { display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const nameStyle = { margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const roleStyle = { margin: 0, fontSize: '12px', color: '#64748b' };
const textRight = { textAlign: 'right' };
const iconBadge = { color: '#64748b', cursor: 'pointer' };

export default DoctorHeader;