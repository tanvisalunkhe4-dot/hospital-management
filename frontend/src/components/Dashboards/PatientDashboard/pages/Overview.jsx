import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import axios from 'axios';
import { 
  Calendar, Activity, ClipboardList, Clock, 
  ArrowUpRight, AlertCircle, CheckCircle2,
  MessageSquare, Zap, Heart, Droplets
} from 'lucide-react';

const Overview = () => {
  const navigate = useNavigate(); // Hook for button actions
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ heart_rate: '', blood_pressure: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Handler for Vitals Submission
  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/v1/patient/update-vitals', vitalsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setVitalsForm({ heart_rate: '', blood_pressure: '' });
      fetchPatientData(); // Refresh data to show new vitals
      alert("Vitals updated successfully!");
    } catch (error) {
      console.error("Error updating vitals:", error);
      alert("Failed to update vitals. Please try again.");
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

  if (loading) return <div style={styles.loader}>Initializing Clinical Workspace...</div>;

  return (
    <div style={styles.container}>
      
      {/* Vitals Entry Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.cardTitle}>Manual Vitals Entry</h3>
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
                {isSubmitting ? 'Syncing...' : 'Update Vitals'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeMsg}>
            Welcome back, <span style={{color: '#059669'}}>{data?.name || 'Patient'}</span>
          </h1>
          <p style={styles.subtitle}>Real-time clinical status and health synchronization.</p>
        </div>
        <div style={styles.headerActions}>
           <div style={styles.uhidCapsule}>
              <span style={styles.uhidLabel}>UHID</span>
              <span style={styles.uhidValue}>{data?.uhid || '---'}</span>
           </div>
           {/* Functional Book Appointment Button */}
           <button 
            style={styles.primaryBtn} 
            onClick={() => navigate('/patient-dashboard/appointments')}
           >
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
              <p style={styles.alertText}>Verify your clinical profile to enable automated record synchronization.</p>
            </div>
          </div>
          <button style={styles.outlineBtn} onClick={() => navigate('/patient-dashboard/profile')}>
            Complete Setup <ArrowUpRight size={16}/>
          </button>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div style={styles.quickActionSection}>
        <div style={styles.quickActionGrid}>
          <button style={styles.actionBtn} onClick={() => navigate('/patient-dashboard/telehealth')}>
            <div style={styles.actionIcon}><Zap size={18}/></div>
            <span>Immediate Consult</span>
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/patient-dashboard/messages')}>
            <div style={{...styles.actionIcon, backgroundColor: '#eff6ff', color: '#2563eb'}}><MessageSquare size={18}/></div>
            <span>Message Doctor</span>
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/patient-dashboard/records')}>
            <div style={{...styles.actionIcon, backgroundColor: '#fef2f2', color: '#dc2626'}}><Heart size={18}/></div>
            <span>Vitals Entry</span>
          </button>
        </div>
      </div>

      {/* Performance Stats Grid - Clickable Cards */}
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

      {/* Main Information Grid */}
      <div style={styles.mainGrid}>
        <div style={styles.columnStack}>
          {/* Vitals Monitor */}
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Live Vitals Monitor</h3>
              <span style={styles.liveBadge}>LAST SYNC: JUST NOW</span>
            </div>
            <div style={styles.vitalsRow}>
              <div style={styles.vitalMetric}>
                <span style={styles.vitalLabel}>Heart Rate</span>
                <div style={styles.vitalValueGroup}>
                  <span style={styles.vitalValue}>{data?.vitals?.heart_rate || '72'}</span>
                  <span style={styles.vitalUnit}>BPM</span>
                </div>
                <div style={styles.trendStable}>Optimal</div>
              </div>
              <div style={styles.vitalMetric}>
                <span style={styles.vitalLabel}>Blood Pressure</span>
                <div style={styles.vitalValueGroup}>
                  <span style={styles.vitalValue}>{data?.vitals?.blood_pressure || '120/80'}</span>
                  <span style={styles.vitalUnit}>mmHg</span>
                </div>
                <div style={styles.trendStable}>Normal</div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Clinical Activity Log</h3>
            </div>
            <div style={styles.feedList}>
              {data?.activities?.length > 0 ? data.activities.map((act, idx) => (
                <div key={idx} style={styles.feedItem}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span style={styles.timeStyle}>{act.time}</span>
                  <p style={styles.feedText}>{act.description}</p>
                </div>
              )) : (
                <p style={styles.emptyText}>No recent activities recorded.</p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.columnStack}>
          {/* Medications */}
          <div style={styles.glassCard}>
            <h3 style={styles.cardTitle}>Active Prescriptions</h3>
            <div style={styles.medList}>
              {data?.medications?.length > 0 ? data.medications.map((med, idx) => (
                <div key={idx} style={styles.medItem}>
                  <div>
                    <p style={styles.medName}>{med.name}</p>
                    <p style={styles.medDose}>{med.dosage}</p>
                  </div>
                  <Clock size={16} color="#94a3b8" />
                </div>
              )) : (
                <p style={styles.emptyText}>No active medications.</p>
              )}
            </div>
          </div>

          {/* Health Insights */}
          <div style={styles.glassCard}>
            <h3 style={styles.cardTitle}>Wellness Intelligence</h3>
            <div style={styles.insightBox}>
               <p style={styles.insightText}>
                 <b>Hydration Goal:</b> Consuming 3L of water daily optimizes renal filtration and enhances metabolic skin health.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================== PROFESSIONAL STYLES ================== */
const styles = {
  container: { maxWidth: '1440px', margin: '0 auto', padding: '40px 24px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
  welcomeMsg: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { color: '#64748b', fontSize: '15px', marginTop: '6px' },
  headerActions: { display: 'flex', gap: '16px', alignItems: 'center' },
  uhidCapsule: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  uhidLabel: { backgroundColor: '#f8fafc', padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', borderRight: '1px solid #e2e8f0' },
  uhidValue: { padding: '10px 14px', fontSize: '13px', fontWeight: '700', color: '#1e293b' },
  primaryBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  
  // NEW MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  vitalsForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputLabel: { fontSize: '14px', fontWeight: '700', color: '#475569' },
  textInput: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outlineColor: '#059669' },
  submitBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' },
  alertCard: { backgroundColor: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  alertContent: { display: 'flex', gap: '20px', alignItems: 'center' },
  alertIcon: { backgroundColor: '#fff', padding: '12px', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  alertTitle: { margin: 0, color: '#064e3b', fontWeight: '800', fontSize: '16px' },
  alertText: { margin: '4px 0 0', fontSize: '14px', color: '#065f46', opacity: 0.8 },
  outlineBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },

  quickActionSection: { marginBottom: '32px' },
  quickActionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  actionBtn: { backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  actionIcon: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' },
  statCard: { backgroundColor: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'transform 0.2s ease' },
  iconBox: { width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' },
  statValue: { fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0 0' },

  mainGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' },
  columnStack: { display: 'flex', flexDirection: 'column', gap: '32px' },
  glassCard: { backgroundColor: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  cardTitle: { fontSize: '19px', fontWeight: '800', color: '#1e293b', margin: 0 },
  liveBadge: { fontSize: '10px', fontWeight: '800', color: '#059669', backgroundColor: '#d1fae5', padding: '5px 12px', borderRadius: '8px', letterSpacing: '0.5px' },

  vitalsRow: { display: 'flex', gap: '20px' },
  vitalMetric: { flex: 1, padding: '24px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' },
  vitalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  vitalValueGroup: { display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' },
  vitalValue: { fontSize: '28px', fontWeight: '800', color: '#1e293b' },
  vitalUnit: { fontSize: '13px', color: '#94a3b8', fontWeight: '600' },
  trendStable: { fontSize: '12px', color: '#059669', fontWeight: '700' },

  medList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  medItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' },
  medName: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#334155' },
  medDose: { margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' },

  feedList: { display: 'flex', flexDirection: 'column', gap: '18px' },
  feedItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  timeStyle: { color: '#94a3b8', fontWeight: '700', fontSize: '12px', minWidth: '65px' },
  feedText: { margin: 0, color: '#475569', fontSize: '14px', fontWeight: '500' },
  emptyText: { color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' },
  
  insightBox: { padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '20px', borderLeft: '5px solid #059669' },
  insightText: { margin: 0, fontSize: '15px', color: '#166534', lineHeight: '1.6', fontWeight: '500' },
  loader: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: '700', fontSize: '18px' }
};

export default Overview;