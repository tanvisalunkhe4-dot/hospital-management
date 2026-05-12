import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, ExternalLink, Clock, CheckCircle2, 
  AlertCircle, FlaskConical, Download, Loader2, X, ArrowLeft, Check
} from 'lucide-react';
import axios from 'axios';

const LabReports = ({ patient, onBack }) => {
  const [reports, setReports] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Feedback for the doctor
  
  const [newlyAddedTests, setNewlyAddedTests] = useState([]);
  const pId = patient?.patient_id || patient?.id;

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

  const handleCreateRequest = async (test) => {
    try {
      const token = sessionStorage.getItem('token');
      const userData = JSON.parse(sessionStorage.getItem('user_data'));
      
      const payload = {
        patient_id: pId,
        hospital_id: patient?.hospital_id || 1, 
        doctor_id: userData?.staff_record_id || 38, 
        test_name: test.test_name,
        category: test.category,
        priority: "Normal"
      };
  
      const response = await axios.post("http://localhost:8000/api/v1/doctor/lab-requests", payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (response.data.status === "success") {
        setSuccessMessage(`${test.test_name} requested successfully!`);
        setShowModal(false);
        // Replace the line where you update newlyAddedTests:
setNewlyAddedTests(prev => {
  if (prev.includes(test.test_name)) return prev; // Don't add duplicates
  return [...prev, test.test_name];
});
        fetchReports(); 
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Request Error:", error);
      alert("Session expired or invalid Staff ID. Please check your credentials.");
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
    container: { padding: '24px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '350px' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
    th: { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' },
    td: { padding: '16px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', width: '500px', maxHeight: '80%', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    toast: { position: 'fixed', top: '24px', right: '24px', backgroundColor: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000, animation: 'slideIn 0.3s ease-out' },
    badge: (status) => {
      const style = getStatusStyle(status);
      return { backgroundColor: style.bg, color: style.color, padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' };
    }
  };

  return (
    <div style={styles.container}>
      {/* SUCCESS TOAST */}
      {successMessage && (
        <div style={styles.toast}>
          <Check size={20} />
          <span style={{ fontWeight: '600' }}>{successMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BACK */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => onBack(newlyAddedTests)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Back to Consultation
        </button>
      </div>

      {/* MODAL FOR CATALOG SELECTION */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Request Lab Test</h3>
              <div onClick={() => setShowModal(false)} style={{ cursor: 'pointer', padding: '6px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}>
                <X size={18} color="#64748b" />
              </div>
            </div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                placeholder="Search catalog (MRI, CBC, Blood...)" 
                style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', outline: 'none' }}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
  {filteredCatalog.map(test => {
    // Check if this specific test has already been added in the current session
    const isAlreadyAdded = newlyAddedTests.includes(test.test_name);

    return (
      <div 
        key={test.id} 
        style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          border: '1px solid #f1f5f9', 
          marginBottom: '8px', 
          cursor: isAlreadyAdded ? 'default' : 'pointer', // Change cursor if already added
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: isAlreadyAdded ? '#f0fdf4' : 'white', // Light green background if selected
          transition: 'all 0.2s ease'
        }}
        onClick={() => !isAlreadyAdded && handleCreateRequest(test)} // Prevent re-clicking if added
      >
        <div>
          <div style={{ 
            fontWeight: '600', 
            color: isAlreadyAdded ? '#166534' : '#1e293b' 
          }}>
            {test.test_name}
          </div>
          <div style={{ fontSize: '12px', color: isAlreadyAdded ? '#10b981' : '#94a3b8' }}>
            {test.category}
          </div>
        </div>

        {/* Dynamic Icon: Show a Checkmark if added, otherwise a Plus */}
        {isAlreadyAdded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: '700' }}>
            <Check size={16} /> Added
          </div>
        ) : (
          <Plus size={18} color="#10b981" />
        )}
      </div>
    );
  })}
</div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800', fontSize: '24px' }}>Laboratory Records</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            {patient ? `Patient: ${patient.patient_name || (patient.first_name + ' ' + patient.last_name)}` : "Loading patient history..."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Filter history..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> New Request
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="animate-spin" color="#10b981" /></div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed #f1f5f9', borderRadius: '24px' }}>
            <FlaskConical size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>No previous lab records</h3>
            <button onClick={() => setShowModal(true)} style={{ color: '#10b981', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
              + Order First Lab Test
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Test Details</th>
                <th style={styles.th}>Requested</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{report.test_name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ref: #{report.id}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(report.requested_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{report.category}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.badge(report.status)}>
                      {getStatusStyle(report.status).icon} 
                      {report.status}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button style={{ padding: '8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}>
                      <ExternalLink size={16} color="#3b82f6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FINISH SELECTION & RETURN */}
      {newlyAddedTests.length > 0 && (
        <div style={{ padding: '16px 0', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => onBack(newlyAddedTests)}
            style={{ padding: '14px 28px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
          >
            <CheckCircle2 size={20} /> Finish Selection & Return
          </button>
        </div>
      )}
    </div>
  );
};

export default LabReports;