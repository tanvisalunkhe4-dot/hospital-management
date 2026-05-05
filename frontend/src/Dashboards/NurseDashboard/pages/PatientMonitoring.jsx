import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Thermometer, Heart, Search, Loader2 } from 'lucide-react';

const PatientMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Live Data from FastAPI
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Ensure this URL matches your FastAPI backend address
        const response = await axios.get('http://localhost:8000/api/v1/nurse/patients-monitoring');
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching live monitoring data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
    // Optional: Set up polling to refresh every 30 seconds for "live" updates
    const interval = setInterval(fetchPatientData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Filter logic for the search bar
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.bed_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={loaderContainer}>
        <Loader2 className="animate-spin" size={40} color="#10b981" />
        <p>Syncing Live Patient Data...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Live Patient Monitoring</h2>
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
        {filteredPatients.map((patient) => (
          <div key={patient.id} style={cardStyle}>
            <div style={cardHeader}>
              <span style={bedBadge}>{patient.bed_number}</span>
              <h3 style={patientName}>{patient.name}</h3>
            </div>
            
            <div style={vitalsGrid}>
              <VitalItem icon={<Heart size={16} color="#ef4444"/>} label="B.P" value={patient.latest_bp || 'N/A'} />
              <VitalItem icon={<Activity size={16} color="#10b981"/>} label="Pulse" value={patient.latest_pulse ? `${patient.latest_pulse} bpm` : 'N/A'} />
              <VitalItem icon={<Thermometer size={16} color="#f59e0b"/>} label="Temp" value={patient.latest_temp ? `${patient.latest_temp}°F` : 'N/A'} />
            </div>

            <button 
              style={updateButtonStyle}
              onClick={() => window.location.href = `/nurse-dashboard/vitals?patientId=${patient.id}`}
            >
              Update Vitals
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable VitalItem and Styles remain same as your original code...
const loaderContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '10px', color: '#64748b' };
// ... (rest of your styles)

const VitalItem = ({ icon, label, value }) => (
  <div style={vitalItemStyle}>
    <div style={iconCircle}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={vitalLabel}>{label}</span>
      <span style={vitalValue}>{value}</span>
    </div>
  </div>
);

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

export default PatientMonitoring;