import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

const Header = () => {
  return (
    <header style={headerStyle}>
      <div style={searchArea}>
        <Search size={18} color="#94a3b8" />
        <input type="text" placeholder="Search records, doctors..." style={searchInput} />
      </div>

      <div style={profileArea}>
        <button style={iconBtn}><Bell size={20} /></button>
        <div style={divider}></div>
        <div style={userInfo}>
          <span style={userName}>John Doe</span>
          <span style={userRole}>UHID: 2026-8842</span>
        </div>
        <UserCircle size={32} color="#10b981" />
      </div>
    </header>
  );
};

// ================== STYLES ==================
const headerStyle = { height: '80px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' };
const searchArea = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f1f5f9', padding: '10px 16px', borderRadius: '12px', width: '300px' };
const searchInput = { border: 'none', background: 'none', outline: 'none', fontSize: '14px', width: '100%' };
const profileArea = { display: 'flex', alignItems: 'center', gap: '20px' };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };
const divider = { width: '1px', height: '24px', backgroundColor: '#e2e8f0' };
const userInfo = { textAlign: 'right', display: 'flex', flexDirection: 'column' };
const userName = { fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const userRole = { fontSize: '12px', color: '#10b981', fontWeight: '600' };

// ✅ THE CRITICAL FIX:
export default Header;