import React, { useState, useEffect } from 'react';
import { Bell, User, ArrowLeft, FileText, Activity, Settings } from 'lucide-react';
import axios from 'axios'; // Ensure axios is installed

// Sub-components 
import DoctorSidebar from "./DoctorSidebar";import DoctorOverview from './DoctorOverview';
import PatientQueue from './PatientQueue';
import ConsultationWorkspace from './ConsultationWorkspace';

// Reusable Table component with "Beautified" Status Badges
const DataView = ({ title, icon, data, columns }) => {
  // Logic to color-code different diagnoses for a better UI
  const getBadgeStyle = (val) => {
    if (val === 'Hypertension' || val === 'Critical') return { bg: '#fee2e2', text: '#dc2626' };
    if (val === 'Pending' || val === 'In Progress') return { bg: '#fef3c7', text: '#d97706' };
    return { bg: '#ecfdf5', text: '#059669' }; // Default Green
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        {icon}
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>{title}</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
            {columns.map(col => <th key={col} style={{ padding: '12px' }}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
              {Object.entries(row).map(([key, val], i) => (
                <td key={i} style={{ padding: '12px', color: '#1e293b' }}>
                  {key === 'diagnosis' || key === 'status' ? (
                    <span style={{ 
                      backgroundColor: getBadgeStyle(val).bg, 
                      color: getBadgeStyle(val).text, 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      {val}
                    </span>
                  ) : val}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]); // State for DB records
  const [loading, setLoading] = useState(false);
  const doctorName = "Dr. Patil";

  // Fetch real records from Backend
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/doctor/medical-records/all');
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
    setLoading(false);
  };

  // Trigger fetch when user clicks 'records' tab
  useEffect(() => {
    if (activeTab === 'records') {
      fetchRecords();
    }
  }, [activeTab]);

  const handleStartConsultation = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('consultation');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} doctorName={doctorName} />

      <main style={{ flex: 1, padding: '32px', marginLeft: '280px' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              {activeTab === 'overview' ? 'Dashboard' : activeTab.replace('-', ' ')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Welcome back, {doctorName}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <Bell color="#64748b" size={20} cursor="pointer" />
             <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                <Settings size={18} color="#64748b" />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{doctorName}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Doc ID: 22306142</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <User size={20} />
                </div>
             </div>
          </div>
        </header>

        {/* NAVIGATION BAR */}
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            {activeTab !== 'overview' && (
                <div onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </div>
            )}
        </div>
        
        {/* CONTENT */}
        <div style={{ marginTop: '5px' }}>
            {activeTab === 'overview' && <DoctorOverview />}
            {activeTab === 'queue' && <PatientQueue onStartConsultation={handleStartConsultation} />}
            {activeTab === 'consultation' && <ConsultationWorkspace patient={selectedPatient} onComplete={() => setActiveTab('queue')} />}

            {activeTab === 'records' && (
    <DataView 
        title="Recent Medical Records" 
        icon={<FileText color="#10b981" />} 
        data={records} // This comes from your fetchRecords() axios call
        columns={["Record ID", "Patient Name", "Visit Date", "Diagnosis"]}
    />
)}

            {activeTab === 'reports' && (
                <DataView 
                    title="Diagnostic Lab Results" 
                    icon={<Activity color="#3b82f6" />} 
                    data={[]} // Future connection
                    columns={["Report ID", "Patient", "Test Type", "Status", "Date"]}
                />
            )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;