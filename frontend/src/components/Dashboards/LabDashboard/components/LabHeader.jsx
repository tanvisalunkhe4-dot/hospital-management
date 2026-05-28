import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const LabHeader = () => {
  const [user, setUser] = useState({ name: 'User', role: 'Staff', id: '' });
  const location = useLocation();

  useEffect(() => {
    // Retrieve live data from storage
    const storedData = sessionStorage.getItem('user_data');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUser({
        name: parsedData.full_name || parsedData.username || 'Technician',
        role: parsedData.role || 'Lab Tech',
        id: parsedData.staff_id || parsedData.id || ''
      });
    }
  }, []);

  // Format the breadcrumb based on current URL
  const getBreadcrumb = () => {
    const path = location.pathname.split('/').pop();
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header style={{ 
      height: '80px', 
      backgroundColor: 'white', 
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 40px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '8px 16px', 
          borderRadius: '10px', 
          fontSize: '13px', 
          color: '#64748b',
          border: '1px solid #e2e8f0',
          fontWeight: '500'
        }}>
          NexHealth / <span style={{ color: '#0f172a', fontWeight: '700' }}>{getBreadcrumb() || 'Lab'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={22} color="#64748b" />
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#ef4444', 
            borderRadius: '50%',
            border: '2px solid white'
          }}></span>
        </div>

        {/* Live User Profile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '6px 6px 6px 16px', 
          borderRadius: '14px',
          border: '1.5px solid #f1f5f9' 
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
              {user.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
               <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{user.id}</span>
               <span style={{ width: '4px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></span>
               <p style={{ margin: 0, fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                 {user.role}
               </p>
            </div>
          </div>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            backgroundColor: '#f1f5f9', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: '#64748b'
          }}>
            <UserCircle size={30} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LabHeader;