import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, Clock, Search } from 'lucide-react';
import axios from 'axios';

// --- STYLES DEFINED OUTSIDE TO PREVENT REFERENCE ERRORS ---
const containerStyle = { padding: '32px' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 };
const subtitleStyle = { fontSize: '14px', color: '#64748b', marginTop: '4px' };
const searchWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '16px', color: '#94a3b8' };
const searchInput = { padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '320px', fontSize: '14px' };
const tableContainer = { backgroundColor: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const headerRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thStyle = { textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' };
const trStyle = { borderBottom: '1px solid #f8fafc' }; // Added missing trStyle
const tdStyle = { padding: '20px 24px' };
const testBadge = { backgroundColor: '#f0fdfa', color: '#0d9488', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'inline-block' };
const urgentBadge = { color: '#ef4444', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' };
const normalBadge = { color: '#6366f1', backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' };
const actionGroup = { display: 'flex', gap: '8px' };
const viewButton = { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' };
const acceptButton = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '80px', color: '#94a3b8', fontWeight: '600' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: 'white', padding: '0', borderRadius: '24px', width: '600px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' };
const modalHeader = { padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const modalBody = { padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const infoBlock = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' };
const valueStyle = { fontSize: '14px', fontWeight: '600', color: '#1e293b' };
const fullWidthBlock = { gridColumn: '1 / span 2', padding: '16px', background: '#f0fdfa', borderRadius: '12px', border: '1px solid #ccfbf1' };
const sectionTitle = { fontSize: '12px', fontWeight: '800', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px', gridColumn: '1 / span 2', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryValue = { fontSize: '13px', color: '#64748b', fontWeight: '500' };
const metaBadge = { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', border: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' };
const iconCircle = { width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };

const TestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

const handleOpenModal = (req) => {
  setSelectedRequest(req);
  setShowModal(true);
};
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
      if (!hospitalId) {
        console.error("No hospital session found");
        return;
      }
  
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/pending/${hospitalId}`);
      // Ensure we always have an array even if backend sends null
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching lab requests:", error);
      alert("Communication error with server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/accept`);
      if (response.status === 200) {
        // Remove from local state immediately for a "snappy" UI feel
        setRequests(prev => prev.filter(r => r.id !== requestId));
        setShowModal(false);
        // In a real app, you'd trigger a success notification here
      }
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to accept request");
    }
  };

  // Filter logic for the search bar
  const filteredRequests = requests.filter(req => 
    req.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.patient_id?.toString().includes(searchQuery)
  );

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <div>
          <h2 style={titleStyle}>Pending Test Requests</h2>
          <p style={subtitleStyle}>Incoming lab orders from doctor consultations</p>
        </div>
        
        <div style={searchWrapper}>
          <Search size={18} style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Patient Name or ID..." 
            style={searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRow}>
              <th style={thStyle}>PATIENT DETAILS</th>
              <th style={thStyle}>TEST REQUIRED</th>
              <th style={thStyle}>ORDERED BY</th>
              <th style={thStyle}>PRIORITY</th>
              <th style={thStyle}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
              <tr key={req.id} style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{req.patient_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {req.patient_id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={testBadge}>{req.test_name}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600' }}>Dr. {req.doctor_name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {req.doctor_id}</div>
                </td>
                <td style={tdStyle}>
                  <span style={req.priority === 'Urgent' ? urgentBadge : normalBadge}>
                    {req.priority}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={actionGroup}>
                  <button 
  style={viewButton} 
  title="View Details" 
  onClick={() => handleOpenModal(req)} // Add this line
>
  <Eye size={16} />
</button>
                    <button onClick={() => handleAccept(req.id)} style={acceptButton}>
                      <CheckCircle2 size={16} /> Accept Request
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={emptyState}>
                  <Clock size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                  <p>{loading ? "Fetching data..." : "No pending test requests found"}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* --- VIEW DETAILS MODAL --- */}
{showModal && selectedRequest && (
  <div style={modalOverlay} onClick={() => setShowModal(false)}>
    <div style={{ ...modalContent, width: '700px' }} onClick={e => e.stopPropagation()}>
      
      {/* HEADER: Dynamic Reference & Timestamp */}
      <div style={modalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '12px', color: '#16a34a' }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Requisition Order</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={metaBadge}>Ref: #LAB-{selectedRequest.id}</span>
              <span style={metaBadge}>
                Issued: {selectedRequest.requested_at ? new Date(selectedRequest.requested_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
      </div>

      <div style={modalBody}>
        
        {/* SECTION 1: LIVE PATIENT IDENTIFICATION */}
        <div style={sectionTitle}>
   <span>Patient Identification</span>
</div>
<div style={{ display: 'flex', gap: '16px', gridColumn: '1 / span 2', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', color: '#28a745', border: '1px solid #e2e8f0' }}>
    {selectedRequest.patient_name?.charAt(0) || 'P'}
  </div>
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{selectedRequest.patient_name}</div>
    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
      <div style={secondaryValue}>UHID: <span style={{ color: '#0f172a' }}>{selectedRequest.patient_id}</span></div>
      
      {/* VERIFY THIS LINE: It must use patient_gender and patient_age */}
      <div style={secondaryValue}>Gender/Age: 
        <span style={{ color: '#0f172a' }}>
          {selectedRequest.patient_gender || 'N/A'} / {selectedRequest.patient_age || '0'} Yrs
        </span>
      </div>
    </div>
  </div>
</div>

        {/* SECTION 2: LIVE CLINICAL CONTEXT */}
        <div style={{ ...infoBlock, marginTop: '8px' }}>
          <span style={labelStyle}>Requesting Physician</span>
          <span style={valueStyle}>Dr. {selectedRequest.doctor_name}</span>
          <span style={secondaryValue}>Dept: {selectedRequest.doctor_dept || 'General Medicine'}</span>
        </div>
        <div style={{ ...infoBlock, marginTop: '8px' }}>
          <span style={labelStyle}>Priority Level</span>
          <div style={{ marginTop: '4px' }}>
            <span style={selectedRequest.priority === 'Urgent' ? urgentBadge : normalBadge}>
              {selectedRequest.priority} Request
            </span>
          </div>
        </div>

        {/* SECTION 3: LIVE TEST SPECIFICATIONS */}
        <div style={fullWidthBlock}>
          <span style={labelStyle}>Primary Test Prescribed</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0d9488', margin: '8px 0' }}>
            {selectedRequest.test_name}
          </div>
          <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #ccfbf1', paddingTop: '12px', marginTop: '4px' }}>
            <div style={secondaryValue}>Sample Type: <span style={{ color: '#0d9488', fontWeight: '700' }}>{selectedRequest.sample_type || 'Required'}</span></div>
            <div style={secondaryValue}>Category: <span style={{ color: '#0d9488', fontWeight: '700' }}>{selectedRequest.category || 'Diagnostic'}</span></div>
          </div>
        </div>

        {/* SECTION 4: LIVE DOCTOR'S INSTRUCTIONS */}
        <div style={{ ...fullWidthBlock, background: '#fefce8', borderColor: '#fef08a' }}>
          <span style={{ ...labelStyle, color: '#a16207' }}>Clinical Notes & Instructions</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#854d0e', lineHeight: '1.6', fontWeight: '500' }}>
            {selectedRequest.notes || "No special clinical instructions provided by the ordering physician."}
          </p>
        </div>
      </div>

      {/* FOOTER: Professional Action Bar */}
      <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
          NexHealth LIS • Hospital ID: {sessionStorage.getItem('hospital_id')}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowModal(false)}
            style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => { handleAccept(selectedRequest.id); setShowModal(false); }}
            style={{ ...acceptButton, padding: '10px 24px' }}
          >
            <CheckCircle2 size={18} /> Accept & Start Collection
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TestRequests;