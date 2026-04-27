import React, { useState } from 'react';
import { Activity, Thermometer, Droplets, Heart, Search } from 'lucide-react';

const PatientMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data to visualize the vitals management
  const patients = [
    { id: "P-101", name: "Rahul Sharma", bed: "Ward A-10", bp: "120/80", pulse: "72", temp: "98.6°F" },
    { id: "P-102", name: "Priya Patil", bed: "Ward A-12", bp: "145/95", pulse: "88", temp: "101.2°F" },
  ];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Patient Monitoring & Vitals</h2>
        <div style={searchBox}>
          <Search size={18} color="#64748b" />
          <input 
            style={inputStyle} 
            placeholder="Search by Bed or Name..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={gridStyle}>
        {patients.map((patient) => (
          <div key={patient.id} style={cardStyle}>
            <div style={cardHeader}>
              <span style={bedBadge}>{patient.bed}</span>
              <h3 style={patientName}>{patient.name}</h3>
            </div>
            
            <div style={vitalsGrid}>
              <VitalItem icon={<Heart size={16} color="#ef4444"/>} label="B.P" value={patient.bp} />
              <VitalItem icon={<Activity size={16} color="#10b981"/>} label="Pulse" value={`${patient.pulse} bpm`} />
              <VitalItem icon={<Thermometer size={16} color="#f59e0b"/>} label="Temp" value={patient.temp} />
            </div>

            <button style={updateButtonStyle}>Update Vitals</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable Sub-component
const VitalItem = ({ icon, label, value }) => (
  <div style={vitalItemStyle}>
    <div style={iconCircle}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={vitalLabel}>{label}</span>
      <span style={vitalValue}>{value}</span>
    </div>
  </div>
);

// --- Styles ---
const containerStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const titleStyle = { margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '800' };
const searchBox = { display: 'flex', alignItems: 'center', background: '#fff', padding: '8px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '10px' };
const inputStyle = { border: 'none', outline: 'none', fontSize: '14px', width: '200px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' };
const bedBadge = { background: '#f0fdf4', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' };
const patientName = { margin: 0, fontSize: '16px', color: '#334155' };
const vitalsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const vitalItemStyle = { display: 'flex', alignItems: 'center', gap: '10px' };
const iconCircle = { background: '#f8fafc', padding: '8px', borderRadius: '8px' };
const vitalLabel = { fontSize: '11px', color: '#64748b', fontWeight: '600' };
const vitalValue = { fontSize: '14px', color: '#1e293b', fontWeight: '700' };
const updateButtonStyle = { width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };

// 🟢 CRITICAL: THIS PREVENTS THE "SYNTAX ERROR: NO DEFAULT EXPORT"
export default PatientMonitoring;