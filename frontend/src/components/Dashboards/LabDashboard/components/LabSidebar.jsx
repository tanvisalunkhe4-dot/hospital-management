import React from 'react';
import { ClipboardList, FlaskConical, Beaker, FileText, History, LogOut } from 'lucide-react';

const LabSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'requests', label: 'Test Requests', icon: <ClipboardList size={20}/> },
    { id: 'collection', label: 'Sample Collection', icon: <FlaskConical size={20}/> },
    { id: 'processing', label: 'Test Processing', icon: <Beaker size={20}/> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20}/> },
    { id: 'history', label: 'Lab Records', icon: <History size={20}/> },
  ];

  return (
    <div style={{ width: '260px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', fontWeight: 'bold', fontSize: '20px', color: '#10b981' }}>NexHealth LAB</div>
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {menuItems.map(item => (
          <div 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
              cursor: 'pointer', marginBottom: '4px',
              backgroundColor: activeTab === item.id ? '#ecfdf5' : 'transparent',
              color: activeTab === item.id ? '#10b981' : '#64748b',
              fontWeight: activeTab === item.id ? '600' : '400'
            }}
          >
            {item.icon} {item.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
          <LogOut size={18}/> Sign Out
        </button>
      </div>
    </div>
  );
};

export default LabSidebar;