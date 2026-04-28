import React, { useState, useEffect } from 'react';
import { Play, Clock, AlertCircle, Users, Loader2 } from 'lucide-react';

const PatientQueue = ({ onStartConsultation }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH LIVE QUEUE FROM FASTAPI
  const fetchQueue = async () => {
    try {
      // Assuming Doctor ID is 1 for this session
      const response = await fetch('http://localhost:8000/api/v1/doctor/queue/1');
      if (response.ok) {
        const data = await response.json();
        setQueue(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Network error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Optional: Refresh queue every 30 seconds for real-time feel
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. HANDLE "START VISIT" LOGIC (Backend Update)
  const handleStartVisit = async (patient) => {
    try {
      // Call your FastAPI endpoint to change status to "In Consultation"
      const response = await fetch(`http://localhost:8000/api/v1/doctor/consultation/start/${patient.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Trigger the parent function to switch to Consultation Workspace
        onStartConsultation(patient);
      } else {
        alert("Failed to start consultation. Please try again.");
      }
    } catch (err) {
      console.error("Error starting visit:", err);
      alert("Server connection error.");
    }
  };

  const styles = {
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    },
    emergencyBadge: {
      backgroundColor: '#fee2e2',
      color: '#ef4444',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      textTransform: 'uppercase'
    },
    routineBadge: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    startButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Waiting Room</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Live queue for Dr. Patil</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Patients Waiting</p>
          <p style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', margin: 0 }}>{queue.length}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#10b981" style={{ margin: '0 auto' }} />
            <p style={{ color: '#64748b', marginTop: '12px' }}>Loading queue...</p>
          </div>
        ) : (
          queue.map((patient, index) => (
            <div key={patient.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px 20px', 
              borderRadius: '16px', 
              border: '1px solid #f1f5f9',
              backgroundColor: patient.visit_type?.toLowerCase() === 'emergency' ? '#fffafa' : 'white',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  backgroundColor: '#f8fafc', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '800', color: '#94a3b8'
                }}>
                  {index + 1}
                </div>
                
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                    {patient.first_name} {patient.last_name}
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>PID: #NX-{patient.id}</span>
                    {patient.visit_type?.toLowerCase() === 'emergency' ? (
                      <span style={styles.emergencyBadge}><AlertCircle size={12}/> Emergency</span>
                    ) : (
                      <span style={styles.routineBadge}>Routine</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '12px', justifyContent: 'flex-end' }}>
                    <Clock size={12} /> Waiting
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#475569' }}>
                    {patient.waiting_time || '10'}m
                  </div>
                </div>

                <button 
                  style={styles.startButton} 
                  onClick={() => handleStartVisit(patient)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={14} fill="white" /> Start Visit
                </button>
              </div>
            </div>
          ))
        )}

        {queue.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <Users size={48} style={{ marginBottom: '16px', color: '#cbd5e1' }} />
            <h4 style={{ margin: 0, color: '#64748b' }}>Queue is empty</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>New checked-in patients will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;