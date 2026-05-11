import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Thermometer, Heart, Activity, Plus, Trash2, Droplets } from 'lucide-react';
import axios from 'axios'; 


const ConsultationWorkspace = ({ patient, onComplete }) => {
  const pId = patient?.patient_id || patient?.id;
  const apptId = patient?.appt_id || patient?.id;
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
// Change these at the top of your component
const [rawTranscript, setRawTranscript] = useState(""); 
const [clinicalSummary, setClinicalSummary] = useState("");
  const [prescription, setPrescription] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '1-0-1' });
  const [vitals, setVitals] = useState({ bp: '--', pulse: '--', temp: '--', sp02: '--' });
  const recorderRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchTimeoutRef = useRef(null); // ADD THIS LINE
// Add these with your other refs/states
const socketRef = useRef(null);
  if (!patient) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h3>Select a patient to begin consultation.</h3>
      </div>
    );
  }

  const textareaRef = useRef(null);

// Update this near the top of your component
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  }
}, [rawTranscript]); // Changed from 'notes' to 'rawTranscript'


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

const searchMedicines = async (query) => {
  setNewMed({ ...newMed, name: query });
  
  if (query.length < 2) {
    setSuggestions([]);
    return;
  }

  setIsLoadingSearch(true);
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`http://localhost:8000/api/v1/doctor/search-medicines?q=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setSuggestions(response.data);
    setShowSuggestions(true);
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    setIsLoadingSearch(false);
  }
};

const [liveTranscript, setLiveTranscript] = useState("");

const toggleScribe = async () => {
  if (isListening) {
    if (recorderRef.current) recorderRef.current.stop();
    if (socketRef.current) socketRef.current.close();
    setIsListening(false);
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      socketRef.current = new WebSocket("ws://127.0.0.1:8000/api/v1/doctor/ws/scribe/stream");
      
      // Don't clear notes yet, just prepare liveTranscript
      setLiveTranscript("Listening...");

      // Inside toggleScribe
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "partial_transcript") {
          const incoming = data.text.trim();
          setLiveTranscript(incoming);
          
          setRawTranscript((prev) => {
            if (!prev.trim()) return incoming;
            if (prev.endsWith(incoming)) return prev;
            return prev.trim() + " " + incoming;
          }); 
        }
      };
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => { // Make this async
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
        
        // ADD THIS: Small delay to ensure the last WebSocket message 
        // is fully committed to the rawTranscript state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        finalizeNotesWithGemini(); 
      };

      mediaRecorder.start(1000); // 1 second chunks for stability
      setIsListening(true);
    } catch (err) {
      alert("Mic error.");
    }
  }
};


const finalizeNotesWithGemini = async () => {
  console.log("Sending to AI Scribe:", rawTranscript);
  if (!rawTranscript.trim()) return;

  setIsProcessing(true);
  setLiveTranscript(""); 
  
  try {
      const response = await axios.post(
          'http://127.0.0.1:8000/api/v1/doctor/consultation/scribe-process-text', 
          { raw_text: rawTranscript }, 
          { headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } }
      );
      
      console.log("AI Response Received:", response.data);

      // 1. Check if the response actually contains the note
      if (response.data.clinical_note) {
          
          // 2. If it's a Rate Limit error, alert the user
          if (response.data.clinical_note.includes("Rate Limit")) {
              alert("The AI is currently busy. Please wait 30 seconds and try again.");
          } else {
              // 3. SUCCESS: Update the UI with the actual summary
              setClinicalSummary(response.data.clinical_note);
          }
      }
  } catch (error) {
      console.error("Scribe Error:", error);
  } finally {
      setIsProcessing(false);
  }
};

useEffect(() => {
  const handleClickOutside = (event) => {
    // If the click is not on the search input, hide suggestions
    if (showSuggestions) setShowSuggestions(false);
  };
  window.addEventListener('click', handleClickOutside);
  return () => window.removeEventListener('click', handleClickOutside);
}, [showSuggestions]);
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
    if (!hospId) {
        alert("Session Expired: Please log in again.");
        return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const apptId = patient.appt_id || patient.id;
  
      // Now sending the data payload to the backend
      await axios.post(
        `http://localhost:8000/api/v1/doctor/consultation/finish/${apptId}`, 
        {
          hospital_id: hospId,
          summary: clinicalSummary,   // The SOAP note from Gemini
          prescriptions: prescription // The list of medicines from your state
        }, 
        { headers }
      );
  
      // Important: Clear all Scribe states before moving to the next patient
      setRawTranscript("");
      setClinicalSummary("");
      setPrescription([]);
      
      onComplete(); 
    } catch (error) {
      console.error("Finalize Error:", error);
      alert("Could not finish consultation. Check if the server is running.");
    }
};
  const styles = {
    container: { display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '20px', height: 'calc(100vh - 180px)' },
    card: { background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    vitalCard: { padding: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' },
    scribePanel: { 
      flex: 1, 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      color: '#1e293b', 
      padding: '24px', 
      fontFamily: '"Inter", sans-serif', // Cleaner font
      position: 'relative', 
      overflowY: 'auto', 
      border: '1px solid #e2e8f0',
      lineHeight: '1.6'
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
    <h3 style={{ margin: 0, color: '#1e293b' }}>AI Scribe Workspace</h3>
    <button style={styles.actionBtn(isListening)} onClick={toggleScribe} disabled={isProcessing}>
      {isProcessing ? "Processing..." : (isListening ? "Stop AI Scribe" : "Start AI Scribe")}
    </button>
  </div>

  <div style={{ display: 'flex', gap: '20px', height: '100%', overflow: 'hidden' }}>
    
    {/* PART 1: FULL COMMUNICATION */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', paddingRight: '15px' }}>
      <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800' }}>Full Conversation</h4>
      <div style={{ 
        flex: 1, overflowY: 'auto', fontSize: '14px', color: '#475569', 
        backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px',
        lineHeight: '1.6', border: '1px solid #f1f5f9'
      }}>
        {rawTranscript || <span style={{color: '#94a3b8'}}>Waiting for audio...</span>}
        {isListening && (
          <p style={{ color: '#ef4444', fontWeight: '600', marginTop: '10px' }}>
            ● LIVE: {liveTranscript}
          </p>
        )}
      </div>
    </div>

    {/* PART 2: CLINICAL SUMMARY */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800' }}>Clinical Summary (SOAP)</h4>
      <textarea
        placeholder="Summary will appear here after stopping the scribe..."
        value={clinicalSummary}
        onChange={(e) => setClinicalSummary(e.target.value)}
        disabled={isProcessing}
        style={{ 
          flex: 1, width: '100%', background: 'transparent', border: 'none', 
          color: '#1e293b', outline: 'none', fontSize: '15px', 
          resize: 'none', lineHeight: '1.6', fontFamily: 'inherit'
        }}
      />
    </div>
  </div>
</div>

      {/* COLUMN 3: PRESCRIPTION PAD */}
<div style={styles.card}>
  <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Digital Prescription</h3>
  
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', position: 'relative' }}>
    
    {/* SEARCHABLE MEDICINE INPUT */}
    <div style={{ position: 'relative' }}>
      <input 
        style={{ ...styles.input, width: '100%' }} 
        placeholder="Search Medicine (e.g. Calpol)" 
        value={newMed.name} 
        onChange={(e) => {
          const val = e.target.value;
          setNewMed({...newMed, name: val});
          
          // DEBOUNCE LOGIC: Wait 300ms after typing stops before searching
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
          
          if (val.length > 1) {
            searchTimeoutRef.current = setTimeout(async () => {
              setIsLoadingSearch(true);
              try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get(`http://localhost:8000/api/v1/doctor/search-medicines?q=${val}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                setSuggestions(res.data);
                setShowSuggestions(true);
              } catch (err) {
                console.error("Search failed", err);
              } finally {
                setIsLoadingSearch(false);
              }
            }, 300);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }} 
      />

      {/* SUGGESTION DROPDOWN */}
      {showSuggestions && suggestions.length > 0 && (
  <div style={{
    position: 'absolute', 
    top: '100%', 
    left: 0, 
    right: 0,
    backgroundColor: 'white', 
    border: '1px solid #e2e8f0',
    borderRadius: '8px', 
    zIndex: 9999, // INCREASE THIS to 9999
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    maxHeight: '250px', 
    overflowY: 'auto'
  }}>
          {suggestions.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setNewMed({
                  name: item.name,
                  dosage: item.strength || '', 
                  frequency: '1-0-1',
                  manufacturer: item.manufacturer // Helpful for the final record
                });
                setShowSuggestions(false);
              }}
              style={{
                padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                fontSize: '13px', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {item.salt_composition} • <span style={{ color: '#10b981' }}>{item.manufacturer}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
  <select 
    style={{ ...styles.input, flex: 1 }}
    value={newMed.frequency}
    onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
  >
    <option value="1-0-1">1-0-1 (Twice Daily)</option>
    <option value="1-1-1">1-1-1 (Thrice Daily)</option>
    <option value="1-0-0">1-0-0 (Morning Only)</option>
    <option value="0-0-1">0-0-1 (Night Only)</option>
    <option value="SOS">SOS (As Needed)</option>
  </select>
  
  <button 
    onClick={addMedicine} 
    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}
  >
    <Plus size={20} />
  </button>
</div>
  </div>

  {/* REST OF YOUR PRESCRIPTION LIST CODE ... */}

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
                    <p style={{ margin: 0, fontSize: '11px', color: '#10b981', fontStyle: 'italic' }}>{med.salt_composition}</p>
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
  style={{ ...styles.actionBtn(false), width: '100%', marginTop: '20px', justifyContent: 'center', backgroundColor: isProcessing ? '#94a3b8' : '#2563eb' }} 
  onClick={handleFinalize}
  disabled={isProcessing}
>
  {isProcessing ? "Saving Record..." : <><Save size={18} /> Complete & Call Next Patient</>}
</button>
      </div>

      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}</style>
    </div>
  );
};

export default ConsultationWorkspace;