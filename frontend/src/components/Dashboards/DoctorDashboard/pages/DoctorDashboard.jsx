import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, Activity } from "lucide-react";

// Layout Components
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorHeader from "../components/DoctorHeader";

// Page Components
import DoctorOverview from "./DoctorOverview";
import PatientQueue from "./PatientQueue";
import ConsultationWorkspace from "./ConsultationWorkspace";
import LabReports from "./LabReports";
// A small reusable table component for Records/Reports
const DataView = ({ title, icon, data, columns }) => (
  <div style={viewContainerStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      {icon}
      <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '800' }}>{title}</h3>
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
          {columns.map(col => <th key={col} style={thStyle}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
            <td style={tdStyle}><strong>{row.id}</strong></td>
            <td style={tdStyle}>{row.patient_name}</td>
            <td style={tdStyle}>{row.visit_date}</td>
            <td style={tdStyle}>
              <span style={diagnosisBadge}>{row.diagnosis}</span>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No medical records found in the system.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const DoctorDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescription, setPrescription] = useState([]);
const [clinicalSummary, setClinicalSummary] = useState("");
const [rawTranscript, setRawTranscript] = useState("");
const [prescribedTests, setPrescribedTests] = useState([]);
  // --- DYNAMIC USER DATA ---
  const userData = JSON.parse(sessionStorage.getItem('user_data'));
  const activeStaffId = userData?.staff_id;
  const doctorName = userData?.full_name || "Doctor";

  useEffect(() => {
    if (activeTab === 'records') {
      fetch('http://localhost:8000/api/v1/doctor/medical-records/all')
        .then(res => res.json())
        .then(data => setRecords(data))
        .catch(err => console.error("Failed to fetch records:", err));
    }
  }, [activeTab]);

  useEffect(() => {
  const checkActiveSession = async () => {
    if (!activeStaffId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/doctor/active-session/${activeStaffId}`);
      if (response.ok) {
        const activePatient = await response.json();
        
        if (activePatient) {
          // Found an active patient! Re-set the state to resume the UI[cite: 5]
          setSelectedPatient(activePatient);
          setActiveTab('consultation');
          console.log("Resuming active consultation for:", activePatient.patient_name);
        }
      }
    } catch (err) {
      console.error("Session check failed:", err);
    }
  };

  checkActiveSession();
}, [activeStaffId]); // Trigger when the doctor ID is available[cite: 5]

const handleStartConsultation = (patient) => {
  // Normalize the object so every component knows exactly what keys to use
  const normalizedPatient = {
    ...patient,
  
    // Patient ID
    patient_id: patient.patient_id || patient.id,
  
    // Appointment ID
    appt_id: patient.appt_id || patient.appointment_id,
  
    first_name:
      patient.first_name ||
      patient.patient_name?.split(' ')[0] ||
      "Patient",
  
    last_name:
      patient.last_name ||
      patient.patient_name?.split(' ')[1] ||
      ""
  };
  setSelectedPatient(normalizedPatient);
  setActiveTab('consultation');
};

  const handleRequestTestNavigation = () => {
    setActiveTab('reports');
  };

  const handleCompleteConsultation = () => {
    setSelectedPatient(null);
    setPrescribedTests([]); 
    setPrescription([]);      // NEW: Clear medications
    setClinicalSummary("");   // NEW: Clear summary
    setRawTranscript("");     // NEW: Clear transcript
    setActiveTab('queue');
    console.log("Consultation completed successfully.");
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* SIDEBAR: Passes active state and name[cite: 2] */}
      <DoctorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        doctorName={doctorName} 
        onLogout={onLogout} 
      />

      <main style={{ flex: 1, marginLeft: '280px' }}>
        {/* HEADER: Displays dynamic doctor name[cite: 3] */}
        <DoctorHeader doctorName={doctorName} />

        <div style={{ padding: '32px' }}>
          {/* NAVIGATION BREADCRUMB */}
          <div style={{ marginBottom: '20px' }}>
            {activeTab !== 'overview' && (
              <div 
                onClick={() => setActiveTab('overview')} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </div>
            )}
          </div>

          {/* DYNAMIC CONTENT AREA[cite: 5] */}
          <div style={{ marginTop: '5px' }}>
            {activeTab === 'overview' && <DoctorOverview />}
            
            {activeTab === 'queue' && (
              <PatientQueue 
                onStartConsultation={handleStartConsultation} 
                doctorId={activeStaffId} 
                isBusy={!!selectedPatient} // Prevents double-starting visits[cite: 7]
              />
            )}
            {activeTab === 'consultation' && (
  <ConsultationWorkspace 
    patient={selectedPatient} 
    onComplete={handleCompleteConsultation} 
    onRequestTest={handleRequestTestNavigation}
    prescribedTests={prescribedTests}
    
    // NEW PROPS: Pass the lifted state
    prescription={prescription}
    setPrescription={setPrescription}
    clinicalSummary={clinicalSummary}
    setClinicalSummary={setClinicalSummary}
    rawTranscript={rawTranscript}
    setRawTranscript={setRawTranscript}
  />
)}
           
       
            {activeTab === 'records' && (
              <DataView 
                title="Electronic Medical Records" 
                icon={<FileText color="#10b981" />} 
                data={records} 
                columns={["Record ID", "Patient Name", "Visit Date", "Diagnosis"]}
              />
            )}
           {activeTab === 'reports' && (
  selectedPatient ? (
    <LabReports 
      patient={selectedPatient} 
      onBack={(newTests) => {
        // This ensures we keep old tests and add the new ones, removing any duplicates
        setPrescribedTests(prev => {
          const combined = [...prev, ...newTests];
          return [...new Set(combined)]; // ES6 trick to keep only unique values
        });
        setActiveTab('consultation'); 
      }} 
    />
  ) : (
      <div style={viewContainerStyle}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <Activity size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <h3>No Active Patient</h3>
          <p>Please select a patient from the queue to view their specific lab reports.</p>
          <button 
            onClick={() => setActiveTab('queue')}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Go to Patient Queue
          </button>
        </div>
      </div>
    )
  )}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- STYLES ---
const viewContainerStyle = { background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const thStyle = { padding: '12px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '16px 12px', fontSize: '14px', color: '#1e293b' };
const diagnosisBadge = { backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' };
const placeholderStyle = { padding: '80px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };

export default DoctorDashboard;