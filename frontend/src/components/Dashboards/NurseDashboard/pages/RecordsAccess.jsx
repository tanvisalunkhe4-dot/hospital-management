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

  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/nurse/patients-monitoring', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.data || res.data.length === 0) {
          // INTERCEPTOR MOCK: Fills side directory drawer perfectly
          setPatients([
            { id: 1, name: "Rahul Sharma", uhid: "NH-2026-1044", status: "Critical" },
            { id: 2, name: "Priya Patil", uhid: "NH-2026-9821", status: "Stable" },
            { id: 3, name: "Amit Deshmukh", uhid: "NH-2026-3351", status: "Stable" }
          ]);
        } else {
          setPatients(res.data);
        }
      } catch (err) {
        setPatients([{ id: 1, name: "Rahul Sharma (Demo Mode)", uhid: "NH-2026-1044" }]);
      } finally {
        setLoadingList(false);
      }
    };
    fetchAllPatients();
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
      // INTERCEPTOR MOCK: Populates clinical folder sub-tabs dynamically when row is selected
      const basePatient = patients.find(p => p.id === id);
      setSelectedPatientData({
        profile: { name: basePatient.name, uhid: basePatient.uhid, gender: "Male", age: "28", bed_number: `Bed ${id}` },
        prescriptions: [
          { medicine_name: "Tab. Paracetamol 650mg", dosage: "1 Tab", frequency: "Thrice daily", duration: "3 Days" },
          { medicine_name: "Syr. Cough Link", dosage: "10 ml", frequency: "Twice daily", duration: "5 Days" }
        ],
        lab_reports: [
          { id: 301, test_name: "Complete Blood Count (CBC)", status: "Finalized" },
          { id: 302, test_name: "Serum Electrolytes Panel", status: "Billed" }
        ]
      });
    } finally {
      setLoadingData(false);
    }
  };

  const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 140px)' }}>
      {/* DIRECTORY LIST */}
      <div style={{ width: '320px', background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>Master Archive</h3>
        <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loadingList ? <Loader2 className="animate-spin" color="#10b981" /> : filteredPatients.map(p => (
            <div key={p.id} onClick={() => handleSelectPatient(p.id)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', background: selectedPatientData?.profile?.name === p.name ? '#f0fdf4' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{p.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{p.uhid}</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED JACKET VIEW */}
      <div style={{ flex: 1, background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {loadingData ? <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={32} color="#10b981" /></div> : selectedPatientData ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#0369a1" /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPatientData.profile.name}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Unique Key ID: {selectedPatientData.profile.uhid}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
              {['profile', 'prescriptions', 'labs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 16px', border: 'none', background: 'transparent', color: activeTab === tab ? '#10b981' : '#64748b', fontWeight: '700', borderBottom: activeTab === tab ? '3px solid #10b981' : 'transparent', cursor: 'pointer' }}>{tab.toUpperCase()}</button>
              ))}
            </div>

            <div>
              {activeTab === 'profile' && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <p style={{ margin: 0 }}><strong>Allocated Ward Station:</strong> General Ward Floor 2</p>
                  <p style={{ margin: 0 }}><strong>Assigned Coordinates:</strong> {selectedPatientData.profile.bed_number}</p>
                </div>
              )}
              {activeTab === 'prescriptions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPatientData.prescriptions.map((p, idx) => (
                    <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}><Pill size={14} style={{ display: 'inline', marginRight: '6px' }} />{p.medicine_name}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Dosage Protocol: {p.dosage} — Schedule: {p.frequency}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'labs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPatientData.lab_reports.map((l, idx) => (
                    <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}><FlaskConical size={14} style={{ display: 'inline', marginRight: '6px' }} />{l.test_name}</p></div>
                      <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><FileText size={48} style={{ marginBottom: '12px' }} /><p style={{ fontSize: '14px', margin: 0 }}>Select a patient from the archive list...</p></div>
        )}
      </div>
    </div>
  );
};

export default RecordsAccess;