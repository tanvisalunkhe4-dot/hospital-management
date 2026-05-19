import React, { useState, useEffect } from 'react';
import { FlaskConical, Beaker, CheckCircle, Printer, User, Loader2, Barcode, Search, Filter, Layers, Clock, AlertTriangle, X, BriefcaseMedical, Info, ClipboardCheck } from 'lucide-react';
import axios from 'axios';

const SampleCollection = () => {
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPatientCard, setSelectedPatientCard] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
 
  const [collectionModal, setCollectionModal] = useState({
    isOpen: false,
    sample: null,
    sampleType: '',
    quantity: '',
    collectionMethod: 'Venipuncture',
    collectionSite: 'Left Antecubital Fossa'
  });

  useEffect(() => {
    fetchAcceptedSamples();
  }, []);useEffect(() => {
    fetchAcceptedSamples();
    
    return () => {
      setToast({ visible: false, message: '', type: 'success' });
    };
  }, []);


  useEffect(() => {
    let result = samples;

    if (searchQuery.trim() !== '') {
      result = result.filter(s => 
        s.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.accession_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'All') {
      result = result.filter(s => s.sample_type?.toUpperCase() === selectedType.toUpperCase());
    }

    setFilteredSamples(result);
  }, [searchQuery, selectedType, samples]);

  
  const fetchAcceptedSamples = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id') || 1; 
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/accepted/${hospitalId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setSamples(data);
      setFilteredSamples(data); // Sync initial data view
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };
  


  const handleFinalizeCollection = async () => {
    const { sample, sampleType, quantity, collectionMethod, collectionSite } = collectionModal;
    setProcessingId(sample.id);
    
    try {
      const payload = {
        sample_type: sampleType,
        quantity: quantity,
        collection_method: collectionMethod,
        collection_site: collectionSite,
        collected_at: new Date().toISOString(),
        status: 'Processing' // This field transition moves the request to the next stage
      };

      // Submits the complete metadata form to your collection API route
      const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${sample.id}/collect`, payload);
      
      if (response.status === 200) {
        // Updates local UI to remove the processed item from the collection queue
        setSamples(prev => prev.filter(s => s.id !== sample.id));
        if (selectedPatientCard?.id === sample.id) {
          setSelectedPatientCard(null);
        }
        setCollectionModal({ 
          isOpen: false, 
          sample: null, 
          sampleType: '', 
          quantity: '', 
          collectionMethod: '', 
          collectionSite: '' 
        });
        
        setToast({ visible: true, message: 'Sample transitioned to Test Processing!', type: 'success' });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
      }
    } catch (error) {
      console.error("Collection Submission Error:", error);
      alert("Failed to submit sample collection metrics.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintLabel = (sample) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 3in 4in; margin: 0; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 10px; margin: 0; color: #1e293b; }
            .label-container { border: 2px solid #10b981; padding: 12px; width: 280px; border-radius: 8px; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px; }
            .logo-text { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .hosp-name { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            .field { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .label-title { font-weight: 700; color: #475569; }
            .barcode-area { text-align: center; margin: 15px 0; background: #f8fafc; padding: 10px; border-radius: 6px; }
            .acc-num { font-size: 18px; font-weight: 900; color: #0f172a; }
            .scanner-hint { font-size: 8px; color: #64748b; margin-top: 4px; font-weight: 600; }
            .footer-section { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            .sig-line { border-top: 1px solid #1e293b; width: 120px; margin: 25px auto 5px auto; }
            .sig-text { font-size: 10px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <div class="logo-text">Powered by NexHealth</div>
              <div class="hosp-name">CITY CENTRAL HOSPITAL</div>
            </div>
            
            <div class="field"><span class="label-title">Patient:</span> <span>${sample.patient_name}</span></div>
            <div class="field"><span class="label-title">PID/Age:</span> <span>${sample.patient_id || 'N/A'} / ${sample.patient_age || 'N/A'}</span></div>
            
            <div class="barcode-area">
              <div class="acc-num">${sample.accession_number}</div>
              <div class="scanner-hint">SCAN FOR LIS DATA</div>
            </div>
  
            <div class="field"><span class="label-title">Test:</span> <span>${sample.test_name}</span></div>
            <div class="field"><span class="label-title">Type:</span> <span>${sample.sample_type}</span></div>
            <div class="field"><span class="label-title">Collected:</span> <span>${new Date().toLocaleString('en-IN')}</span></div>
            
            <div class="footer-section">
              <div class="field"><span class="label-title">Doctor:</span> <span>${sample.doctor_name || 'N/A'}</span></div>
              <div class="field"><span class="label-title">Dept:</span> <span>${sample.doctor_dept || 'N/A'}</span></div>
            </div>
            
            <div class="sig-text" style="margin-top: 15px;">Tech: ${sessionStorage.getItem('user_name') || 'Lab Staff'}</div>
            <div class="sig-line"></div>
            <div class="sig-text">Laboratory Signature</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const countPending = samples.length;
  const uniqueSampleTypes = ['All', ...new Set(samples.map(s => s.sample_type).filter(Boolean))];
  const formatIST = (dateString) => {
    if (!dateString) return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
    });
    
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
    });
  };
  // Modern UI Styles
  const containerStyle = { padding: '32px', marginLeft: '280px', width: 'calc(100% - 280px)', boxSizing: 'border-box', position:'relative' };
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
        
        .custom-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      
           .clickable-patient-name {
          font-weight: 700; 
          color: #1e293b; 
          font-size: 15px;
          cursor: pointer;
          transition: color 0.15s ease;
          display: inline-block;
        }
        .clickable-patient-name:hover {
          color: #10b981 !important;
          text-decoration: underline;
        }
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
     
     
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: toast.type === 'error' ? '1px solid #fee2e2' : '1px solid #dcfce7',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} color="#ef4444" /> : <CheckCircle size={18} color="#10b981" />}
          <span style={{ fontSize: '13.5px', fontWeight: '600', color: toast.type === 'error' ? '#991b1b' : '#14532d' }}>
            {toast.message}
          </span>
        </div>
      )}

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


      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '10px', borderRadius: '12px' }}><Clock size={20} /></div>
          <div>
            <h4 style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Awaiting Action</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{countPending}</p>
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#10b981', padding: '10px', borderRadius: '12px' }}><Layers size={20} /></div>
          <div>
            <h4 style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Specimen Matrices</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '700', color: '#475569' }}>
              {uniqueSampleTypes.length - 1} Distinct Classes Active
            </p>
          </div>
        </div>
      </div>

      {/* --- FEATURE 1: QUICK SEARCH / FILTER BAR CONTAINER --- */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input 
            type="text"
            placeholder="Search matching patient name "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13.5px', fontWeight: '500', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={14} color="#94a3b8" style={{ position: 'absolute', left: '14px', zIndex: 2 }} />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: '10px 16px 10px 36px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '600', color: '#475569', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
          >
            {uniqueSampleTypes.map((type, idx) => (
              <option key={idx} value={type}>{type === 'All' ? 'All Fluid Types' : type}</option>
            ))}
          </select>
        </div>
      </div>



      {/* --- TABLE SECTION --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#10b981', margin: '0 auto' }} />
          <p style={{ color: '#94a3b8', marginTop: '16px', fontWeight: '600' }}>Syncing Laboratory Records...</p>
        </div>
      ) : filteredSamples.length > 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Patient Identity</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Record Details</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Test</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Collection Time</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}> Action</th>
              </tr>
            </thead>
            <tbody>
            {filteredSamples.map((sample) => {
                const statusTheme = getStatusStyle(sample.status || 'Accepted');
                const requiresFasting = sample.test_name?.toLowerCase().includes('lipid') || sample.test_name?.toLowerCase().includes('glucose');
                const requiresIsolation = sample.sample_type?.toLowerCase().includes('sputum');
                return (
                  <tr key={sample.id} className="table-row">
                  {/* Step 1: Collect Patient Samples (Identity) */}
<td 
  className="clickable-identity-cell" // 🌟 ADD THIS CLASS
  style={{ padding: '16px 24px' }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPatientCard(sample);
  }}
  
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Avatar Icon */}
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#64748b', 
            flexShrink: 0 
          }}>
            <User size={20} />
          </div>
          


          {/* Info Block Wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
            <div className="clickable-patient-name">
              {sample.patient_name}
            </div>
            <div style={{ marginTop: '4px' }}>
  {(() => {
    // This uses your live 'sample.priority' field instead of checking test names
    const p = (sample.priority || "Normal").toLowerCase();
    
    if (p === 'urgent') {
      return <span style={{ fontSize: '10px', fontWeight: '800', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '2px 6px', borderRadius: '4px' }}>🔴 URGENT</span>;
    } else if (p === 'high') {
      return <span style={{ fontSize: '10px', fontWeight: '800', background: '#fff7ed', color: '#f97316', border: '1px solid #ffedd5', padding: '2px 6px', borderRadius: '4px' }}>🟡 HIGH</span>;
    } else {
      return <span style={{ fontSize: '10px', fontWeight: '800', background: '#f0fdf4', color: '#10b981', border: '1px solid #dcfce7', padding: '2px 6px', borderRadius: '4px' }}>🟢 NORMAL</span>;
    }
  })()}
</div>
            
            {/* Conditional Protocol Badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }} onClick={(e) => e.stopPropagation()}>
              {requiresFasting && (
                <span style={{ fontSize: '10px', background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  12h Fasting Required
                </span>
              )}
              {requiresIsolation ? (
                <span style={{ fontSize: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fee2e2', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <AlertTriangle size={10} /> Droplet Precautions
                </span>
              ) : (
                <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                  Standard Protocol
                </span>
              )}
            </div>
          </div>

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
                    <td style={{ padding: '16px 24px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '600', color: '#334155' }}>
    <Clock size={14} color="#94a3b8" /> 
    {formatIST(sample.collection_time)}
  </div>
</td>

                    {/* Step 3: Label Samples & Finalize */}
                    <td 
  style={{ padding: '16px 24px', textAlign: 'right' }} 
  onClick={(e) => e.stopPropagation()} 
>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handlePrintLabel(sample)}
                          className="btn-action-outline"
                          title="Label Sample (Print Barcode)"
                        >
                          <Printer size={18} />
                        </button>
                        <button 
  onClick={() => {
    setCollectionModal({
      isOpen: true,
      sample: sample,
      sampleType: sample.sample_type || '',
      quantity: sample.sample_type?.toLowerCase().includes('blood') ? '4 mL' : '10 mL',
      collectionMethod: sample.sample_type?.toLowerCase().includes('blood') ? 'Venipuncture' : 'Spontaneous Void',
      collectionSite: sample.sample_type?.toLowerCase().includes('blood') ? 'Left Antecubital Fossa' : 'Not Applicable'
    });
  }}
  className="btn-collect-primary"
>
  <CheckCircle size={16} /> Collect Sample
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
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b', margin: 0 }}>No Samples Found</h3>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>We couldn't find any pending samples matching your criteria.</p>
        </div>
      )}
      {/* --- ADDED FEATURE: POPUP CARD MODAL FOR PATIENT INFO --- */}
      {selectedPatientCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', // Dark blur drop
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }} onClick={() => setSelectedPatientCard(null)}>
          
          <div style={{
            background: 'white',
            width: '460px',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Card Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                <BriefcaseMedical size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Clinical Patient Information</h3>
              </div>
              <button 
                onClick={() => setSelectedPatientCard(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '50%' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#475569'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Details */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Field 1: Patient Name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Patient Name</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'right' }}>{selectedPatientCard.patient_name}</span>
              </div>

              {/* Field 2: Patient ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Patient ID</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>
                  PID-{selectedPatientCard.patient_id || selectedPatientCard.id + 1040}
                </span>
              </div>

              {/* Field 3: Age / Gender */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Age / Gender</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {selectedPatientCard.patient_age ?? 'N/A'} Yrs / {selectedPatientCard.patient_gender || 'N/A'}
                </span>
              </div>

              {/* Field 4: Doctor Name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Doctor Name</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {selectedPatientCard.doctor_name || 'Dr. Practitioner'} ({selectedPatientCard.doctor_dept || 'OPD'})
                </span>
              </div>

              {/* Field 5: Test Name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Test Name</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedPatientCard.test_name}
                </span>
              </div>

             {/* Field 6: Priority Level - Dynamic Live Data */}
<div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Priority Level</span>
  {(() => {
    const p = (selectedPatientCard.priority || "Normal").toLowerCase();
    const isUrgent = p === 'urgent' || p === 'high';
    
    return (
      <span style={{ 
        fontSize: '11px', 
        fontWeight: '800', 
        textTransform: 'uppercase',
        color: isUrgent ? '#ef4444' : '#64748b',
        background: isUrgent ? '#fef2f2' : '#f8fafc',
        padding: '2px 8px',
        borderRadius: '6px',
        border: isUrgent ? '1px solid #fee2e2' : '1px solid #e2e8f0'
      }}>
        {selectedPatientCard.priority || 'Normal'}
      </span>
    );
  })()}
</div>

            </div>

            {/* Modal Footer Controls */}
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedPatientCard(null)}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Collection Confirmation Modal */}
{collectionModal.isOpen && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Confirm Collection</h3>
      <p style={{ fontSize: '14px', color: '#64748b' }}>Proceeding will move this sample to the Processing queue.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => setCollectionModal({...collectionModal, isOpen: false})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
        <button onClick={handleFinalizeCollection} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold' }}>Confirm & Process</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
    

export default SampleCollection;