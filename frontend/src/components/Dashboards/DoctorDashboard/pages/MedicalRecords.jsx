import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, Clipboard, Clock, Users, FileText, FileSearch, Activity, FileCheck } from 'lucide-react';

const MedicalRecords = () => {
  const [view, setView] = useState('list');
  const [records, setRecords] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const uniquePatientsCount = new Set(records.map(r => r.patient_id)).size;
  const uniquePatientList = Array.from(new Map(records.map(r => [r.patient_id, r])).values());

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
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/doctor/patient/${patientId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistoryData(response.data);
      setView('history');
    } catch (error) { console.error("Error fetching history:", error); }
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
                    
                    {/* EACH ACTION GETS ITS OWN TD CELL */}
                    <td style={{ padding: '8px' }}>
                      <ActionButton icon={Clock} title="History" color="#64748b" onClick={() => fetchHistory(r.patient_id)} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <ActionButton icon={FileText} title="Prescriptions" color="#059669" onClick={() => {}} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <ActionButton icon={FileSearch} title="Labs" color="#2563eb" onClick={() => {}} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* History View Logic */
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
          <button onClick={() => setView('list')} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#059669', fontWeight: '600', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Return to Directory
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Sidebar */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', color: '#0f172a' }}>{historyData?.patient_info.name}</h3>
              <div style={{ background: '#fff1f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '16px' }}>
                <p style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>KNOWN ALLERGIES</p>
                <p style={{ fontSize: '14px', color: '#7f1d1d', margin: '4px 0 0' }}>{historyData?.allergies?.join(', ') || "None"}</p>
              </div>
            </div>
            
            {/* Timeline */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} color="#059669"/> Visit Timeline</h3>
              {historyData?.visit_history.map((v, i) => (
                <div key={i} style={{ paddingLeft: '24px', borderLeft: '2px solid #e2e8f0', marginBottom: '32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#059669', border: '2px solid white' }}></div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{v.visit_date}</span>
                  <h4 style={{ margin: '4px 0 12px', color: '#0f172a' }}>{v.diagnosis}</h4>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {v.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;