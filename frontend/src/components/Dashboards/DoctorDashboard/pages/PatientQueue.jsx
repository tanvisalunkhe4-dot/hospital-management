import React, { useState, useEffect, useCallback } from 'react';
import { Play, Clock, Users, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const PatientQueue = ({ onStartConsultation, isBusy }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to get ID from local storage
  const getActiveStaffId = () => {
    const rawData = localStorage.getItem('user_data');
    if (!rawData) return null;
    try {
      const userData = JSON.parse(rawData);
      return userData.staff_id;
    } catch { return null; }
  };

  const fetchQueue = useCallback(async (showLoader = true) => {
    const staffId = getActiveStaffId();
    const token = localStorage.getItem('token'); // Retrieve token
    
    if (!staffId || !token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }
  
    if (showLoader) setIsRefreshing(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/doctor/queue/${staffId}`, {
        headers: { 'Authorization': `Bearer ${token}` } // Attach Auth Header
      });
      if (!response.ok) throw new Error("Failed to load queue.");
      const data = await response.json();
      setQueue(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Connection error.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();

    // Strategy: Auto-refresh the queue whenever the doctor switches back to this tab[cite: 5]
    const handleFocus = () => fetchQueue(false);
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchQueue]);

  const handleStartVisit = async (patient) => {
    if (isBusy) {
      alert("You have an active session. Please finish the current patient first.");
      return;
    }
  
    // ✅ SAFETY CHECK: Try all possible ID names (id, appt_id, or appointment_id)
    const appointmentId = patient.id || patient.appt_id || patient.appointment_id;
  
    // If it's still undefined, log the object so you can see the correct key in the console
    if (!appointmentId) {
      console.error("ID Mismatch! The patient object looks like this:", patient);
      alert("Error: Could not find Appointment ID. Check console for details.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      
      // Now this URL will correctly be /start/11 or /start/57 instead of /start/undefined
      const response = await fetch(`http://localhost:8000/api/v1/doctor/consultation/start/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        onStartConsultation(patient); 
        fetchQueue(false); 
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Could not start visit.");
      }
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
        <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Waiting Room</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Patients currently checked-in</p>
        </div>
        
        <button 
            onClick={() => fetchQueue()} 
            style={styles.refreshBtn}
            disabled={isRefreshing}
        >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Updating..." : "Refresh Queue"}
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {queue.map((patient) => (
          <div 
            key={patient.id} 
            style={{
              ...styles.patientCard,
              opacity: isBusy ? 0.7 : 1, // Visually dim other cards when busy[cite: 7]
              filter: isBusy ? 'grayscale(0.2)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: isBusy ? '#94a3b8' : '#1e293b' }}>
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
                  style={{
                    ...styles.startButton,
                    // Keep "Start Visit" text but change color to grey when blocked[cite: 7]
                    backgroundColor: isBusy ? '#e2e8f0' : '#10b981',
                    color: isBusy ? '#94a3b8' : 'white',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    border: isBusy ? '1px solid #cbd5e1' : 'none'
                  }} 
                  onClick={() => handleStartVisit(patient)}
                  disabled={isBusy}
                >
                  <Play size={14} fill={isBusy ? "#94a3b8" : "white"} /> 
                  Start Visit
                </button>
              </div>
            </div>
          </div>
        ))}

{queue.length === 0 && (
  <div style={styles.emptyState}>
    <Users size={48} color="#cbd5e1" />
    <h4 style={{ color: '#64748b', marginTop: '12px' }}>Waiting Room is Clear</h4>
    <p style={{ fontSize: '13px', color: '#94a3b8' }}>
      Patients will appear here once the Nurse has completed their vitals.
    </p>
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    transition: 'all 0.3s ease'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
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
    transition: 'background-color 0.2s'
  },
  errorBanner: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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