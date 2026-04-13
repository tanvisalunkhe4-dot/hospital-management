import React, { useState, useEffect } from 'react';
import { Play, Clock, AlertCircle, Users } from 'lucide-react';

const PatientQueue = ({ onStartConsultation }) => {
  // 1. Initial state with dummy data for testing
  const [queue, setQueue] = useState([
    { id: 1, first_name: "Janavi", last_name: "Patil", visit_type: "Emergency" },
    { id: 2, first_name: "Tanvi", last_name: "salunKhe.", visit_type: "Routine" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/doctor/queue/1');
        if (response.ok) {
          const data = await response.json();
          setQueue(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Network error, using dummy data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

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
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    routineBadge: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '700'
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
      transition: 'transform 0.2s'
    }
  };

  // THE RETURN MUST BE INSIDE THE COMPONENT BRACKETS
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Today's Waiting Room</h3>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Active Queue</p>
          <p style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', margin: 0 }}>{queue.length} Patients</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {queue.map((patient, index) => (
          <div key={patient.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '20px', 
            borderRadius: '16px', 
            border: '1px solid #f1f5f9',
            backgroundColor: patient.visit_type === 'Emergency' ? '#fffafa' : 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                backgroundColor: '#f8fafc', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '800', color: '#64748b'
              }}>
                {index + 1}
              </div>
              
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{patient.first_name} {patient.last_name}</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>PID: #NX-{patient.id}</span>
                  {patient.visit_type === 'Emergency' ? (
                    <span style={styles.emergencyBadge}><AlertCircle size={14}/> Emergency</span>
                  ) : (
                    <span style={styles.routineBadge}>Routine</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                  <Clock size={14} /> Waiting
                </div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>12 Mins</div>
              </div>

              <button 
                style={styles.startButton} 
                onClick={() => onStartConsultation(patient)}
              >
                <Play size={16} fill="white" /> Start Visit
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>The queue is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}; // This bracket MUST be at the very end

export default PatientQueue;