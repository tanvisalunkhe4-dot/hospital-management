import React, { useState, useEffect } from 'react';
import { Beaker, Save, Loader2, FlaskConical } from 'lucide-react';
import axios from 'axios';

const TestProcessing = () => {
  const [collectedSamples, setCollectedSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [resultValues, setResultValues] = useState({});

  useEffect(() => {
    fetchCollectedSamples();
  }, []);

  const fetchCollectedSamples = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id') || 1;
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/collected/${hospitalId}`);
      setCollectedSamples(response.data);
    } catch (error) {
      console.error("Error fetching collected samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultSubmit = async (requestId) => {
    const value = resultValues[requestId];
    if (!value || value.trim() === "") {
      alert("Please enter a valid medical finding before finalizing.");
      return;
    }

    setSubmittingId(requestId);
    try {
      await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/complete`, {
        test_results: { observation: value },
        result_summary: "Test completed and verified by NexHealth Lab Tech."
      });

      setCollectedSamples(prev => prev.filter(s => s.id !== requestId));
      const newValues = { ...resultValues };
      delete newValues[requestId];
      setResultValues(newValues);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to save results.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ 
      padding: '40px 60px', 
      marginLeft: '280px', // Matches sidebar width
      width: 'calc(100% - 280px)', // Occupies remaining screen width
      minHeight: '100vh',
      backgroundColor: '#fcfdfd',
      boxSizing: 'border-box'
    }}>      
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{ backgroundColor: '#f0fdf9', padding: '10px', borderRadius: '12px' }}>
                <Beaker size={24} style={{ color: '#10b981' }} />
             </div>
             <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
               Test Processing
             </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', marginLeft: '48px' }}>
            Analyze specimens and record final findings to generate clinical reports.
          </p>
        </div>
        
        <div style={{ 
          background: '#f0fdf4', 
          padding: '12px 24px', 
          borderRadius: '14px', 
          border: '1.5px solid #dcfce7',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          <span style={{ color: '#166534', fontWeight: '700', fontSize: '14px' }}>
            In-Lab Samples: {collectedSamples.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader2 className="animate-spin" size={40} style={{ color: '#10b981' }} />
        </div>
      ) : collectedSamples.length > 0 ? (
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          border: '1px solid #eef2f6', 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                <th style={tableHeaderStyle}>Sample Accession</th>
                <th style={tableHeaderStyle}>Patient & Test</th>
                <th style={tableHeaderStyle}>Medical Findings</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {collectedSamples.map((sample) => (
                <tr key={sample.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '3px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                          <span style={{ fontSize: '13px', color: '#334155', fontWeight: '800' }}>
                            {sample.accession_number}
                          </span>
                       </div>
                       <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', paddingLeft: '9px' }}>
                         • {sample.sample_type}
                       </span>
                    </div>
                  </td>

                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{sample.patient_name}</span>
                       <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                         {sample.test_name}
                       </span>
                    </div>
                  </td>

                  <td style={{ padding: '24px' }}>
                     <input 
                       type="text" 
                       placeholder="Enter result (e.g. 14.2)"
                       value={resultValues[sample.id] || ''}
                       onChange={(e) => setResultValues({
                         ...resultValues,
                         [sample.id]: e.target.value
                       })}
                       style={{ 
                         padding: '12px 18px', 
                         borderRadius: '12px', 
                         border: '1.5px solid #f1f5f9', 
                         width: '100%',
                         maxWidth: '300px',
                         fontSize: '14px',
                         fontWeight: '600',
                         backgroundColor: '#fcfdfe',
                         outline: 'none'
                       }}
                     />
                  </td>

                  <td style={{ padding: '24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleResultSubmit(sample.id)}
                      disabled={submittingId === sample.id}
                      style={{ 
                        background: '#0f172a', 
                        color: 'white', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontWeight: '700',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                      }}
                    >
                      {submittingId === sample.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Finalize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 40px', background: 'white', borderRadius: '24px', border: '2px dashed #f1f5f9' }}>
          <FlaskConical size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', fontWeight: '800' }}>No samples in processing.</h3>
        </div>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '20px 24px',
  fontSize: '12px',
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontWeight: '800',
  letterSpacing: '0.8px'
};

export default TestProcessing;