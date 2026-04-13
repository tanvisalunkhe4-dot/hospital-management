import React from 'react';
import { Calendar, Activity, ClipboardList, Clock, ArrowUpRight } from 'lucide-react';

const Overview = () => {
  const stats = [
    { label: 'Next Appointment', value: 'Tomorrow, 10 AM', icon: Calendar, color: '#10b981' },
    { label: 'Blood Group', value: 'O+ Positive', icon: Activity, color: '#ef4444' },
    { label: 'Pending Reports', value: '02 Reports', icon: ClipboardList, color: '#3b82f6' },
    { label: 'Last Visit', value: '12 Feb 2026', icon: Clock, color: '#f59e0b' },
  ];

  return (
    <div style={container}>
      {/* 1. Header Section matching SuperAdmin style */}
      <div style={headerSection}>
        <div>
          <h1 style={title}>Health Summary</h1>
          <p style={subtitle}>Patient UHID: <span style={{color: '#10b981', fontWeight: '700'}}>2026-8842</span></p>
        </div>
        <button style={primaryBtn}>
          Book Appointment <ArrowUpRight size={18} />
        </button>
      </div>

      {/* 2. Stat Grid with SuperAdmin Card Style */}
      <div style={statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={statCard}>
            <div style={{...iconCircle, backgroundColor: `${stat.color}10`}}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div>
              <p style={statLabel}>{stat.label}</p>
              <h3 style={statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div style={contentRow}>
        <div style={mainCard}>
          <div style={cardHeader}>
            <h3 style={cardTitle}>Recent Activity</h3>
            <span style={statusBadge}>Live Updates</span>
          </div>
          <div style={activityPlaceholder}>
             <p>Your clinical timeline will appear here once synchronized with the hospital node.</p>
          </div>
        </div>

        {/* Optional small side card like "Network Audit Trail" */}
        <div style={sideCard}>
           <h3 style={cardTitle}>Health Tips</h3>
           <div style={tipBox}>
              <p style={{fontSize: '13px', color: '#64748b'}}>Stay hydrated! Drinking 3L of water daily improves kidney function.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// ================== MASTER CONTROL THEME STYLES ==================

const container = { animation: 'fadeIn 0.4s ease-out' };

const headerSection = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '32px' 
};

const title = { fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 };
const subtitle = { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' };

const primaryBtn = {
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '12px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
};

const statsGrid = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
  gap: '20px',
  marginBottom: '32px' 
};

const statCard = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const iconCircle = { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statLabel = { fontSize: '13px', fontWeight: '600', color: '#64748b', margin: 0 };
const statValue = { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '2px 0 0 0' };

const contentRow = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' };

const mainCard = { 
  backgroundColor: '#fff', 
  borderRadius: '24px', 
  border: '1px solid #e2e8f0', 
  padding: '24px',
  minHeight: '300px'
};

const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const cardTitle = { fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 };
const statusBadge = { backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' };

const activityPlaceholder = { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f1f5f9', borderRadius: '16px', color: '#94a3b8', textAlign: 'center', padding: '20px' };

const sideCard = { backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px' };
const tipBox = { marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' };

export default Overview;