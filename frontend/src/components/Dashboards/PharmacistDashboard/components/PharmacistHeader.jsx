import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, User, Settings, 
  ChevronDown, Moon, Sun, MapPin 
} from 'lucide-react';

const PharmacistHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("Pharmacist");

  // Keep clock updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // Get user name from session if available
    const storedName = sessionStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header style={headerContainer}>
      {/* Search & Location Info */}
      <div style={leftSection}>
        <div style={locationBadge}>
          <MapPin size={14} color="#10b981" />
          <span>Main Pharmacy Wing • Block C</span>
        </div>
        <div style={timeDisplay}>
          <span style={dateText}>{formatDate(currentTime)}</span>
          <span style={timeText}>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div style={rightSection}>
        <div style={iconGroup}>
          <button style={actionIcon} title="Search Records">
            <Search size={20} color="#64748b" />
          </button>
          <button style={actionIcon} title="System Settings">
            <Settings size={20} color="#64748b" />
          </button>
          <div style={notificationWrapper}>
            <button style={actionIcon}>
              <Bell size={20} color="#64748b" />
            </button>
            <span style={badge}>3</span>
          </div>
        </div>

        {/* Profile Section */}
        <div style={profileTrigger}>
          <div style={textDetails}>
            <span style={userNameStyle}>{userName}</span>
            <span style={userRole}>Senior Pharmacist</span>
          </div>
          <div style={avatarBox}>
            <User size={20} color="#fff" />
          </div>
          <ChevronDown size={16} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
};

// --- Professional Styles ---
const headerContainer = {
  height: '80px',
  background: '#fff',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 30px',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const leftSection = { display: 'flex', alignItems: 'center', gap: '30px' };

const locationBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#f0fdf4',
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#166534',
  border: '1px solid #dcfce7'
};

const timeDisplay = { display: 'flex', flexDirection: 'column' };
const dateText = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' };
const timeText = { fontSize: '14px', color: '#1e293b', fontWeight: '800', fontFamily: 'monospace' };

const rightSection = { display: 'flex', alignItems: 'center', gap: '24px' };

const iconGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  paddingRight: '24px',
  borderRight: '1px solid #f1f5f9'
};

const actionIcon = {
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const notificationWrapper = { position: 'relative' };
const badge = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  background: '#ef4444',
  color: '#fff',
  fontSize: '10px',
  fontWeight: '800',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #fff'
};

const profileTrigger = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '12px',
  transition: '0.2s'
};

const textDetails = { display: 'flex', flexDirection: 'column', textAlign: 'right' };
const userNameStyle = { fontSize: '14px', fontWeight: '800', color: '#1e293b' };
const userRole = { fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' };

const avatarBox = {
  width: '40px',
  height: '40px',
  background: '#1e293b',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

export default PharmacistHeader;