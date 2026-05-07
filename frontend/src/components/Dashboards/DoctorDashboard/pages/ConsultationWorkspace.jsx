import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Thermometer, Heart, Activity, Plus, Trash2, Droplets } from 'lucide-react';
import axios from 'axios'; 


const ConsultationWorkspace = ({ patient, onComplete }) => {
  const pId = patient?.patient_id || patient?.id;
  const apptId = patient?.appt_id || patient?.id;
  const [isListening, setIsListening] = useState(false);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '1-0-1' });
  const [vitals, setVitals] = useState({ bp: '--', pulse: '--', temp: '--', sp02: '--' });
  const recorderRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
// Add these with your other refs/states
const socketRef = useRef(null);
const [liveTranscript, setLiveTranscript] = useState("");
  if (!patient) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h3>Select a patient to begin consultation.</h3>
      </div>
    );
  }

  const textareaRef = useRef(null);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  }
}, [notes]); 


useEffect(() => {
  return () => {
    // Cleanup: Stop mic and socket if doctor leaves the page
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
  };
}, []);
  const toggleScribe = async () => {
    if (isListening) {
      if (recorderRef.current) recorderRef.current.stop();
      // Only close if it's actually open
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close();
      }
      socketRef.current = null; // Clear the ref
      setIsListening(false);
  } else {
        // START RECORDING & STREAMING
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 1. Initialize WebSocket
            socketRef.current = new WebSocket("ws://127.0.0.1:8000/api/v1/doctor/ws/scribe/stream");

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "partial_transcript") {
                    // Update notes in real-time as words come back from backend
                    setNotes((prev) => prev + " " + data.text);
                }
            };

            // 2. Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            recorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = async (e) => {
                if (e.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
                    // SEND CHUNK TO BACKEND IMMEDIATELY
                    socketRef.current.send(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop());
              setIsListening(false); // Ensure the button UI resets
              finalizeNotesWithGemini(); // Trigger the summary
          };
            // Capture data every 250ms for real-time feel
            mediaRecorder.start(250); 
            setIsListening(true);
        } catch (err) {
            console.error(err);
            alert("Microphone access denied or WebSocket failed.");
        }
    }
};
const finalizeNotesWithGemini = async () => {
  if (!notes.trim()) return;
  
  setIsProcessing(true);
  try {
      const response = await axios.post(
          'http://127.0.0.1:8000/api/v1/doctor/consultation/scribe-process-text', 
          { headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } }
      );
      setNotes(response.data.clinical_note);
  } catch (error) {
      console.error("Gemini Finalization Error:", error);
  } finally {
      setIsProcessing(false);
  }
};
  

  useEffect(() => {
    const loadClinicalData = async () => {
      try {
        // Change patient.id to patient.patient_id to match your doctor.py return
        const pId = patient.patient_id || patient.id; 
        const response = await axios.get(`http://localhost:8000/api/v1/doctor/patient/${pId}/latest-vitals`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        setVitals({
          bp: response.data.blood_pressure || "N/A",
          pulse: response.data.pulse_rate || "--",
          temp: response.data.temperature || "--",
          spO2: response.data.sp_o2 || "--" 
        });
      } catch (error) {
        console.error("Critical: Could not sync patient vitals", error);
      }
    };
  
    if (patient?.patient_id || patient?.id) {
      loadClinicalData();
    }
  }, [patient]);

   // --- PRESCRIPTION LOGIC ---
  const addMedicine = () => {
    if (newMed.name) {
      setPrescription([...prescription, { ...newMed, id: Date.now() }]);
      setNewMed({ name: '', dosage: '', frequency: '1-0-1' });
    }
  };

  const removeMed = (id) => {
    setPrescription(prescription.filter(m => m.id !== id));
  };

  const handleFinalize = async () => {
    const hospId = sessionStorage.getItem('hospital_id');
    
    // Critical: Prevent 422 by ensuring ID exists before the call
    if (!hospId) {
        alert("Session Expired: Hospital ID not found. Please log in again.");
        return;
    }
    try {
      const token = sessionStorage.getItem('token');
      // 1. Get the hospital_id we saved during login
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      };
      
      const apptId = patient.appt_id || patient.id;
  
      // 2. Add ?hosp_id= to the end of the URL
      await axios.patch(
        `http://localhost:8000/api/v1/receptionist/appointments/${apptId}/finish?hosp_id=${hospId}`, 
        {}, 
        { headers }
      );
  
      // Success flow
      setNotes("");
      setPrescription([]);
      setIsListening(false);
      setVitals({ bp: '--', pulse: '--', temp: '--', spO2: '--' });
  
      alert("Consultation finalized. Patient moved to Billing.");
      onComplete(); 
  
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error("Validation Error Details:", error.response.data.detail);
        alert(`Backend Validation Error: Check if Hospital ID is missing in SessionStorage.`);
      } else {
        console.error("General Sync Error:", error);
        alert("System Sync Error: Check your connection or terminal logs.");
      }
    }
  };
  
  const styles = {
    container: { display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '20px', height: 'calc(100vh - 180px)' },
    card: { background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    vitalCard: { padding: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' },
    scribePanel: { 
        flex: 1, backgroundColor: '#fff', borderRadius: '16px', color: '#1e293b', padding: '20px', 
        fontFamily: 'monospace', position: 'relative', overflowY: 'auto', border: '1px solid #e2e8f0' 
    },
    medItem: {
        padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0'
    },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
    actionBtn: (isActive) => ({
        padding: '12px 24px', borderRadius: '12px', border: 'none', 
        backgroundColor: isActive ? '#ef4444' : '#10b981', color: 'white',
        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
    })
  };

  return (
    <div style={styles.container}>
      {/* COLUMN 1: PATIENT PROFILE & VITALS */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#64748b' }}>
            {patient?.first_name ? patient.first_name[0] : 'P'}
          </div>
          <h3 style={{ margin: 0, color: '#1e293b' }}>{patient?.first_name} {patient?.last_name}</h3>
          <span style={{ color: '#64748b', fontSize: '13px' }}>
  PID: #NX-{patient?.patient_id || patient?.id || '00'} | {patient?.age || 'N/A'}Y, {patient?.gender || 'Unknown'}
</span>        </div>

        <h4 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>Current Vitals</h4>
        <div style={styles.vitalCard}>
          <Activity size={20} color="#10b981" />
          <div><p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Blood Pressure</p><b style={{color: '#1e293b'}}>{vitals.bp} mmHg</b></div>
        </div>
        <div style={styles.vitalCard}>
          <Heart size={20} color="#ef4444" />
          <div><p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Heart Rate</p><b style={{color: '#1e293b'}}>{vitals.pulse} BPM</b></div>
        </div>
        <div style={styles.vitalCard}>
          <Thermometer size={20} color="#3b82f6" />
          <div><p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Temperature</p><b style={{color: '#1e293b'}}>{vitals.temp} °F</b></div>
        </div>
        <div style={styles.vitalCard}>
  <Droplets size={20} color="#3b82f6" />
  <div>
    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Oxygen (SpO2)</p>
    <b style={{color: '#1e293b'}}>{vitals.spO2} %</b>
  </div>
      </div>
      </div>
      

      {/* COLUMN 2: AI SCRIBE PANEL */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Clinical Notes (AI Scribe)</h3>
          <button 
  style={styles.actionBtn(isListening)} 
  onClick={toggleScribe}
  disabled={isProcessing}
>
  {isProcessing ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
       Processing...
    </span>
  ) : (
    <>
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      {isListening ? "Stop AI Scribe" : "Start AI Scribe"}
    </>
  )}
</button>
        </div>

        <div style={styles.scribePanel}>
  {isListening && (
    <div style={{ marginBottom: '10px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
      ● RECORDING CONVERSATION...
    </div>
  )}
  {isProcessing && (
    <div style={{ color: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}>
      AI IS GENERATING CLINICAL NOTES...
    </div>
  )}
  <textarea
  ref={textareaRef} 
    placeholder={isProcessing ? "Analyzing audio..." : "AI Scribe will automatically fill these notes..."}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    disabled={isProcessing}
    style={{ 
        width: '100%', height: '90%', background: 'transparent', 
        border: 'none', color: '#1e293b', outline: 'none', 
        fontSize: '15px', resize: 'none', lineHeight: '1.6',
        opacity: isProcessing ? 0.5 : 1
    }}
  />
</div>
      </div>

      {/* COLUMN 3: PRESCRIPTION PAD */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Digital Prescription</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <input 
            style={styles.input} 
            placeholder="Medication Name" 
            value={newMed.name} 
            onChange={(e) => setNewMed({...newMed, name: e.target.value})} 
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              style={{ ...styles.input, flex: 1 }} 
              placeholder="Dosage (e.g. 500mg)" 
              value={newMed.dosage} 
              onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} 
            />
            <button onClick={addMedicine} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}>
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
            {prescription.length === 0 ? (
              <div style={{ padding: '20px', border: '2px dashed #f1f5f9', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No medications listed.
              </div>
            ) : (
              prescription.map((med) => (
                <div key={med.id} style={styles.medItem}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{med.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{med.dosage} • {med.frequency}</p>
                  </div>
                  <button onClick={() => removeMed(med.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
        </div>

        

{/* Add this at the bottom of COLUMN 3 (Prescription Pad) */}
<button 
  style={{ 
    ...styles.actionBtn(false), 
    width: '100%', 
    marginTop: '20px', 
    justifyContent: 'center',
    backgroundColor: '#2563eb', // Professional blue for completion
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  }} 
  onClick={handleFinalize}
>
  <Save size={18} /> Complete & Call Next Patient
</button>
      </div>

      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}</style>
    </div>
  );
};

export default ConsultationWorkspace;