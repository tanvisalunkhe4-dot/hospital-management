import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Printer } from 'lucide-react';

const ReportView = ({ sampleId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sampleId) return;
    setLoading(true);
    axios.get(`http://localhost:8000/api/v1/lab/requests/${sampleId}/report-view`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => {
        setError(err.response?.data?.detail || "Failed to load report data.");
        setLoading(false);
      });
  }, [sampleId]);

  const getResults = () => {
    if (!data?.test_results) return [];
    try {
      const parsed = typeof data.test_results === 'string' ? JSON.parse(data.test_results) : data.test_results;
      return Object.entries(parsed);
    } catch { return []; }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading report...</div>;
  if (error) return <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;

  return (
    <div className="report-container" style={{ background: 'white', padding: '40px', maxWidth: '850px', margin: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-container, .report-container * { visibility: visible; }
          .report-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '500', color: '#475569' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
          <Printer size={16} /> Print Official Report
        </button>
      </div>

      {/* Clinical Header - Standardized Format */}
      <div style={{ borderBottom: '2px solid #10b981', marginBottom: '25px', paddingBottom: '20px' }}>
        <h1 style={{ color: '#10b981', margin: '0 0 15px', fontSize: '24px', textTransform: 'uppercase', textAlign: 'center' }}>
          Laboratory Test Results
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '14px', color: '#0f172a' }}>
        <div>
    <p><strong>{data.patient_name}</strong></p>
    <p>Age: {data.patient_age}</p>
    <p>Gender: {data.patient_gender}</p>
  </div>
  
  {/* Processing & Doctor Column */}
  <div>
    <p><strong>Processing Details</strong></p>
    <p>Verified: {data.verified_by}</p>
    <p>Ref. Doctor: {data.doctor_name}</p>
  </div>
  
  {/* Laboratory Info Column */}
  <div>
    <p><strong>Central Health Laboratory</strong></p>
    <p>123 Health Ave, Medicity</p>
  </div>
        </div>
      </div>

      {/* Results Table - Professional Grid */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>TEST PARAMETER</th>
            <th style={{ padding: '12px' }}>RESULT</th>
            <th style={{ padding: '12px' }}>UNIT</th>
            <th style={{ padding: '12px' }}>REFERENCE RANGE</th>
            <th style={{ padding: '12px' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {getResults().map(([key, val]) => {
            const valObj = typeof val === 'object' ? val : { result: val, unit: '-', range: '-' };
            return (
              <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{key}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{valObj.result || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{valObj.unit || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{valObj.range || '-'}</td>
                <td style={{ padding: '12px', color: '#059669', fontSize: '13px' }}>Normal</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportView;