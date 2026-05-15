import React, { useState, useEffect } from 'react';
import { FlaskConical, Beaker, CheckCircle, Printer, User, Loader2, Barcode } from 'lucide-react';
import axios from 'axios';

const SampleCollection = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAcceptedSamples();
  }, []);

  const fetchAcceptedSamples = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id') || 1; // Fallback to 1 for testing
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/accepted/${hospitalId}`);
      setSamples(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async (requestId) => {
    setProcessingId(requestId);
    try {
      // Moves status from 'Accepted' to 'Collected' in backend
      const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/collect`);
      
      if (response.status === 200) {
        setSamples(prev => prev.filter(s => s.id !== requestId));
        // You could trigger a toast notification here instead of an alert
        console.log("Sample marked as collected.");
      }
    } catch (error) {
      console.error("Collection Error:", error);
      alert("Failed to mark sample as collected. Check backend logs.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintLabel = (sample) => {
    // Mocking the professional label output
    const labelData = {
      patient: sample.patient_name,
      accession: sample.accession_number,
      specimen: sample.sample_type,
      timestamp: new Date().toLocaleString()
    };
    
    console.log("Printing Specimen Label:", labelData);
    alert(`Label Printed!\nAccession: ${sample.accession_number}\nPatient: ${sample.patient_name}`);
  };

  // Modern UI Styles
  const containerStyle = { padding: '32px', marginLeft: '280px', width: 'calc(100% - 280px)', boxSizing: 'border-box' };
  const cardStyle = { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '24px', 
    border: '1px solid #f1f5f9', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
    transition: 'transform 0.2s' 
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }; // Orange
      case 'Accepted': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' }; // Blue
      case 'Collected': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' }; // Green
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };
  return (
    <div style={containerStyle}>
      <style>{`
        .table-row { transition: all 0.2s ease; border-bottom: 1px solid #f1f5f9; }
        .table-row:hover { background-color: #f8fafc; }
        
        .btn-action-outline { 
          transition: all 0.2s ease; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 10px; 
          border-radius: 10px; 
          border: 1px solid #e2e8f0; 
          background: white; 
          color: #64748b; 
          cursor: pointer; 
        }
        .btn-action-outline:hover { 
          background: #f1f5f9 !important; 
          color: #0f172a !important; 
          border-color: #cbd5e1 !important; 
        }

        .btn-collect-primary { 
          transition: all 0.2s ease; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          padding: 10px 20px; 
          border-radius: 10px; 
          border: none; 
          background: #10b981; 
          color: white; 
          font-weight: 700; 
          font-size: 13px; 
          cursor: pointer; 
        }
        .btn-collect-primary:hover:not(:disabled) { 
          background: #059669 !important; 
          transform: translateY(-1px); 
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); 
        }
        .btn-collect-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* --- HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', color: '#10b981' }}>
              <FlaskConical size={28} />
            </div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Sample Collection
            </h2>
          </div>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '14px', fontWeight: '500' }}>
            Verify patient identity, record specimen details, and generate clinical labels.
          </p>
        </div>
        <button 
          onClick={fetchAcceptedSamples}
          style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#475569', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Loader2 size={16} /> Refresh Queue
        </button>
      </div>

      {/* --- TABLE SECTION --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#10b981', margin: '0 auto' }} />
          <p style={{ color: '#94a3b8', marginTop: '16px', fontWeight: '600' }}>Syncing Laboratory Records...</p>
        </div>
      ) : samples.length > 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Patient Identity</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Record Details</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Test</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}> Action</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample) => {
                const statusTheme = getStatusStyle(sample.status || 'Accepted');
                return (
                  <tr key={sample.id} className="table-row">
                    {/* Step 1: Collect Patient Samples (Identity) */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <User size={20} />
                        </div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{sample.patient_name}</div>
                      </div>
                    </td>

                    {/* Step 2: Record Sample Details */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Barcode size={14} color="#64748b" /> {sample.accession_number}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                          {sample.sample_type}
                        </div>
                      </div>
                    </td>

                    {/* Test Details */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {sample.test_name}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        backgroundColor: statusTheme.bg,
                        color: statusTheme.text,
                        border: `1px solid ${statusTheme.border}`,
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}>
                        {sample.status || 'Accepted'}
                      </span>
                    </td>

                    {/* Step 3: Label Samples & Finalize */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handlePrintLabel(sample)}
                          className="btn-action-outline"
                          title="Label Sample (Print Barcode)"
                        >
                          <Printer size={18} />
                        </button>
                        <button 
                          onClick={() => handleMarkCollected(sample.id)}
                          disabled={processingId === sample.id}
                          className="btn-collect-primary"
                        >
                          {processingId === sample.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Collect Sample
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', padding: '80px', borderRadius: '24px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
          <Beaker size={48} style={{ marginBottom: '16px', opacity: 0.3, margin: '0 auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b', margin: 0 }}>Queue Clear</h3>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>All clinical samples have been collected and labeled.</p>
        </div>
      )}
    </div>
  );
};

export default SampleCollection;