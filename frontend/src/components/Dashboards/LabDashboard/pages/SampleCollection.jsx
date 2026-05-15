import React, { useState, useEffect } from 'react';
import { FlaskConical, Beaker, CheckCircle, Printer, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const SampleCollection = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Tracks which button is "loading"

  useEffect(() => {
    fetchAcceptedSamples();
  }, []);

  const fetchAcceptedSamples = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
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
      // API call to move status from 'accepted' to 'collected'
      const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/collect`);
      
      if (response.status === 200) {
        // Remove from current list locally
        setSamples(prev => prev.filter(s => s.id !== requestId));
        alert("Sample marked as collected. Moving to Test Processing.");
      }
    } catch (error) {
      alert("Error marking sample as collected.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintLabel = (sample) => {
    // This would typically integrate with a thermal printer API
    console.log(`Generating Barcode for: ${sample.patient_id}-${sample.id}`);
    alert(`Barcode generated for ${sample.patient_name}\nSpecimen: ${sample.sample_type}`);
  };

  // Styles
  const containerStyle = { padding: '32px', marginLeft: '280px', width: 'calc(100% - 280px)', boxSizing: 'border-box' };
  const cardStyle = { background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s' };

  return (
    <div style={containerStyle}>
      <style>{`
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .action-btn:active { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FlaskConical size={28} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Sample Collection Queue</h2>
          </div>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Confirm physical specimen reception and generate barcodes.</p>
        </div>
        <button 
          onClick={fetchAcceptedSamples}
          style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
        >
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#10b981', margin: '0 auto' }} />
          <p style={{ color: '#94a3b8', marginTop: '16px', fontWeight: '600' }}>Loading accepted requests...</p>
        </div>
      ) : samples.length > 0 ? (
        samples.map((sample) => (
          <div key={sample.id} style={cardStyle} className="card-hover">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dcfce7' }}>
                <User size={26} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '17px', color: '#1e293b' }}>{sample.patient_name}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  UHID: <span style={{ color: '#0f172a', fontWeight: '700' }}>{sample.patient_id}</span> • 
                  Specimen: <span style={{ color: '#059669', fontWeight: '700' }}>{sample.sample_type}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                {sample.test_name}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handlePrintLabel(sample)}
                className="action-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Printer size={18} /> Print Label
              </button>
              
              <button 
                onClick={() => handleMarkCollected(sample.id)}
                disabled={processingId === sample.id}
                className="action-btn"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', border: 'none', 
                  background: '#10b981', color: 'white', fontWeight: '700', cursor: processingId === sample.id ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' 
                }}
              >
                {processingId === sample.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {processingId === sample.id ? "Processing..." : "Mark Collected"}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{ backgroundColor: 'white', padding: '80px', borderRadius: '24px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
          <Beaker size={48} style={{ marginBottom: '16px', opacity: 0.3, margin: '0 auto' }} />
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#64748b' }}>No samples currently pending collection.</p>
          <p style={{ fontSize: '14px' }}>Once you "Accept" a request from the Lab Queue, it will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default SampleCollection;