import React from 'react';
import { Users, Bed, Activity, Clock } from 'lucide-react';

const NurseOverview = () => {
  // Mock data for the dashboard stats
  const stats = [
    { title: "Total Patients", value: "24", icon: <Users size={24} />, color: "#10b981", bg: "#f0fdf4" },
    { title: "Active Vitals", value: "18", icon: <Activity size={24} />, color: "#3b82f6", bg: "#eff6ff" },
    { title: "Beds Occupied", value: "85%", icon: <Bed size={24} />, color: "#f59e0b", bg: "#fffbeb" },
    { title: "Pending Meds", value: "6", icon: <Clock size={24} />, color: "#ef4444", bg: "#fef2f2" },
  ];

  return (
    <div style={containerStyle}>
      <h2 style={welcomeStyle}>Nurse Dashboard</h2>
      
      {/* Statistics Grid */}
      <div style={statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} style={statCard}>
            <div style={{ ...iconCircle, backgroundColor: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={statTitle}>{stat.title}</p>
              <h3 style={statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={contentLayout}>
        <div style={mainPanel}>
          <h3 style={sectionTitle}>Urgent Notifications</h3>
          <div style={notificationList}>
            <div style={alertItem}>
              <span style={urgentBadge}>High BP</span>
              <p style={alertText}>Patient <strong>Rahul Sharma (Bed A-10)</strong> recorded 145/95 mmHg.</p>
            </div>
            <div style={alertItem}>
              <span style={medBadge}>Medication</span>
              <p style={alertText}>Dose due for <strong>Priya Patil (Bed A-12)</strong> - 11:30 AM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
const welcomeStyle = { margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const statCard = { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' };
const iconCircle = { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statTitle = { margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '600' };
const statValue = { margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' };
const contentLayout = { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' };
const mainPanel = { background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const sectionTitle = { marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#334155' };
const notificationList = { display: 'flex', flexDirection: 'column', gap: '12px' };
const alertItem = { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '12px', background: '#f8fafc' };
const alertText = { margin: 0, fontSize: '14px', color: '#475569' };
const urgentBadge = { background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' };
const medBadge = { background: '#e0f2fe', color: '#0ea5e9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' };

// 🟢 CRITICAL: This fixes the App.jsx SyntaxError
export default NurseOverview;