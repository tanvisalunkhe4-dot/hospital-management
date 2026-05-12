import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Activity, ClipboardList, Clock, 
  ArrowUpRight, AlertCircle, CheckCircle2,
  MessageSquare, Zap, Heart, Droplets, X, ChevronRight, TrendingUp
} from 'lucide-react';

const Overview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ heart_rate: '', blood_pressure: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatientData = async () => {
    try {
      const token = sessionStorage.getItem('token'); 
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

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:8000/api/v1/patient/update-vitals', vitalsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setVitalsForm({ heart_rate: '', blood_pressure: '' });
      fetchPatientData();
      alert("Vitals updated successfully!");
    } catch (error) {
      alert("Failed to update vitals.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Next Appointment', value: data?.next_appointment || 'None Scheduled', icon: Calendar, color: '#059669', bg: '#f0fdf4', path: '/patient-dashboard/appointments' },
    { label: 'Blood Group', value: data?.blood_group || '--', icon: Droplets, color: '#dc2626', bg: '#fef2f2', path: '/patient-dashboard/profile' },
    { label: 'Pending Reports', value: `${data?.pending_reports || 0} Reports`, icon: ClipboardList, color: '#2563eb', bg: '#eff6ff', path: '/patient-dashboard/records' },
    { label: 'Last Visit', value: data?.last_visit || 'No Record', icon: Clock, color: '#d97706', bg: '#fffbeb', path: '/patient-dashboard/appointments' },
  ];

  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loaderText}>Synchronizing Clinical Data...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      
      {/* Vitals Entry Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.cardTitle}>Manual Health Update</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X size={20}/></button>
            </div>
            <form onSubmit={handleVitalsSubmit} style={styles.vitalsForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Heart Rate (BPM)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 72" 
                  style={styles.textInput}
                  value={vitalsForm.heart_rate}
                  onChange={(e) => setVitalsForm({...vitalsForm, heart_rate: e.target.value})}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Blood Pressure (mmHg)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 120/80" 
                  style={styles.textInput}
                  value={vitalsForm.blood_pressure}
                  onChange={(e) => setVitalsForm({...vitalsForm, blood_pressure: e.target.value})}
                  required
                />
              </div>
              <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Syncing...' : 'Update Health Matrix'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeMsg}>
            Health <span style={{color: '#059669'}}>Overview</span>
          </h1>
          <p style={styles.subtitle}>Welcome back, {data?.name?.split(' ')[0] || 'Patient'}. All systems are operational.</p>
        </div>
        <div style={styles.headerActions}>
           <div style={styles.uhidCapsule}>
              <span style={styles.uhidLabel}>UHID</span>
              <span style={styles.uhidValue}>{data?.uhid || '---'}</span>
           </div>
           <button style={styles.primaryBtn} onClick={() => navigate('/patient-dashboard/appointments')}>
             <Calendar size={18}/> 
             <span>Book Appointment</span>
           </button>
        </div>
      </header>

      {/* Actionable Alerts */}
      {!data?.is_profile_complete && (
        <div style={styles.alertCard}>
          <div style={styles.alertContent}>
            <div style={styles.alertIcon}><AlertCircle color="#059669" size={24} /></div>
            <div>
              <h4 style={styles.alertTitle}>Identity Verification Required</h4>
              <p style={styles.alertText}>Verify your clinical profile to enable secure, automated record synchronization.</p>
            </div>
          </div>
          <button style={styles.outlineBtn} onClick={() => navigate('/patient-dashboard/profile')}>
            Complete Setup <ArrowUpRight size={16}/>
          </button>
        </div>
      )}

      {/* Quick Action Bento Row */}
      <div style={styles.quickActionGrid}>
        <button style={styles.actionBtn} onClick={() => navigate('/patient-dashboard/telehealth')}>
          <div style={styles.actionIcon}><Zap size={20}/></div>
          <div style={styles.actionText}>
            <span style={styles.actionTitle}>Immediate Consult</span>
            <span style={styles.actionSub}>24/7 Digital Care</span>
          </div>
        </button>
        <button style={styles.actionBtn} onClick={() => navigate('/patient-dashboard/messages')}>
          <div style={{...styles.actionIcon, backgroundColor: '#eff6ff', color: '#2563eb'}}><MessageSquare size={20}/></div>
          <div style={styles.actionText}>
            <span style={styles.actionTitle}>Message Specialist</span>
            <span style={styles.actionSub}>Secure Channel</span>
          </div>
        </button>
        <button style={styles.actionBtn} onClick={() => setIsModalOpen(true)}>
          <div style={{...styles.actionIcon, backgroundColor: '#fef2f2', color: '#dc2626'}}><Activity size={20}/></div>
          <div style={styles.actionText}>
            <span style={styles.actionTitle}>Log Health Data</span>
            <span style={styles.actionSub}>Vitals Entry</span>
          </div>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statCard} onClick={() => navigate(stat.path)}>
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

      {/* Main Grid: Vitals & Logs */}
      <div style={styles.mainGrid}>
        <div style={styles.columnStack}>
          {/* Vitals Node */}
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Live Clinical Metrics</h3>
              <span style={styles.liveBadge}>● LIVE SYNC</span>
            </div>
            <div style={styles.vitalsRow}>
              <div style={styles.vitalMetric}>
                <span style={styles.vitalLabel}>Heart Rate</span>
                <div style={styles.vitalValueGroup}>
                  <span style={styles.vitalValue}>{data?.vitals?.heart_rate || '72'}</span>
                  <span style={styles.vitalUnit}>BPM</span>
                </div>
                <div style={styles.trendLabel}><TrendingUp size={14}/> Stable</div>
              </div>
              <div style={styles.vitalMetric}>
                <span style={styles.vitalLabel}>Blood Pressure</span>
                <div style={styles.vitalValueGroup}>
                  <span style={styles.vitalValue}>{data?.vitals?.blood_pressure || '120/80'}</span>
                  <span style={styles.vitalUnit}>mmHg</span>
                </div>
                <div style={styles.trendLabel}><CheckCircle2 size={14}/> Normal</div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Clinical Activity Timeline</h3>
            </div>
            <div style={styles.timelineContainer}>
              {data?.activities?.length > 0 ? data.activities.map((act, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineMarker}>
                    <div style={styles.timelineDot}></div>
                    {idx !== data.activities.length - 1 && <div style={styles.timelineLine}></div>}
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timeStyle}>{act.time}</span>
                    <p style={styles.feedText}>{act.description}</p>
                  </div>
                </div>
              )) : (
                <p style={styles.emptyText}>No recent activities recorded.</p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.columnStack}>
          {/* Active Medications */}
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Active Prescriptions</h3>
              <ChevronRight size={18} color="#94a3b8" />
            </div>
            <div style={styles.medList}>
              {data?.medications?.length > 0 ? data.medications.map((med, idx) => (
                <div key={idx} style={styles.medItem}>
                  <div>
                    <p style={styles.medName}>{med.name}</p>
                    <p style={styles.medDose}>{med.dosage}</p>
                  </div>
                  <div style={styles.medIcon}><Clock size={16} /></div>
                </div>
              )) : (
                <p style={styles.emptyText}>No active medications found.</p>
              )}
            </div>
          </div>

          {/* Health Insights Card */}
          <div style={{...styles.glassCard, background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', color: '#fff', border: 'none'}}>
            <h3 style={{...styles.cardTitle, color: '#fff'}}>Wellness Intelligence</h3>
            <p style={styles.insightText}>
              Consuming <b>3.0L of water</b> today will optimize your metabolic skin health and renal filtration during your current medication cycle.
            </p>
            <div style={styles.insightBadge}>AI GENERATED INSIGHT</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================== AESTHETIC STYLES ================== */
const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '20px 0', backgroundColor: '#f8fafc' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  welcomeMsg: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  headerActions: { display: 'flex', gap: '12px' },
  uhidCapsule: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' },
  uhidLabel: { backgroundColor: '#f1f5f9', padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: '#64748b' },
  uhidValue: { padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#0f172a' },
  primaryBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  
  // MODAL
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' },
  vitalsForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' },
  textInput: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outlineColor: '#059669' },
  submitBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },

  // ALERT
  alertCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '20px', marginBottom: '24px' },
  alertContent: { display: 'flex', gap: '16px', alignItems: 'center' },
  alertIcon: { backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '12px' },
  alertTitle: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  alertText: { margin: 0, fontSize: '13px', color: '#64748b' },
  outlineBtn: { backgroundColor: '#f0fdf4', color: '#059669', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },

  // QUICK ACTION BENTO
  quickActionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' },
  actionIcon: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { display: 'block', fontWeight: '700', color: '#0f172a', fontSize: '14px' },
  actionSub: { fontSize: '12px', color: '#94a3b8' },

  // STATS
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' },
  iconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', margin: 0 },
  statValue: { fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0' },

  // MAIN GRID
  mainGrid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' },
  columnStack: { display: 'flex', flexDirection: 'column', gap: '24px' },
  glassCard: { backgroundColor: '#fff', padding: '28px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 },
  liveBadge: { fontSize: '9px', fontWeight: '800', color: '#059669', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '8px' },

  // VITALS
  vitalsRow: { display: 'flex', gap: '16px' },
  vitalMetric: { flex: 1, padding: '24px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' },
  vitalLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  vitalValue: { fontSize: '28px', fontWeight: '800', color: '#0f172a' },
  vitalUnit: { fontSize: '12px', color: '#94a3b8', marginLeft: '4px' },
  trendLabel: { fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' },

  // TIMELINE
  timelineContainer: { display: 'flex', flexDirection: 'column' },
  timelineItem: { display: 'flex', gap: '16px' },
  timelineMarker: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timelineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #d1fae5' },
  timelineLine: { width: '2px', flex: 1, backgroundColor: '#f1f5f9', margin: '4px 0' },
  timeStyle: { fontSize: '11px', fontWeight: '700', color: '#94a3b8' },
  feedText: { fontSize: '13px', color: '#475569', margin: '4px 0 24px 0', lineHeight: '1.4' },

  // MEDS
  medList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  medItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' },
  medName: { fontWeight: '700', color: '#0f172a', fontSize: '14px', margin: 0 },
  medDose: { fontSize: '12px', color: '#64748b', margin: '2px 0 0' },
  medIcon: { color: '#cbd5e1' },

  // INSIGHTS
  insightText: { fontSize: '14px', lineHeight: '1.7', opacity: 0.95, marginTop: '16px' },
  insightBadge: { fontSize: '10px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginTop: '20px' },

  // LOADER
  loaderContainer: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loaderText: { marginTop: '16px', color: '#64748b', fontWeight: '600' }
};

export default Overview;