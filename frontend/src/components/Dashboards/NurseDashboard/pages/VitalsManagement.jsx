import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, Activity, Thermometer, Droplets, 
  Save, History, ClipboardCheck, Loader2, AlertCircle, ChevronLeft
} from 'lucide-react';

const VitalsManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [vitals, setVitals] = useState({
    blood_pressure: '',
    pulse_rate: '',
    temperature: '',
    spo2: '',
    notes: ''
  });

  const API_BASE = "http://localhost:8000/api/v1/nurse";
  const token = sessionStorage.getItem('token');

  const fetchInitialData = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${token}` };

      const [pRes, hRes] = await Promise.all([
        axios.get(`${API_BASE}/patient/${patientId}`, { headers }),
        axios.get(`${API_BASE}/vitals-history/${patientId}`, { headers })
      ]);

      setPatient(pRes.data);
      setHistory(hRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Clinical records inaccessible.");
    } finally {
      setLoading(false);
    }
  }, [patientId, token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API_BASE}/vitals`, {
        patient_id: parseInt(patientId),
        blood_pressure: vitals.blood_pressure,
        pulse_rate: parseInt(vitals.pulse_rate), // Convert to number for DB
        temperature: parseFloat(vitals.temperature), // Convert to float for DB
        spo2: parseInt(vitals.spo2), // Mapped to sp_o2 in nurse.py
        notes: vitals.notes // Mapped to remarks in nurse.py
      }, { headers });


    alert("Vitals synchronized. Patient moved to Doctor's Queue.");
    navigate('/nurse-dashboard'); // Redirect back to the monitoring list

      // Clean refresh of history
      const hRes = await axios.get(`${API_BASE}/vitals-history/${patientId}`, { headers });
      setHistory(hRes.data);
      setVitals({ blood_pressure: '', pulse_rate: '', temperature: '', spo2: '', notes: '' });
      
      // Professional notification instead of alert could go here
      console.log("Vitals synchronized successfully.");
    } catch (err) {
      alert("Validation Error: " + (err.response?.data?.detail || "Verify connection"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patientId) return <ErrorState message="No Patient Identity Provided" icon={<AlertCircle size={48}/>} />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} icon={<AlertCircle size={48}/>} />;

  return (
    <div style={containerStyle}>
      {/* Breadcrumb / Navigation */}
      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        <ChevronLeft size={16} /> Back to Monitoring
      </button>

      {/* Patient Clinical Header */}
      <div style={patientBanner}>
        <div style={avatarContainer}>
          <div style={largeAvatar}>{patient?.first_name?.charAt(0)}</div>
          <div>
            <h2 style={headerTitle}>{patient?.first_name} {patient?.last_name}</h2>
            <code style={uhidLabel}>{patient?.uhid || 'ID-PENDING'}</code>
          </div>
        </div>
        <div style={badgeRow}>
          <div style={metaItem}>
            <span style={metaLabel}>LOCATION</span>
            <span style={metaValue}>{patient?.bed_number || 'WARD-B'}</span>
          </div>
          <div style={metaItem}>
            <span style={metaLabel}>BLOOD GROUP</span>
            <span style={{...metaValue, color: '#ef4444'}}>{patient?.blood_group || 'O+'}</span>
          </div>
        </div>
      </div>

      <div style={mainContentGrid}>
        {/* Entry Panel */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <ClipboardCheck size={20} color="#10b981" />
            <h3 style={cardTitle}>Observation Entry</h3>
          </div>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGrid}>
              <VitalInput 
                label="Blood Pressure" icon={<Heart size={16} color="#ef4444"/>} placeholder="120/80" 
                value={vitals.blood_pressure} onChange={(v) => setVitals({...vitals, blood_pressure: v})} 
              />
              <VitalInput 
                label="Pulse Rate (BPM)" icon={<Activity size={16} color="#10b981"/>} placeholder="72" type="number"
                value={vitals.pulse_rate} onChange={(v) => setVitals({...vitals, pulse_rate: v})} 
              />
              <VitalInput 
                label="Temp (°F)" icon={<Thermometer size={16} color="#f59e0b"/>} placeholder="98.6" type="number"
                value={vitals.temperature} onChange={(v) => setVitals({...vitals, temperature: v})} 
              />
              <VitalInput 
                label="SpO2 (%)" icon={<Droplets size={16} color="#3b82f6"/>} placeholder="98" type="number"
                value={vitals.spo2} onChange={(v) => setVitals({...vitals, spo2: v})} 
              />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>NURSING NOTES</label>
              <textarea 
                style={textareaStyle} placeholder="Record any symptomatic changes or patient complaints..." 
                value={vitals.notes} onChange={(e) => setVitals({...vitals, notes: e.target.value})}
              />
            </div>
            <button type="submit" disabled={submitting} style={submitButton}>
              {submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
              {submitting ? 'Syncing...' : 'Commit to Medical Record'}
            </button>
          </form>
        </div>

        {/* Trends Panel */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <History size={20} color="#10b981" />
            <h3 style={cardTitle}>Clinical Trends (Last 10 Records)</h3>
          </div>
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr style={thRow}>
                  <th style={tdStyle}>Timestamp</th>
                  <th style={tdStyle}>BP</th>
                  <th style={tdStyle}>Pulse</th>
                  <th style={tdStyle}>Temp</th>
                  <th style={tdStyle}>Observation</th>
                </tr>
              </thead>
              <tbody>
  {history.map((row, i) => (
    <tr key={i} style={trStyle}>
      <td style={timeCol}>
        {new Date(row.recorded_at).toLocaleDateString([], {month:'short', day:'numeric'})}
        <div style={{fontSize: '11px', opacity: 0.7}}>
          {new Date(row.recorded_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </div>
      </td>
      <td style={valCol}>{row.blood_pressure || '--'}</td>
      <td style={valCol}>{row.pulse_rate} <span style={unitTag}>bpm</span></td>
      <td style={valCol}>{row.temperature}°</td>
      {/* Change row.notes to row.remarks */}
      <td style={noteCol}>{row.remarks || '--'}</td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const LoadingState = () => (
  <div style={loaderStyle}>
    <Loader2 className="animate-spin" size={40} color="#10b981" />
    <p style={{fontWeight: '600', color: '#64748b'}}>Retrieving Patient Context...</p>
  </div>
);

const ErrorState = ({ message, icon }) => (
  <div style={errorContainer}>
    {icon}
    <h3 style={{color: '#1e293b'}}>{message}</h3>
    <button onClick={() => window.location.reload()} style={backButtonStyle}>Retry Connection</button>
  </div>
);

const VitalInput = ({ label, icon, placeholder, value, onChange, type="text" }) => (
  <div style={inputGroup}>
    <label style={labelStyle}>{label}</label>
    <div style={inputWrapper}>
      <span style={iconSpan}>{icon}</span>
      <input 
        type={type} style={fieldStyle} placeholder={placeholder} required
        value={value} onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  </div>
);

// --- Refined Professional Styles ---
const containerStyle = { padding: '30px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' };
const backButtonStyle = { width: 'fit-content', background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
const patientBanner = { background: '#10b981', color: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' };
const avatarContainer = { display: 'flex', alignItems: 'center', gap: '20px' };
const largeAvatar = { width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' };
const headerTitle = { margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' };
const uhidLabel = { fontSize: '13px', background: 'rgba(0,0,0,0.1)', padding: '4px 8px', borderRadius: '4px' };
const badgeRow = { display: 'flex', gap: '30px' };
const metaItem = { display: 'flex', flexDirection: 'column', gap: '4px' };
const metaLabel = { fontSize: '10px', fontWeight: '800', opacity: 0.8, letterSpacing: '1px' };
const metaValue = { fontSize: '18px', fontWeight: '800' };

const mainContentGrid = { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' };
const cardStyle = { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cardHeader = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' };
const cardTitle = { margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' };

const formStyle = { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' };
const inputWrapper = { display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', transition: 'all 0.2s' };
const iconSpan = { opacity: 0.7 };
const fieldStyle = { border: 'none', background: 'transparent', padding: '12px 10px', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '700', color: '#1e293b' };
const textareaStyle = { minHeight: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', resize: 'none', fontWeight: '500' };
const submitButton = { background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'transform 0.1s' };

const tableWrapper = { padding: '0 20px 20px', maxHeight: '500px', overflowY: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' };
const thRow = { textAlign: 'left' };
const tdStyle = { padding: '12px 10px', fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' };
const trStyle = { background: '#f8fafc' };
const valCol = { padding: '15px 10px', fontSize: '15px', fontWeight: '800', color: '#1e293b' };
const unitTag = { fontSize: '10px', color: '#94a3b8', marginLeft: '2px' };
const timeCol = { ...valCol, color: '#10b981', borderLeft: '4px solid #10b981', borderRadius: '8px 0 0 8px' };
const noteCol = { ...valCol, fontWeight: '500', fontSize: '13px', color: '#64748b', borderRadius: '0 8px 8px 0' };

const loaderStyle = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' };
const errorContainer = { padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#64748b' };

export default VitalsManagement;