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

const TestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
      if (!hospitalId) return;
  
      const response = await axios.get(`http://localhost:8000/api/v1/lab/requests/pending/${hospitalId}`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching lab requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`http://localhost:8000/api/v1/lab/requests/${requestId}/accept`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      alert("Failed to accept request");
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
                    <button style={viewButton} title="View Details">
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
    </div>
  );
};

export default TestRequests;