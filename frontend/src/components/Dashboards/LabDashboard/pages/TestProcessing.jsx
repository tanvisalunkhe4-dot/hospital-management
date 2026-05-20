import React, { useState, useEffect } from 'react';
import { Beaker, Save, Loader2, FlaskConical, ClipboardCheck, Play, Clock, HardDrive, Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const TestProcessing = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [resultValues, setResultValues] = useState({});
  const [processingState, setProcessingState] = useState({}); 
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [selectedFiles, setSelectedFiles] = useState({}); // Stores file objects by sample ID
  useEffect(() => {
    fetchCollectedSamples();
  }, []);

  const fetchCollectedSamples = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id') || 1;
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/collected/${hospitalId}`);
      
      const samplesData = Array.isArray(response.data) ? response.data : [];
      setSamples(samplesData);

      // Pre-fill resultValues if the sample already has partial data
      const initialResults = {};
      samplesData.forEach(s => {
        if (s.test_results) {
          // Assuming your DB stores it as { parameters: {...}, note: "..." }
          initialResults[s.id] = {
            ...(s.test_results.parameters || {}),
            note: s.test_results.note || ""
          };
        }
      });
      setResultValues(initialResults);
      
    } catch (error) {
      console.error("Error fetching live lab samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (id) => {
    setProcessingState(prev => ({ 
      ...prev, 
      [id]: { startedAt: new Date(), status: 'Processing' } 
    }));
  };


  const handleResultSubmit = async (sample) => {
    const data = resultValues[sample.id] || {};
    const { note, ...parameters } = data;
    
    // Create FormData
    const formData = new FormData();
    
    // 1. Combine all metadata into 'result_data' to match the FastAPI Form() field
    const metadata = {
      test_results: parameters,
      note: note || "",
      result_summary: `Test completed with ${Object.keys(parameters).length} parameters.`,
      status: 'Completed'
    };
    
    formData.append('result_data', JSON.stringify(metadata));
    
    // 2. Append the file if selected
    if (selectedFiles[sample.id]) {
      formData.append('file', selectedFiles[sample.id]);
    }
    
    setSubmittingId(sample.id);
    try {
      // 3. IMPORTANT: Do not set Content-Type header. 
      // Axios/Browser will automatically set it to 'multipart/form-data' 
      // including the required boundary parameter.
      await axios.put(
        `http://localhost:8000/api/v1/lab/requests/${sample.id}/complete`, 
        formData
      );
    
      setSamples(prev => prev.filter(s => s.id !== sample.id));
      setToast({ visible: true, message: 'Test finalized!', type: 'success' });
    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      setToast({ visible: true, message: 'Failed to update record.', type: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelProcessing = (id) => {
    setProcessingState(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };


  const handleSaveDraft = async (sample) => {
    const data = resultValues[sample.id] || {};
    const { note, ...parameters } = data;
  
    try {
      await axios.put(`http://localhost:8000/api/v1/lab/requests/${sample.id}/draft`, {
        test_results: { parameters, note: note || "" }
      });
      setToast({ visible: true, message: 'Draft saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Draft save error:", error);
      setToast({ visible: true, message: 'Failed to save draft.', type: 'error' });
    }
  };

  const getPriorityBadge = (sample) => {
    // Now it pulls 'priority' directly from the object passed to it
    const p = (sample?.priority || 'routine').toLowerCase();
    
    if (p === 'urgent') return { color: '#ef4444', bg: '#fef2f2', label: '🔴 URGENT' };
    if (p === 'high') return { color: '#f59e0b', bg: '#fffbeb', label: '🟡 HIGH' };
    
    return { color: '#10b981', bg: '#ecfdf5', label: '🟢 ROUTINE' };
  };

  const updateResult = (id, field, value) => {
    setResultValues(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  // 1. Updated helper function to match test names by keyword
  const getTemplateFields = (testName) => {
    const name = testName?.toUpperCase() || "";
    
    if (name.includes("CBC") || name.includes("BLOOD COUNT")) 
      return [
        { name: 'Hemoglobin', min: 12, max: 16 },
        { name: 'RBC', min: 4.5, max: 5.9 },
        { name: 'WBC', min: 4500, max: 11000 },
        { name: 'Platelets', min: 150000, max: 450000 }
      ];
      
    if (name.includes("LIPID")) 
      return [
        { name: 'HDL', min: 40, max: 60 },
        { name: 'LDL', min: 0, max: 100 },
        { name: 'Triglycerides', min: 0, max: 150 },
        { name: 'Cholesterol', min: 0, max: 200 }
      ];
  
    if (name.includes("GLUCOSE") || name.includes("BLOOD SUGAR")) 
      return [
        { name: 'Fasting', min: 70, max: 99 },
        { name: 'PP', min: 70, max: 140 }
      ];
  
    if (name.includes("THYROID"))
      return [
        { name: 'T3', min: 80, max: 200 },
        { name: 'T4', min: 5, max: 12 },
        { name: 'TSH', min: 0.4, max: 4.0 }
      ];
  
    if (name.includes("HBA1C"))
      return [
        { name: 'Average Glucose', min: 70, max: 125 },
        { name: 'Percentage', min: 4, max: 5.6 }
      ];
  
    return [{ name: 'Observation', min: 0, max: 99999 }];
  };
  
  return (
    <div style={{ padding: '32px', marginLeft: '280px', width: 'calc(100% - 280px)', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Test Processing</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Manage active laboratory diagnostics and report findings.</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '12px', color: '#4f46e5' }}><Activity size={24}/></div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Active Queue</p>
              <h3 style={{ margin: 0, fontSize: '22px' }}>{samples.length} Samples</h3>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '12px', color: '#ea580c' }}><AlertCircle size={24}/></div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Urgent Tasks</p>
              <h3 style={{ margin: 0, fontSize: '22px' }}>{samples.filter(s => s.priority?.toLowerCase() === 'urgent').length} Pending</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 size={40} className="animate-spin" color="#7c3aed" /></div>
      ) : samples.length > 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Accession & Time</th>
                <th style={thStyle}>Patient & Priority</th>
                <th style={thStyle}>Test</th>
                <th style={thStyle}>Status</th>
                <th style={{...thStyle, textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
            {samples.map(sample => {
  const p = getPriorityBadge(sample); // <--- Updated (Pass the full sample object)
  const isStarted = !!processingState[sample.id];
                return (
                  <tr key={sample.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{sample.accession_number}</div>
                      {isStarted && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                          <Clock size={10} style={{ display: 'inline' }} /> Started: {processingState[sample.id].startedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '700' }}>{sample.patient_name}</div>
                      <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', color: p.color, background: p.bg }}>{p.label}</span>
                    </td>
                    <td style={tdStyle}>
          <span style={{ 
            padding: '4px 8px', 
            background: '#e0f2fe', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: '700',
            color: '#0369a1' 
          }}>
            {sample.test_name}
          </span>
        </td>
                    {/* Replace your current status <td> with this logic */}
<td style={tdStyle}>
  <span style={{ 
    fontSize: '11px', 
    fontWeight: '700', 
    padding: '4px 8px', 
    borderRadius: '6px', 
    background: 
      sample.status === 'Verified' ? '#dbeafe' : 
      isStarted ? '#fefce8' : '#f1f5f9', 
    color: 
      sample.status === 'Verified' ? '#1e40af' : 
      isStarted ? '#854d0e' : '#64748b' 
  }}>
    {sample.status === 'Verified' ? 'Verified' : (isStarted ? 'Processing' : 'Pending')}
  </span>
</td>
                    <td style={{...tdStyle, textAlign: 'right'}}>
                      {!isStarted ? (
                        <button onClick={() => handleStartTest(sample.id)} style={btnPrimary}>
                          <Play size={12} style={{ display: 'inline', marginRight: '4px' }} /> Start
                        </button>
) : (
  <div style={{ 
    backgroundColor: '#f1f5f9', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0',
    minWidth: '250px' 
  }}>
    <button 
        onClick={() => handleCancelProcessing(sample.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex' }}
      >
        <ArrowLeft size={16} />
      </button>
    <div style={{ marginBottom: '8px', color: '#4f46e5', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
      {sample.test_name}
    </div>

    <div style={{ marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '13px' }}>
      Result Entry
    </div>
    
    {/* Input Grid */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
  {getTemplateFields(sample.test_name).map((field) => {
    // 1. Calculate validation status
    const val = parseFloat(resultValues[sample.id]?.[field.name]);
    const isAbnormal = val && (val < field.min || val > field.max);

    return (
      <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* 2. Use field.name for the label */}
        <label style={{ fontSize: '10px', fontWeight: '700', color: isAbnormal ? '#ef4444' : '#64748b' }}>
          {field.name} {isAbnormal ? '⚠️' : ''}
        </label>
        
        {/* 3. Use field.name for value and onChange */}
        <input 
          type="number" 
          placeholder="0.00"
          value={resultValues[sample.id]?.[field.name] || ''}
          onChange={(e) => updateResult(sample.id, field.name, e.target.value)} 
          style={{ 
            padding: '6px', 
            borderRadius: '6px', 
            border: `1px solid ${isAbnormal ? '#ef4444' : '#cbd5e1'}`,
            backgroundColor: isAbnormal ? '#fef2f2' : 'white',
            fontSize: '12px' 
          }} 
        />
      </div>
    );
  })}
</div>

    {/* Notes */}
    <textarea 
      placeholder="Clinical notes..." 
      onChange={(e) => updateResult(sample.id, 'note', e.target.value)}
      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '12px', resize: 'vertical' }}
      rows={2}
    />
   <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
  <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px' }}>
    ATTACH DIAGNOSTIC IMAGES
  </label>
  <input 
    type="file" 
    accept="image/*"
    onChange={(e) => setSelectedFiles(prev => ({ ...prev, [sample.id]: e.target.files[0] }))}
    style={{ fontSize: '12px', width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}
  />
</div>
    {/* Replace your Finalize button block with this: */}
<div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
  <button 
    onClick={() => handleSaveDraft(sample)} 
    style={{ 
      flex: 1, 
      padding: '8px', 
      borderRadius: '8px', 
      border: '1px solid #059669', 
      background: 'transparent', 
      color: '#059669', 
      fontWeight: '600', 
      fontSize: '12px', 
      cursor: 'pointer' 
    }}
  >
    Save Draft
  </button>
  <button onClick={() => handleResultSubmit(sample)} style={{ flex: 2, ...btnFinalize }}>
    {submittingId === sample.id ? <Loader2 className="animate-spin" size={14}/> : 'Finalize'}
  </button>
</div>
  </div>
)}                </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed #e2e8f0', borderRadius: '20px' }}>
          <FlaskConical size={48} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', marginTop: '16px' }}>No specimens ready for processing.</p>
        </div>
      )}
    </div>
  );
};

// Styles
const cardStyle = { flex: 1, background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' };
const thStyle = { padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', textAlign: 'left' };
const tdStyle = { padding: '16px 24px' };
const btnPrimary = { background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' };
const btnFinalize = { background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' };
const inputStyle = { width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' };

export default TestProcessing;