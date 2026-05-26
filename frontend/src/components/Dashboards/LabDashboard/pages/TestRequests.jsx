import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, Clock, Search, Beaker, User, ShieldCheck, XCircle} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
const containerStyle = { 
  padding: '32px', 
  maxWidth: '1400px', 
  marginLeft: '280px', 
  width: 'calc(100% - 280px)', 
  boxSizing: 'border-box'
};const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' };
const subtitleStyle = { fontSize: '14px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' };
const searchWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '16px', color: '#94a3b8' };
const searchInput = { 
  padding: '14px 16px 14px 48px', 
  borderRadius: '16px', 
  border: '1px solid #e2e8f0', 
  width: '380px', 
  fontSize: '14px',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  outline: 'none'
};

const tableContainer = { backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };const headerRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thStyle = { textAlign: 'left', padding: '20px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' };
const tdStyle = { padding: '20px 24px', verticalAlign: 'middle' };const trStyle = { borderBottom: '1px solid #f8fafc' }; // Added missing trStyle
const doctorAvatar = { width: '36px', height: '36px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', border: '1px solid #dbeafe' };
const testBadge = { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', border: '1px solid #dcfce7' };

const urgentBadge = { color: '#ef4444', backgroundColor: '#fef2f2', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '1px solid #fee2e2' };
const normalBadge = { color: '#6366f1', backgroundColor: '#eef2ff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '1px solid #e0e7ff' };

const acceptButton = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' };
const rejectButton = { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' };
const actionGroup = { display: 'flex', gap: '8px' };
const viewButton = { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' };
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

const getPriorityDot = (priority) => {
  const p = (priority || "").toLowerCase();
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: p === 'urgent' ? '#ef4444' : (p === 'high' ? '#f59e0b' : '#6366f1'),
    display: 'inline-block',
    marginRight: '8px'
  };
};

const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case 'Urgent':
      return { color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' };
    case 'High':
      return { color: '#b45309', bg: '#fffbeb', border: '#fde68a' };
    case 'Normal':
    default:
      return { color: '#6366f1', bg: '#eef2ff', border: '#e0e7ff' };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }; // Orange
    case 'Accepted': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' }; // Blue
    case 'Collected': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' }; // Green
    default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
};

const TestRequests = ({ setActiveTab }) => { // Add setActiveTab here
 
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState("");
  const specimenOptions = ["Venous Blood", "Capillary Blood", "Urine", "Swab", "Sputum", "Serum", "CSF"];
  const [viewMode, setViewMode] = useState(false); 
  const [priorityFilter, setPriorityFilter] = useState("All"); // All, Urgent, Normal

  const handleOpenModal = (req, isViewOnly = false) => {
    setSelectedRequest(req);
    setSelectedSample(""); 
    setViewMode(isViewOnly);
    setShowModal(true);
  };

  useEffect(() => {
    let isMounted = true;
    fetchRequests().then(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/pending/${hospitalId}`);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatIST = (dateString, type = 'full') => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    if (type === 'date') {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
      });
    }
    if (type === 'time') {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
      });
    }
    // Default 'full' format
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
    });
  };


  const handleAccept = async (requestId, sampleType) => {
    if (!sampleType) {
        alert("Please select a specimen type first.");
        return;
    }
    
    try {
      // API call to update status to 'accepted' and save specimen type
      const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/accept`, {
        sample_type: sampleType
      });
      
      if (response.status === 200) {
        // 1. Remove the item from the local 'Test Requests' list
        setRequests(prev => prev.filter(r => r.id !== requestId));
        
        // 2. Close the handshake modal
        setShowModal(false);
        
        // 3. IMPORTANT: Update the Parent State 
        // This ensures LabDashboard switches the view to SampleCollection.jsx
        if (setActiveTab) {
            setActiveTab('samples'); 
        }
        
        // 4. Update the Browser URL
        // Using '/samples' to match your Sidebar's menuItems path
        navigate('/lab-dashboard/samples'); 
      }
    } catch (error) {
      console.error("Acceptance Error:", error);
      alert(error.response?.data?.detail || "Failed to accept request. Please check backend connection.");
    }
};


const handleReject = async (requestId) => {
  if (!window.confirm("Are you sure you want to reject this laboratory request?")) {
    return;
  }

  try {
    const response = await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/reject`);
    if (response.status === 200) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
      alert("Request successfully rejected.");
    }
  } catch (error) {
    console.error("Rejection Error:", error);
    alert(error.response?.data?.detail || "Failed to reject request.");
  }
};

const filteredRequests = requests.filter(req => {
  const matchesSearch = req.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        req.patient_id?.toString().includes(searchQuery);
  const matchesPriority = priorityFilter === "All" || 
                          (req.priority || "Normal").toLowerCase() === priorityFilter.toLowerCase();
  
  return matchesSearch && matchesPriority;
});

  return (
    <div style={containerStyle}>
      <style>{`
        tr { transition: all 0.2s ease; border-bottom: 1px solid #f1f5f9; }
        tr:hover { background-color: #f8fafc !important; transform: scale(1.002); }
        .pulse-icon { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse-red 2s infinite; }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0); } }
        .search-input:focus { border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important; }
        .specimen-select:focus { border-color: #10b981 !important; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
      `}</style>

      {/* --- HEADER SECTION --- */}
      <div style={{ ...headerSection, alignItems: 'center' }}>
  {/* Left Side */}
  <div>
    <h2 style={titleStyle}>Laboratory Queue</h2>
    <div style={subtitleStyle}>
      <div className="pulse-icon"></div>
      <span>{filteredRequests.length} Pending requisitions</span>
    </div>
  </div>

  {/* Right Side: Search + Filter */}
  <div style={{ display: 'flex', gap: '12px' }}>
    <select 
      style={{ ...searchInput, width: '150px', padding: '14px' }}
      onChange={(e) => setPriorityFilter(e.target.value)}
    >
      <option value="All">All Priority</option>
      <option value="Urgent">Urgent</option>
      <option value="Normal">Normal</option>
    </select>
    
    <div style={searchWrapper}>
      <Search size={18} style={searchIcon} />
      <input 
        type="text" 
        placeholder="Search..." 
        style={searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>
</div>
      

      {/* --- QUEUE TABLE --- */}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr>
            <th style={thStyle}>Patient Metadata</th>
              <th style={thStyle}>Test Profile</th>
              <th style={thStyle}>Requesting Source</th>
              <th style={thStyle}>Status</th> 
              <th style={thStyle}>Priority</th>       {/* Matches Cell 5 */}
              <th style={thStyle}>Request Date</th>   {/* Matches Cell 6 */}
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
              <tr key={req.id}>
                {/* Cell 1: Patient Metadata */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{req.patient_name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>UHID: {req.patient_id}</div>
                    </div>
                  </div>
                </td>
                {/* Cell 2: Test Profile */}
                <td style={tdStyle}>
                  <div style={testBadge}>{req.test_name}</div>
                </td>

                {/* Cell 3: Requesting Source */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={doctorAvatar}>
                      {req.doctor_name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Dr. {req.doctor_name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{req.doctor_dept || 'OPD'}</div>
                    </div>
                  </div>
                </td>
                {/* Cell 4: Status */}
                <td style={tdStyle}>
  {(() => {
    const colors = getStatusStyle(req.status || 'Pending');
    return (
      <span style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'inline-block'
      }}>
        {req.status || 'Pending'}
      </span>
    );
  })()}
</td>

{/* Cell 5: Dynamic Priority Badge */}
<td style={tdStyle}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={getPriorityDot(req.priority)}></span>
    
    {(() => {
      const raw = (req.priority || "Normal").toLowerCase();
      // CHANGE: Use .toUpperCase() here for the display text
      const displayPriority = raw.toUpperCase(); 
      
      // Use the normalized 'raw' value for the style lookup
      const pStyle = getPriorityBadgeStyle(raw.charAt(0).toUpperCase() + raw.slice(1)); 
      
      return (
        <span style={{
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '800',
          color: pStyle.color,
          backgroundColor: pStyle.bg,
          border: `1px solid ${pStyle.border}`
        }}>
          {displayPriority} 
        </span>
      );
    })()}
  </div>
</td>
               {/* Cell 6: Request Date (Aligned to Request Date Header) */}
               <td style={tdStyle}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
      {formatIST(req.requested_at, 'date')}
    </div>
    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
      {formatIST(req.requested_at, 'time')}
    </div>
  </div>
</td>

                {/* Cell 7: Actions */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      style={{ ...viewButton, padding: '10px' }} 
                      onClick={() => handleOpenModal(req, true)} 
                    >
                      <Eye size={18} />
                    </button>

                    <button 
                      className="action-btn"
                      style={rejectButton}
                      onClick={() => handleReject(req.id)}
                      title="Reject Request"
                    >
                      <XCircle size={15} /> <span style={{ fontSize: '12px' }}>Reject</span>
                    </button>
                    <button 
                      onClick={() => handleOpenModal(req, false)} 
                      style={acceptButton}
                    >
                      <CheckCircle2 size={16} /> Accept
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '120px', color: '#94a3b8' }}>
                  <Beaker size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>
                    {loading ? "Refreshing Lab Queue..." : "All requests have been processed."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     {/* --- SPECIMEN COLLECTION MODAL --- */}
     {showModal && selectedRequest && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{ ...modalContent, width: '700px' }} onClick={e => e.stopPropagation()}>
            
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '12px', color: '#16a34a' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Collection Handshake</h3>
  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
    <span style={metaBadge}>Ref: #LAB-{selectedRequest.id}</span>
    <span style={
  (selectedRequest.priority || "").toLowerCase() === 'urgent' ? urgentBadge : normalBadge
}>
  {(selectedRequest.priority || "Normal").toUpperCase()}
</span>
    {/* ADDED: Visual confirmation of the Barcode/Accession ID */}
    {selectedRequest.accession_number && (
      <span style={{ ...metaBadge, color: '#10b981', borderColor: '#10b981', background: '#f0fdf4' }}>
        LIS ID: {selectedRequest.accession_number}
      </span>
    )}

<span style={metaBadge}>
  {formatIST(selectedRequest.requested_at, 'full')}
</span>
  </div>
</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={modalBody}>
  {/* --- SECTION 1: PATIENT IDENTIFICATION --- */}
  <div style={sectionTitle}>
    <span>Verified Patient Identification</span>
  </div>
  <div style={{ display: 'flex', gap: '16px', gridColumn: '1 / span 2', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '24px', color: '#28a745', border: '1px solid #e2e8f0' }}>
      {selectedRequest.patient_name?.charAt(0)}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedRequest.patient_name}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
        <span style={
  (selectedRequest.priority || "").toLowerCase() === 'urgent' ? urgentBadge : normalBadge
}>
  {(selectedRequest.priority || "Normal").toUpperCase()}
</span>
         <span style={{ ...metaBadge, background: '#fff' }}>{selectedRequest.patient_type || 'OPD'}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
        <div style={secondaryValue}>UHID: <b style={{ color: '#0f172a' }}>{selectedRequest.patient_id}</b></div>
        <div style={secondaryValue}>Age/Sex: <b style={{ color: '#0f172a' }}>{selectedRequest.patient_age}Y / {selectedRequest.patient_gender}</b></div>
        <div style={secondaryValue}>Phone: <b style={{ color: '#0f172a' }}>{selectedRequest.patient_phone || 'N/A'}</b></div>
      </div>
    </div>
  </div>

  {/* --- SECTION 2: ORDERING SOURCE (THE DOCTOR) --- */}
  <div style={sectionTitle}>
    <span>Prescribing Authority</span>
  </div>
  <div style={{ display: 'flex', gap: '12px', gridColumn: '1 / span 2', alignItems: 'center', padding: '0 8px' }}>
    <div style={{ ...doctorAvatar, width: '40px', height: '40px' }}>
      {selectedRequest.doctor_name?.split(' ').map(n => n[0]).join('')}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>Dr. {selectedRequest.doctor_name}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
  {selectedRequest.doctor_dept} • Requested {formatIST(selectedRequest.requested_at, 'time')}
</div>
    </div>
    <button style={{ ...viewButton, fontSize: '11px', fontWeight: '700', padding: '6px 12px' }}>Contact Physician</button>
  </div>

  {/* --- SECTION 3: INVESTIGATION & SPECIMEN --- */}
  <div style={{ ...fullWidthBlock, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div>
        <span style={labelStyle}>Order Detail</span>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#115e59' }}>{selectedRequest.test_name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={labelStyle}>Required Vial</span>
        <div style={{ background: '#a855f7', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', marginTop: '4px' }}>
          Lavender (EDTA)
        </div>
      </div>
    </div>

    {!viewMode ? (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #bbf7d0', paddingTop: '16px' }}>
      <div>
        <label style={labelStyle}>Verify Specimen</label>
        <select 
          className="specimen-select"
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0', background: 'white', fontSize: '13px', fontWeight: '600' }}
        >
          <option value="">Select specimen...</option>
          {specimenOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Collection Site</label>
        <select style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0', background: 'white', fontSize: '13px', fontWeight: '600' }}>
          <option>Left Arm (Anticubital)</option>
          <option>Right Arm (Anticubital)</option>
          <option>Hand Vein</option>
          <option>Not Applicable</option>
        </select>
      </div>
    </div>
  ) : (
    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', border: '1px dashed #10b981', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
        Preview Mode: Acceptance required to log specimen details.
      </p>
    </div>
  )}
</div>

  {/* --- SECTION 4: CLINICAL NOTES & FASTING --- */}
  <div style={{ ...fullWidthBlock, background: '#fffbeb', borderColor: '#fef3c7' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...labelStyle, color: '#92400e' }}>Clinical Notes</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" id="fasting" />
            <label htmlFor="fasting" style={{ fontSize: '11px', fontWeight: '700', color: '#92400e' }}>Patient Fasted?</label>
        </div>
    </div>
    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#b45309', lineHeight: '1.5', fontWeight: '500' }}>
      {selectedRequest.notes || "No special instructions provided by the physician."}
    </p>
  </div>
</div>

            {/* ACTION FOOTER */}
            <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div style={secondaryValue}>
    LIS Node: {sessionStorage.getItem('hospital_id') || 'STATION_01'}
  </div>
  <div style={{ display: 'flex', gap: '12px' }}>
    <button 
      onClick={() => setShowModal(false)}
      style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
    >
      {viewMode ? "Close Preview" : "Cancel"}
    </button>

    {/* CHANGE: Only show the Confirm button if NOT in viewMode */}
    {!viewMode && (
      <button 
        disabled={!selectedSample}
        onClick={() => handleAccept(selectedRequest.id, selectedSample)}
        style={{ 
          ...acceptButton, 
          padding: '10px 24px',
          opacity: selectedSample ? 1 : 0.5,
          cursor: selectedSample ? 'pointer' : 'not-allowed'
        }}
      >
        <CheckCircle2 size={18} /> Confirm & Accept
      </button>
    )}
  </div>
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRequests;