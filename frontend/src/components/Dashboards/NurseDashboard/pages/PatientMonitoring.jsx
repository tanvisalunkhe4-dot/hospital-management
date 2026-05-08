import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Activity, Thermometer, Heart, Search, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const PatientMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  const fetchPatientData = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token'); // Get your JWT token
      const response = await axios.get('http://localhost:8000/api/v1/nurse/patients-monitoring', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPatients(response.data);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Clinical Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(fetchPatientData, 10000); // Shorter sync for "Live" feel
    return () => clearInterval(interval);
  }, [fetchPatientData]);

  const filteredPatients = patients.filter(p => {
    // Only show patients with a Checked-In status
    const isCheckedIn = p.checked_in === true || p.status === 'Checked In'; 
    
    // Apply your existing search logic
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.uhid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isCheckedIn && matchesSearch;
  });
  if (loading) {
    return (
      <div style={loaderContainer}>
        <Loader2 className="animate-spin" size={40} color="#10b981" />
        <p style={{fontWeight: '600', color: '#64748b'}}>Establishing Secure Clinical Link...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Dynamic Header */}
      <div style={headerStyle}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <h2 style={titleStyle}>Live Patient Monitoring</h2>
            <div style={liveBadge}>
              <div style={pulseDot}></div> LIVE
            </div>
          </div>
          <p style={subtitleStyle}>Wards Active • Last Synced: {lastSynced}</p>
        </div>
        
        <div style={searchBox}>
          <Search size={18} color="#94a3b8" />
          <input 
            style={inputStyle} 
            placeholder="Search by UHID or Name..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Interface */}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>Identity / UHID</th>
              <th style={thStyle}>Bed</th>
              <th style={thStyle}>Triage Status</th>
              <th style={thStyle}>Clinical Vitals</th>
              <th style={thStyle}>Last Update</th>
              <th style={thCenterStyle}>Operations</th>
            </tr>
          </thead>
          <tbody>
          {filteredPatients.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
        <RefreshCw size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} className="animate-spin-slow" />
        <p style={{ fontWeight: '600' }}>No active patients checked in for monitoring.</p>
        <p style={{ fontSize: '12px' }}>New check-ins from the receptionist will appear here automatically.</p>
      </td>
    </tr>
  ) : (
    filteredPatients.map((patient) => (
      <tr key={patient.id} style={rowStyle}>
        {/* ... your existing <td> cells ... */}
      </tr>
    ))
  )}
            {filteredPatients.map((patient) => (
              <tr key={patient.id} style={rowStyle}>
                <td style={nameColumnStyle}>
                  <div style={patientAvatar}>{patient.name.charAt(0)}</div>
                  <div>
                    <div style={{fontWeight: '700', color: '#1e293b'}}>{patient.name}</div>
                    <div style={{fontSize: '11px', color: '#64748b', fontFamily: 'monospace'}}>{patient.uhid || 'NX-PENDING'}</div>
                  </div>
                </td>
                <td><span style={bedBadge}>{patient.bed_number}</span></td>
                <td>
  <div style={getStatusBadgeStyle(patient.status_type)}>
    {/* Always show green for checked-in unless they are critical */}
    {patient.status_type === 'critical' ? <AlertTriangle size={12} /> : <Activity size={12} />}
    {patient.status?.toUpperCase()}
  </div>
</td>
                <td>
                  <div style={vitalsRow}>
                    <VitalPill icon={<Heart size={14} color="#ef4444"/>} value={patient.vitals?.bp} />
                    <VitalPill 
                      icon={<Activity size={14} color="#10b981"/>} 
                      value={patient.vitals?.pulse} 
                      unit="bpm" 
                      isCritical={patient.status_type === 'critical'}
                    />
                    <VitalPill icon={<Thermometer size={14} color="#f59e0b"/>} value={patient.vitals?.temp} unit="°F" />
                  </div>
                </td>
                <td style={timeStyle}>{patient.vitals?.last_update || 'Never'}</td>
                <td style={thCenterStyle}>
                  <button 
                    style={actionButtonStyle}
                    onClick={() => window.location.href = `/nurse-dashboard/vitals?patientId=${patient.id}`}
                  >
                    Manage Vitals
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Enhanced Professional Styling ---

const getStatusBadgeStyle = (type) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.5px',
  background: type === 'critical' ? '#fff1f2' : '#f0fdf4',
  color: type === 'critical' ? '#e11d48' : '#16a34a',
  border: `1px solid ${type === 'critical' ? '#fecdd3' : '#bbf7d0'}`,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
});

const VitalPill = ({ icon, value, unit = "", isCritical = false }) => (
  <div style={{
    ...pillStyle, 
    borderColor: isCritical ? '#fecdd3' : '#e2e8f0',
    background: isCritical ? '#fff1f2' : '#f8fafc'
  }}>
    {icon}
    <span style={{color: isCritical ? '#e11d48' : '#1e293b'}}>{value !== 'N/A' ? `${value}${unit}` : '--'}</span>
  </div>
);

// New UI Elements
const liveBadge = {
  background: '#f0fdf4',
  color: '#16a34a',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  border: '1px solid #bbf7d0'
};

const pulseDot = {
  width: '6px',
  height: '6px',
  background: '#16a34a',
  borderRadius: '50%',
  boxShadow: '0 0 0 0 rgba(22, 163, 74, 1)',
  animation: 'pulse 1.5s infinite'
};

const containerStyle = { padding: '30px', maxWidth: '1400px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const titleStyle = { margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' };
const subtitleStyle = { margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };
const searchBox = { display: 'flex', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '12px', width: '350px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const inputStyle = { border: 'none', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b', fontWeight: '500' };
const tableContainer = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const headerRowStyle = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '18px 24px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' };
const thCenterStyle = { ...thStyle, textAlign: 'center' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const nameColumnStyle = { padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' };
const patientAvatar = { width: '38px', height: '38px', background: '#10b981', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' };
const vitalsRow = { display: 'flex', gap: '10px' };
const pillStyle = { padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', border: '1px solid #e2e8f0' };
const bedBadge = { background: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', border: '1px solid #e2e8f0' };
const timeStyle = { padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '500' };
const actionButtonStyle = { padding: '8px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' };
const loaderContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '15px' };

export default PatientMonitoring; 