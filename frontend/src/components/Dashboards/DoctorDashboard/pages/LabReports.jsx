import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, ExternalLink, Clock, CheckCircle2, 
  AlertCircle, FlaskConical, Download, Loader2, X 
} from 'lucide-react';
import axios from 'axios';

const LabReports = ({ patient }) => {
  const [reports, setReports] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");

  const pId = patient?.patient_id || patient?.id;
  const userData = JSON.parse(sessionStorage.getItem('user_data'));

  // FETCH 1: Patient-specific reports
  const fetchReports = async () => {
    if (!pId) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/doctor/patient/${pId}/lab-reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching lab reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH 2: Global Lab Catalog (The data you seeded)
  const fetchCatalog = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/doctor/lab-test-catalog`);
      setCatalog(response.data);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchCatalog();
  }, [pId]);

  // ACTION: Create new lab request
  const handleCreateRequest = async (test) => {
    try {
      const token = sessionStorage.getItem('token');
      const userData = JSON.parse(sessionStorage.getItem('user_data'));
      
      const payload = {
        patient_id: pId, // e.g., 17
        hospital_id: patient?.hospital_id || 1, 
        // FIX: Use the Staff Table ID (38), not the User Table ID (73)
        doctor_id: userData?.staff_record_id || 38, 
        test_name: test.test_name,
        category: test.category,
        priority: "Normal"
      };
  
      const response = await axios.post("http://localhost:8000/api/v1/doctor/lab-requests", payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (response.data.status === "success") {
        setShowModal(false);
        fetchReports(); // This refreshes the table so the new test appears!
      }
    } catch (error) {
      alert("Check that you are using the correct Staff ID from the database.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bg: '#ecfdf5', color: '#059669', icon: <CheckCircle2 size={16} /> };
      case 'pending': return { bg: '#fff7ed', color: '#d97706', icon: <Clock size={16} /> };
      case 'flagged': return { bg: '#fef2f2', color: '#dc2626', icon: <AlertCircle size={16} /> };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: <FileText size={16} /> };
    }
  };

  const filteredReports = reports.filter(r => r.test_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCatalog = catalog.filter(c => c.test_name?.toLowerCase().includes(catalogSearch.toLowerCase()));

  const styles = {
    container: { padding: '24px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '350px' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
    th: { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' },
    td: { padding: '16px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, borderRadius: '20px' },
    modal: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '500px', maxHeight: '80%', display: 'flex', flexDirection: 'column' },
    catalogItem: { padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' },
    badge: (status) => {
        const style = getStatusStyle(status);
        return {
          backgroundColor: style.bg,
          color: style.color,
          padding: '4px 12px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: '600'};
        }

    
  };

  return (
    <div style={styles.container}>
      {/* MODAL FOR CATALOG SELECTION */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Request New Test</h3>
              <X cursor="pointer" onClick={() => setShowModal(false)} />
            </div>
            <input 
              placeholder="Search catalog..." 
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}
              onChange={(e) => setCatalogSearch(e.target.value)}
            />
            <div style={{ overflowY: 'auto' }}>
              {filteredCatalog.map(test => (
                <div 
                  key={test.id} 
                  style={styles.catalogItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleCreateRequest(test)}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{test.test_name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{test.category}</div>
                  </div>
                  <Plus size={18} color="#10b981" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Laboratory Reports</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
  {patient 
    ? `Viewing history for ${patient.patient_name || (patient.first_name + ' ' + patient.last_name)} (ID: #${pId})` 
    : "Select a patient to view history"}
</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search history..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {pId && (
            <button 
              onClick={() => setShowModal(true)}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> New Request
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="animate-spin" color="#10b981" /></div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed #f1f5f9', borderRadius: '20px' }}>
            <FlaskConical size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>No reports found</h3>
            <button onClick={() => setShowModal(true)} style={{ color: '#10b981', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              + Create your first request for this patient
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
            <tr>
    {/* NEW COLUMN HEADER */}
    <th style={styles.th}>Patient</th> 
    <th style={styles.th}>Test Name</th>
    <th style={styles.th}>Requested Date</th>
    <th style={styles.th}>Category</th>
    <th style={styles.th}>Status</th>
    <th style={styles.th}>Actions</th>
  </tr>
            </thead>
            <tbody>
  {filteredReports.map((report) => (
    <tr key={report.id}>
      {/* 1. NEW IDENTIFICATION COLUMN */}
      <td style={styles.td}>
        <div style={{ fontWeight: '600', color: '#1e293b' }}>
          {/* This uses the 'patient_name' we added to the backend JOIN */}
          {report.patient_name || "Unknown Patient"}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          ID: #{pId}
        </div>
      </td>

      {/* 2. EXISTING TEST DETAILS */}
      <td style={styles.td}>
        <div style={{ fontWeight: '700', color: '#0f172a' }}>{report.test_name}</div>
      </td>

      <td style={styles.td}>
        {new Date(report.requested_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </td>

      <td style={styles.td}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{report.category}</span>
      </td>

      {/* 3. DYNAMIC STATUS BADGE */}
      <td style={styles.td}>
      <div style={styles.badge(report.status)}>
          {getStatusStyle(report.status).icon} 
          {report.status}
        </div>
      </td>

      {/* 4. ACTIONS */}
      <td style={styles.td}>
        <button 
          title="View Results"
          style={{ padding: '8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
        >
          <ExternalLink size={16} color="#3b82f6" />
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LabReports;