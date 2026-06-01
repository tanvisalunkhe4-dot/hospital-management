import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileText, Pill, FlaskConical, User, ChevronRight, Loader2 } from 'lucide-react';
const RecordsAccess = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const token = sessionStorage.getItem('token');

  // Fetch the active monitoring patients list to reuse active records quickly
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/nurse/patients-monitoring', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Error fetching patient queue", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchPatients();
  }, [token]);

  const handleSelectPatient = async (id) => {
    setLoadingData(true);
    setActiveTab("profile");
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/nurse/patient-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPatientData(res.data);
    } catch (err) {
      console.error("Error loading comprehensive details", err);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* LEFT COLUMN: PATIENT LIST */}
      <div style={{ width: '350px', background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>Patient Records Directory</h3>
        <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search active patient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} 
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loadingList ? (
            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Loading listings...</p>
          ) : filteredPatients.map(p => (
            <div 
              key={p.patient_id} 
              onClick={() => handleSelectPatient(p.patient_id)}
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', background: selectedPatientData?.patient_details?.id === p.patient_id ? '#f0fdf4' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{p.patient_name}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>ID: #{p.patient_id} • Bed: {p.bed_assignment || "OPD"}</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: COMPREHENSIVE VIEW DATA TRACK */}
      <div style={{ flex: 1, background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {loadingData ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="#10b981" />
          </div>
        ) : selectedPatientData ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Profiler */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>{selectedPatientData.patient_details.name}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Age: {selectedPatientData.patient_details.age} | Gender: {selectedPatientData.patient_details.gender} | Contact: {selectedPatientData.patient_details.phone}
              </p>
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {["profile", "prescriptions", "labs"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#10b981' : '#f1f5f9', color: activeTab === tab ? 'white' : '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {tab === "labs" ? "Lab Reports" : tab}
                </button>
              ))}
            </div>

            {/* Tab Windows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === "profile" && (
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 8px 0' }}><strong>Blood Group:</strong> {selectedPatientData.patient_details.blood_group}</p>
                  <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}><strong>Record Status:</strong> Active Clinical File Verified ✔️</p>
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedPatientData.prescriptions.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '13px' }}>No historic prescription rows recorded.</p> : 
                    selectedPatientData.prescriptions.map((p, idx) => (
                      <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{p.medicine_name}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Dosage: {p.dosage} | Frequency: {p.frequency} ({p.duration})</p>
                        </div>
                        <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{p.date}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              {activeTab === "labs" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedPatientData.lab_reports.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '13px' }}>No laboratory requests cataloged.</p> : 
                    selectedPatientData.lab_reports.map((l) => (
                      <div key={l.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{l.test_name}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Order reference ID: #{l.id}</p>
                        </div>
                        <span style={{ fontSize: '11px', background: l.status === "Billed" ? '#dcfce7' : '#fffbeb', color: l.status === "Billed" ? '#15803d' : '#b45309', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{l.status}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Select a patient profile from the left list to review their entire history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsAccess;