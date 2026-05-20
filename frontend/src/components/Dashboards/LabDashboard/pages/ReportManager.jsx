import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, FileCheck, ClipboardList, Clock, CheckCircle2, Send, FileUp, Eye } from 'lucide-react';
import axios from 'axios';
import ReportView from '../components/ReportView';

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ 
    background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', 
    display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
  }}>
    <div style={{ padding: '12px', borderRadius: '12px', background: `${color}10`, color: color }}>{icon}</div>
    <div>
      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <h4 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{value}</h4>
    </div>
  </div>
);

const ReportManager = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewReport, setPreviewReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/lab/reports/list');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) { console.error("Error:", err); setReports([]); }
    finally { setLoading(false); }
  };



  const handleFileUpload = async (file, reportId) => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the key your Python backend expects
  
    try {
      setLoading(true); // Optional: show loading state
      const token = sessionStorage.getItem('token');
      
      await axios.post(`http://localhost:8000/api/v1/lab/reports/${reportId}/upload`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
  
      alert("File uploaded successfully!");
      fetchReports(); // Refresh the list to update status to "Verified"
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };


  const handleSendToDoctor = async (reportId) => {
    if (!confirm("Confirm sending report to the referring physician?")) return;
    try {
      await axios.post(`http://localhost:8000/api/v1/lab/requests/${reportId}/send-to-doctor`);
      alert("Report sent successfully.");
      fetchReports();
    } catch (err) { alert(err.response?.data?.detail || "Failed to send."); }
  };

  useEffect(() => { fetchReports(); }, []);

  const btnStyle = (bg, color, border = 'none') => ({
    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
    borderRadius: '6px', border: border, background: bg, color: color,
    cursor: 'pointer', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s'
  });

  return (
    <div style={{ 
      padding: '24px', 
      paddingLeft: '304px',
      width: '100%', 
      boxSizing: 'border-box', 
      background: '#f8fafc',
      minHeight: '100vh'
    
    }}>
      {previewReport ? (
        <ReportView sampleId={previewReport} onClose={() => setPreviewReport(null)} />
      ) : (
        <>
          {/* KPI Section - Now adapts to full width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <StatCard title="Total Finalized" value={reports.length} icon={<ClipboardList size={20}/>} color="#3b82f6" />
            <StatCard title="Pending Uploads" value={reports.filter(r => !r.report_file_url).length} icon={<Activity size={20}/>} color="#f59e0b" />
            <StatCard title="Verified Reports" value={reports.filter(r => r.report_file_url).length} icon={<FileCheck size={20}/>} color="#10b981" />
          </div>
  
          {/* Header - Aligned to full width */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Laboratory Reports</h3>
            <button onClick={fetchReports} style={btnStyle('white', '#475569', '1px solid #e2e8f0')}>
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>
  
          {/* Data Table Container - Now spans full available width */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            overflow: 'hidden' 
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
      <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Patient</th>
      <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Test Type</th>
      <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>View</th>
      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Upload</th>
      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Send</th>
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading reports...</td></tr>
    ) : reports.length > 0 ? (
      reports.map((report) => (
        <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{report.patient_name}</td>
          <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{report.test_name}</td>
          <td style={{ padding: '16px 20px' }}>
            <span style={{ 
              fontSize: '10px', padding: '4px 10px', borderRadius: '12px', fontWeight: '700',
              background: report.report_file_url ? '#f0fdf4' : '#fff7ed', 
              color: report.report_file_url ? '#166534' : '#9a3412',
              textTransform: 'uppercase'
            }}>
              {report.report_file_url ? 'Verified' : 'Pending'}
            </span>
          </td>
          {/* Three separate columns for the buttons */}
          {/* View Button */}
<td style={{ padding: '16px 20px', textAlign: 'center' }}>
  <button 
    onClick={() => setPreviewReport(report.id)} 
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
      borderRadius: '6px', border: '1px solid #3b82f6', background: 'transparent', 
      color: '#3b82f6', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
    }}
  >
    <Eye size={14}/> View
  </button>
</td>

{/* Upload Button */}
<td style={{ padding: '16px 20px', textAlign: 'center' }}>
  {/* Hidden input to trigger file selection */}
  <input 
    type="file" 
    id={`fileInput-${report.id}`} 
    style={{ display: 'none' }} 
    onChange={(e) => handleFileUpload(e.target.files[0], report.id)}
  />
  <button 
    onClick={() => document.getElementById(`fileInput-${report.id}`).click()} 
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
      borderRadius: '6px', border: '1px solid #64748b', background: 'transparent', 
      color: '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
    }}
  >
    <FileUp size={14}/> Upload
  </button>
</td>

{/* Send Button */}
<td style={{ padding: '16px 20px', textAlign: 'center' }}>
  <button 
    onClick={() => handleSendToDoctor(report.id)} 
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
      borderRadius: '6px', border: '1px solid #10b981', background: 'transparent', 
      color: '#10b981', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
    }}
  >
    <Send size={14}/> Send
  </button>
</td>
        </tr>
      ))
    ) : (
      <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>No records found.</td></tr>
    )}
  </tbody>
</table>          </div>
        </>
      )}
    </div>
  );
};

export default ReportManager;