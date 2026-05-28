import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, Clipboard, Clock, Users, FileText, FileSearch, Activity, FileCheck } from 'lucide-react';


const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/doctor',
});

// 2. Add an interceptor to inject the token automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MedicalRecords = () => {
  const [activePatientId, setActivePatientId] = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null); // Tracks the index of the open visit
  const [view, setView] = useState('list');
  const [prescriptionData, setPrescriptionData] = useState([]); 
  const [records, setRecords] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labReports, setLabReports] = useState([]);
  const uniquePatientsCount = new Set(records.map(r => r.patient_id)).size;
  const uniquePatientList = Array.from(new Map(records.map(r => [r.patient_id, r])).values());
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const totalVisits = records.length;
  const pendingLabs = 3; 

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/doctor/medical-records/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecords(response.data);
    } catch (error) { console.error("Error fetching records:", error); }
    setLoading(false);
  };

  const fetchHistory = async (patientId) => {
    setLoading(true);
    setActivePatientId(patientId);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/doctor/patient/${patientId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Full history response received:", response.data);
      setHistoryData(response.data);
      setView('history');
    } catch (error) { console.error("Error fetching history:", error); }
    setLoading(false);
  };

  // Replace axios.get(...) with api.get(...) in all your functions:

const fetchPrescriptions = async (patientId) => {
  setLoading(true);
  try {
    // Use 'api' instance instead of 'axios'
    const response = await api.get(`/patient/${patientId}/prescriptions`); 
    setPrescriptionData(response.data);
    setView('prescriptions');
  } catch (error) { 
    console.error("Error fetching prescriptions:", error); 
  } finally {
    setLoading(false);
  }
};


  const fetchLabReports = async (patientId) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/doctor/patient/${patientId}/lab-reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLabReports(response.data);
      setView('labs'); // Switch to a new 'labs' view
    } catch (error) { 
      console.error("Error fetching labs:", error); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const ActionButton = ({ icon: Icon, title, onClick, color }) => (
    <button 
      onClick={onClick} 
      title={title} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '6px', 
        border: '1px solid #e2e8f0', 
        background: 'white',
        color: color,
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        fontSize: '12px',
        fontWeight: '500',
        width: '100%' 
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = `${color}08`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      <Icon size={14} />
      {title}
    </button>
  );

  const StatCard = ({ icon: Icon, color, title, value }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ background: `${color}15`, padding: '12px', borderRadius: '10px' }}><Icon color={color} size={22}/></div>
      <div>
        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>{title}</p>
        <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#0f172a', fontWeight: '700' }}>{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} color="#059669" /></div>;

  return (
    <div style={{ padding: '0 8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 1. LIST VIEW */}
      {view === 'list' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <StatCard icon={Users} color="#059669" title="Active Patients" value={uniquePatientsCount} />
            <StatCard icon={Activity} color="#8b5cf6" title="Total Consultations" value={totalVisits} />
            <StatCard icon={FileCheck} color="#f59e0b" title="Pending Reports" value={pendingLabs} />
          </div>
  
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Patient Directory</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 24px' }}>Patient Name</th>
                  <th style={{ padding: '16px 24px' }}>Last Consultation</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center' }}>History</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center' }}>Prescriptions</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center' }}>Lab Reports</th>
                </tr>
              </thead>
              <tbody>
                {uniquePatientList.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500', color: '#334155' }}>{r.patient_name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{r.visit_date}</td>
                    <td style={{ padding: '8px' }}><ActionButton icon={Clock} title="History" color="#64748b" onClick={() => fetchHistory(r.patient_id)} /></td>
                    <td style={{ padding: '8px' }}><ActionButton icon={FileText} title="Prescriptions" color="#059669" onClick={() => fetchPrescriptions(r.patient_id)} /></td>
                    <td style={{ padding: '8px' }}><ActionButton icon={FileSearch} title="Labs" color="#2563eb" onClick={() => fetchLabReports(r.patient_id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : view === 'history' ? (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <button 
            onClick={() => setView('list')} 
            style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#059669', fontWeight: '600' }}
          >
            <ArrowLeft size={16} /> Return to Directory
          </button>
      
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* 1. STICKY PATIENT PROFILE */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0f172a' }}>{historyData?.patient_info.name}</h3>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
                {/* Replace the existing lines in your Sticky Profile */}
<p style={{ margin: '4px 0' }}>Age: {historyData?.patient_info.age || historyData?.patient_info.dob || 'N/A'}</p>
<p style={{ margin: '4px 0' }}>Blood Group: {historyData?.patient_info.blood_group || historyData?.patient_info.bloodGroup || 'N/A'}</p>
    </div>
              <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Chronic Conditions</h4>
              <div style={{ marginTop: '8px' }}>
                {historyData?.chronic_conditions?.length > 0 ? (
                  historyData.chronic_conditions.map((c, i) => <span key={i} style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>• {c}</span>)
                ) : <p style={{ fontSize: '12px', color: '#cbd5e1' }}>None recorded</p>}
              </div>
            </div>
      
            {/* 2. INTERACTIVE TIMELINE */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
                <Clock size={20} color="#059669" /> Clinical History
              </h3>
              
              {historyData?.visit_history.map((v, i) => (
                <div key={i} style={{ paddingLeft: '24px', borderLeft: '2px solid #e2e8f0', marginBottom: '32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#059669', border: '2px solid white' }}></div>
                  
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{v.visit_date}</span>
                  <h4 style={{ margin: '4px 0 8px', color: '#0f172a', fontSize: '16px' }}>{v.diagnosis}</h4>
                  
                  {/* Replace your hardcoded BP/Temp spans with dynamic data */}
{/* Dynamic Vitals rendering */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
  <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569' }}>
    {/* Ensure 'systolic' and 'diastolic' match the keys in your API response */}
    BP: {v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : 'N/A'} mmHg
  </span>
  <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569' }}>
    {/* Ensure 'temperature' matches the key in your API response */}
    Temp: {v.temperature ? `${v.temperature}°F` : 'N/A'}
  </span>
</div>
      
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                    {v.notes}
                  </div>
                  
                  {/* Navigational Action Buttons */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button 
  disabled={loading}
  onClick={(e) => {
    e.stopPropagation();
    
    console.log("Attempting to fetch labs with stored ID:", activePatientId);
    
    if (activePatientId) {
      fetchLabReports(activePatientId);
    } else {
      alert("Error: Patient ID not found. Please return to the directory and try again.");
    }
  }}
  style={{ 
    fontSize: '11px', 
    padding: '6px 12px', 
    cursor: loading ? 'not-allowed' : 'pointer', 
    background: loading ? '#f1f5f9' : '#eff6ff', 
    border: '1px solid #bfdbfe', 
    color: loading ? '#94a3b8' : '#1e40af', 
    borderRadius: '6px', 
    fontWeight: '600',
    transition: 'all 0.2s'
  }}
>
  {loading ? 'Loading...' : 'View Lab Reports'}
</button>
  
  <button 
  disabled={loading}
  onClick={(e) => {
    e.stopPropagation();
    
    // Use the ID we stored in state when the user first entered this view
    console.log("Attempting to fetch with stored ID:", activePatientId);
    
    if (activePatientId) {
      fetchPrescriptions(activePatientId);
    } else {
      alert("Error: Patient ID not found. Please return to the directory and try again.");
    }
  }}
  style={{ 
    position: 'relative', 
    zIndex: 9999,
    fontSize: '11px', 
    padding: '6px 12px', 
    cursor: loading ? 'not-allowed' : 'pointer', 
    background: loading ? '#f1f5f9' : '#f0fdf4', 
    border: '1px solid #bbf7d0', 
    color: loading ? '#94a3b8' : '#166534', 
    borderRadius: '6px', 
    fontWeight: '600',
    transition: 'all 0.2s',
    pointerEvents: 'auto'
  }}
>
  {loading ? 'Loading...' : 'View Prescriptions'}
</button>
</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      
      ) : view === 'labs' ? (
        /* 3. LABS VIEW */
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('list')} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back to Directory
          </button>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>Completed Lab Reports</div>
            {labReports.filter(r => ['Completed', 'Verified', 'Sent'].includes(r.status)).length > 0 ? (
              labReports.filter(r => ['Completed', 'Verified', 'Sent'].includes(r.status)).map((report) => (
                <div key={report.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{report.test_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Date: {new Date(report.requested_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534', textTransform: 'uppercase' }}>{report.status}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No completed lab reports found.</div>
            )}
          </div>
        </div>
      ) : view === 'prescriptions' ? (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('list')} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#059669', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back to Directory
          </button>
          
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>Medication History</div>
            
            {prescriptionData.length > 0 ? prescriptionData.map((visit, index) => (
              <div key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* Header: Clickable to Toggle */}
                <div 
                  onClick={() => setExpandedVisit(expandedVisit === index ? null : index)}
                  style={{ padding: '20px', background: '#f8fafc', cursor: 'pointer', fontWeight: '700', color: '#059669', display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Consultation Date: {visit.visit_date}</span>
                  <span>{expandedVisit === index ? '▲ Hide' : '▼ View Details'}</span>
                </div>
                
                {/* Details: Only show if this index is selected */}
                {expandedVisit === index && visit.prescriptions.map((p, pIdx) => (
                  <div key={pIdx} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.medicine}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{p.dosage} | {p.frequency} | {p.duration}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>QTY: {p.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No prescriptions found.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MedicalRecords;