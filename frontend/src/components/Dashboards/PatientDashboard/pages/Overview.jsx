import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Activity, ClipboardList, Clock, 
  ArrowUpRight, AlertCircle, CheckCircle2 
} from 'lucide-react';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:8000/api/v1/patient/dashboard-summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error("Dashboard sync error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const stats = [
    { label: 'Next Appointment', value: data?.next_appointment || 'No upcoming', icon: Calendar, color: '#059669', bg: '#f0fdf4' },
    { label: 'Blood Group', value: data?.blood_group || 'O+', icon: Activity, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Pending Reports', value: `${data?.pending_reports || 0} Reports`, icon: ClipboardList, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Last Visit', value: data?.last_visit || '12 Feb 2026', icon: Clock, color: '#d97706', bg: '#fffbeb' },
  ];

  if (loading) return <div style={styles.loader}>Initializing Clinical Workspace...</div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeMsg}>
            Welcome back, <span style={{color: '#059669'}}>{data?.name || 'Patient'}</span> 👋
          </h1>
          <p style={styles.subtitle}>Your health overview and clinical status from the NexHealth Digital Spine.</p>
        </div>
        <div style={styles.headerActions}>
           <div style={styles.uhidCapsule}>
              <span style={styles.uhidLabel}>UHID</span>
              <span style={styles.uhidValue}>{data?.uhid || '---'}</span>
           </div>
           <button style={styles.primaryBtn}>
             <Calendar size={18}/> 
             <span>Book Appointment</span>
           </button>
        </div>
      </header>

      {/* Actionable Alerts */}
      {!data?.is_profile_complete && (
        <div style={styles.alertCard}>
          <div style={styles.alertContent}>
            <div style={styles.alertIcon}><AlertCircle color="#059669" /></div>
            <div>
              <h4 style={styles.alertTitle}>Security & Identity Verification</h4>
              <p style={styles.alertText}>Verify your clinical profile to enable automated record synchronization with the Master Node.</p>
            </div>
          </div>
          <button style={styles.outlineBtn}>Complete Setup <ArrowUpRight size={16}/></button>
        </div>
      )}

      {/* Performance Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{...styles.iconBox, backgroundColor: stat.bg}}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p style={styles.statLabel}>{stat.label}</p>
              <h3 style={styles.statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Information Layer */}
      <div style={styles.mainGrid}>
        <div style={styles.glassCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Activity Log</h3>
            <span style={styles.liveBadge}>LIVE UPDATES</span>
          </div>
          <div style={styles.feedList}>
            <div style={styles.feedItem}>
              <CheckCircle2 size={14} color="#059669" />
              <span style={styles.timeStyle}>10:23 PM</span>
              <p style={styles.feedText}>Profile synchronized with Master Node</p>
            </div>
            <div style={styles.feedItem}>
              <CheckCircle2 size={14} color="#059669" />
              <span style={styles.timeStyle}>02:15 PM</span>
              <p style={styles.feedText}>Diagnostic records updated from City Care Center</p>
            </div>
          </div>
        </div>

        <div style={styles.glassCard}>
          <h3 style={styles.cardTitle}>Health Insights</h3>
          <div style={styles.insightBox}>
             <p style={styles.insightText}>
               <b>Hydration Goal:</b> Consuming 3L of water daily optimizes renal filtration and enhances metabolic skin health.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================== PROFESSIONAL STYLES ================== */
const styles = {
  container: { 
    maxWidth: '1440px', 
    margin: '0 auto', 
    padding: '40px 24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginBottom: '40px' 
  },
  welcomeMsg: { 
    fontSize: '32px', 
    fontWeight: '800', 
    color: '#0f172a', 
    margin: 0, 
    letterSpacing: '-1px' 
  },
  subtitle: { color: '#64748b', fontSize: '15px', marginTop: '6px' },
  headerActions: { display: 'flex', gap: '16px', alignItems: 'center' },
  uhidCapsule: { 
    display: 'flex', 
    backgroundColor: '#fff', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  uhidLabel: { 
    backgroundColor: '#f8fafc', 
    padding: '10px 14px', 
    fontSize: '11px', 
    fontWeight: '800', 
    color: '#94a3b8', 
    borderRight: '1px solid #e2e8f0',
    textTransform: 'uppercase'
  },
  uhidValue: { padding: '10px 14px', fontSize: '13px', fontWeight: '700', color: '#0f172a' },
  primaryBtn: { 
    backgroundColor: '#059669', 
    color: '#fff', 
    border: 'none', 
    padding: '12px 24px', 
    borderRadius: '12px', 
    fontWeight: '700', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    cursor: 'pointer', 
    boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.25)',
    transition: 'all 0.2s ease'
  },
  alertCard: { 
    backgroundColor: '#f0fdf4', 
    border: '1px solid #d1fae5', 
    borderRadius: '20px', 
    padding: '24px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '40px' 
  },
  alertContent: { display: 'flex', gap: '20px', alignItems: 'center' },
  alertIcon: { 
    backgroundColor: '#fff', 
    padding: '12px', 
    borderRadius: '14px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
  },
  alertTitle: { margin: 0, color: '#064e3b', fontWeight: '800', fontSize: '16px' },
  alertText: { margin: '4px 0 0', fontSize: '14px', color: '#065f46', opacity: 0.8 },
  outlineBtn: { 
    backgroundColor: '#059669', 
    color: '#fff', 
    border: 'none', 
    padding: '12px 20px', 
    borderRadius: '10px', 
    fontWeight: '700', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    cursor: 'pointer' 
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '24px', 
    marginBottom: '40px' 
  },
  statCard: { 
    backgroundColor: '#fff', 
    padding: '28px', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  iconBox: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { 
    fontSize: '12px', 
    fontWeight: '700', 
    color: '#94a3b8', 
    textTransform: 'uppercase', 
    margin: 0, 
    letterSpacing: '0.8px' 
  },
  statValue: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' },
  mainGrid: { 
    display: 'grid', 
    gridTemplateColumns: '2fr 1fr', 
    gap: '32px' 
  },
  glassCard: { 
    backgroundColor: '#fff', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0', 
    padding: '32px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 },
  liveBadge: { 
    fontSize: '10px', 
    fontWeight: '800', 
    color: '#059669', 
    backgroundColor: '#d1fae5', 
    padding: '4px 10px', 
    borderRadius: '6px',
    letterSpacing: '0.5px'
  },
  feedList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  feedItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  timeStyle: { color: '#94a3b8', fontWeight: '600', fontSize: '13px', minWidth: '70px' },
  feedText: { margin: 0, color: '#475569', fontWeight: '500', fontSize: '14px' },
  insightBox: { 
    marginTop: '20px', 
    padding: '24px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '16px', 
    borderLeft: '4px solid #059669' 
  },
  insightText: { margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.7' },
  loader: { 
    display: 'flex', 
    height: '100vh', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#059669', 
    fontWeight: '700',
    fontSize: '18px'
  }
};

export default Overview;