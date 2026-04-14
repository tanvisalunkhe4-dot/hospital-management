import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar, Activity, ClipboardList, Clock,
  ArrowUpRight, AlertCircle
} from 'lucide-react';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          'http://localhost:8000/api/v1/patient/dashboard-summary',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const stats = [
    {
      label: 'Next Appointment',
      value: data?.next_appointment || 'No upcoming',
      icon: Calendar,
      color: '#10b981',
      bg: '#ecfdf5'
    },
    {
      label: 'Blood Group',
      value: data?.blood_group || 'O+',
      icon: Activity,
      color: '#ef4444',
      bg: '#fef2f2'
    },
    {
      label: 'Pending Reports',
      value: `${data?.pending_reports || 0} Reports`,
      icon: ClipboardList,
      color: '#3b82f6',
      bg: '#eff6ff'
    },
    {
      label: 'Last Visit',
      value: data?.last_visit || '—',
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb'
    }
  ];

  const feed = [
    { time: '10:23 PM', type: 'SYNC', text: 'Profile synchronized successfully' },
    { time: '02:15 PM', type: 'SYSTEM', text: 'Medical records updated' }
  ];

  if (loading) return <div style={styles.loader}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Welcome back, <span style={{ color: '#10b981' }}>{data?.name || 'Patient'}</span>
          </h1>
          <p style={styles.subtitle}>Your health overview at a glance</p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.uhid}>
            <span>UHID</span>
            <b>{data?.uhid || '---'}</b>
          </div>

          <button style={styles.primaryBtn}>
            <Calendar size={18} /> Book Appointment
          </button>
        </div>
      </div>

      {/* ALERT */}
      {!data?.is_profile_complete && (
        <div style={styles.alert}>
          <div style={{ display: 'flex', gap: 12 }}>
            <AlertCircle color="#059669" />
            <div>
              <b>Complete your profile</b>
              <p style={{ margin: 0, fontSize: 13 }}>
                Unlock full medical features by verifying your profile.
              </p>
            </div>
          </div>

          <button style={styles.secondaryBtn}>
            Complete <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div style={styles.grid}>
        {stats.map((s, i) => (
          <div
          key={i}
          style={styles.card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.05)';
          }}
        >
            <div style={{ ...styles.iconBox, background: s.bg }}>
              <s.icon color={s.color} />
            </div>
            <div>
              <p style={styles.label}>{s.label}</p>
              <h3 style={styles.value}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        
        {/* FEED */}
        <div style={styles.bigCard}>
          <h3 style={styles.cardTitle}>Activity Feed</h3>

          <div style={{ marginTop: 20 }}>
            {feed.map((f, i) => (
              <div key={i} style={styles.feedItem}>
                <div style={{
                  ...styles.dot,
                  background: f.type === 'SYNC' ? '#10b981' : '#3b82f6'
                }} />

                <span style={styles.time}>{f.time}</span>
                <p style={styles.feedText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS */}
        <div style={styles.bigCard}>
          <h3 style={styles.cardTitle}>Health Insights</h3>

          <div style={styles.insight}>
            💧 Drink at least 3L water daily to improve metabolism & skin health.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;





/* ================== STYLES ================== */
const styles = {

  container: {
    padding: '32px',
    background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
    minHeight: '100vh'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px'
  },

  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.5px',
    color: '#0f172a'
  },

  subtitle: {
    color: '#64748b',
    marginTop: '6px',
    fontSize: '14px'
  },

  headerRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },

  uhid: {
    background: '#fff',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '600'
  },

  primaryBtn: {
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    boxShadow: '0 8px 20px rgba(16,185,129,0.25)',
    transition: 'all 0.2s ease'
  },

  secondaryBtn: {
    background: '#059669',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  alert: {
    background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
    border: '1px solid #bbf7d0',
    padding: '18px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '24px',
    marginBottom: '32px'
  },

  card: {
    background: '#fff',
    padding: '22px',
    borderRadius: '18px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
    transition: 'all 0.25s ease',
    cursor: 'pointer'
  },

  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  label: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },

  value: {
    margin: '2px 0 0',
    fontWeight: '800',
    fontSize: '18px'
  },

  main: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px'
  },

  bigCard: {
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    padding: '26px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    border: '1px solid rgba(255,255,255,0.4)',
    transition: 'all 0.25s ease'
  },

  cardTitle: {
    fontWeight: '700',
    fontSize: '15px',
    marginBottom: '12px'
  },

  feedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },

  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },

  time: {
    fontSize: '12px',
    color: '#94a3b8',
    width: '70px'
  },

  feedText: {
    margin: 0,
    fontSize: '14px',
    color: '#475569'
  },

  insight: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg,#ecfdf5,#bbf7d0)',
    fontSize: '14px',
    lineHeight: '1.5'
  },

  loader: {
    textAlign: 'center',
    padding: '120px',
    fontWeight: '600',
    color: '#10b981'
  }
};