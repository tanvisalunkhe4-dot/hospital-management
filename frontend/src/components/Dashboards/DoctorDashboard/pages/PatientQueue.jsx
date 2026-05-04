import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, Users, Loader2, AlertCircle } from 'lucide-react';

const PatientQueue = ({ onStartConsultation }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getActiveStaffId = () => {
    const rawData = localStorage.getItem('user_data');
    if (!rawData) return null;
    try {
      const userData = JSON.parse(rawData);
      return userData.staff_id;
    } catch {
      return null;
    }
  };

  const fetchQueue = useCallback(async () => {
    const staffId = getActiveStaffId();
    if (!staffId) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/doctor/queue/${staffId}`);
      if (!response.ok) throw new Error("Failed to load queue.");
      const data = await response.json();
      setQueue(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Network error fetching queue:", err);
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 20000); // Polling every 20 seconds
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleStartVisit = async (patient) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/doctor/consultation/start/${patient.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        alert("Could not update patient status.");
        return;
      }

      onStartConsultation(patient);
      fetchQueue(); 
    } catch (err) {
      console.error("Error starting visit:", err);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <Loader2 className="animate-spin" size={32} color="#10b981" />
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Waiting Room</h2>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Live Updates active</span>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {queue.map((patient) => (
          <div key={patient.id} style={styles.patientCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  {patient.patient_name} <span style={{ fontSize: 12, color: '#94a3b8' }}>PID: #{patient.patient_id}</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Reason: {patient.reason}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '12px' }}>
                    <Clock size={12} /> Appt: {patient.time}
                  </div>
                </div>
                <button 
                  style={styles.startButton} 
                  onClick={() => handleStartVisit(patient)}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Play size={14} fill="white" /> Start Visit
                </button>
              </div>
            </div>
          </div>
        ))}

        {queue.length === 0 && (
          <div style={styles.emptyState}>
            <Users size={48} color="#cbd5e1" />
            <h4 style={{ color: '#64748b', marginTop: '12px' }}>Queue is currently empty</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Checked-in patients will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  patientCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  startButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '2px dashed #e2e8f0'
  }
};

export default PatientQueue;