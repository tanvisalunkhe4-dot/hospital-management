import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Search, Eye, Clock, Users, Activity } from 'lucide-react';

const LabRecords = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState("all"); 
const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Ensure this endpoint matches your backend route
      const response = await axios.get('http://localhost:8000/api/v1/lab/reports/history');
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, color, title, value }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
      <div style={{ background: `${color}15`, padding: '12px', borderRadius: '10px' }}><Icon color={color} size={22}/></div>
      <div>
        <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>{title}</p>
        <h3 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: '700' }}>{value}</h3>
      </div>
    </div>
  );

const totalSent = history.length;
const recentTests = history.filter(r => {
  const date = new Date(r.requested_at);
  const now = new Date();
  return date.getMonth() === now.getMonth();
}).length;

  useEffect(() => { fetchHistory(); }, []);

  // Filter history based on search input
  const filteredRecords = history.filter(r => {
    const matchesSearch = r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.test_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTest = testTypeFilter === "all" || r.test_name === testTypeFilter;
    
    const recordDate = new Date(r.requested_at);
    const now = new Date();
    
    let matchesDate = true;
    if (dateFilter === "this_month") {
      matchesDate = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === "last_7_days") {
      // Calculate 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = recordDate >= sevenDaysAgo;
    }
    
    return matchesSearch && matchesTest && matchesDate;
  });

  return (
<div style={{ 
  padding: '24px', 
  paddingLeft: window.innerWidth > 768 ? '304px' : '24px', 
  background: '#f8fafc', 
  minHeight: '100vh' 
}}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Lab Records Archive</h3>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
  <StatCard icon={ClipboardList} color="#059669" title="Total Archived" value={totalSent} />
  <StatCard icon={Clock} color="#2563eb" title="Archived This Month" value={recentTests} />
</div>


<div style={{ 
  display: 'flex', 
  gap: '16px', 
  marginBottom: '24px', 
  alignItems: 'center', 
  flexWrap: 'wrap' 
}}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search by patient or test name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', 
            border: '1px solid #e2e8f0', outline: 'none' 
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '14px', flex: '0 0 auto' }}>
          <select 
    onChange={(e) => setTestTypeFilter(e.target.value)}
    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
  >
    <option value="all">All Test Types</option>
    {[...new Set(history.map(r => r.test_name))].map(name => (
      <option key={name} value={name}>{name}</option>
    ))}
  </select>

  <select 
    onChange={(e) => setDateFilter(e.target.value)}
    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
  >
    <option value="all">All Time</option>
    <option value="this_month">This Month</option>
    <option value="last_7_days">Last 7 Days</option> 
  </select>
</div>
</div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Patient</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Test Type</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Date Sent</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>Loading records...</td></tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{r.patient_name}</td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>{r.test_name}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{new Date(r.requested_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <button 
  onClick={() => setSelectedRecord(r)} // ADD THIS: This sets the state so the modal knows what to display
  style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto' }}
>
  <Eye size={14} /> View Result
</button>
                   
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records archived yet.</td></tr>
            )}
          </tbody>
        </table>
        {selectedRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{selectedRecord.test_name} Report</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Patient: <strong>{selectedRecord.patient_name}</strong></p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
  <p style={{ margin: '0 0 12px 0', fontWeight: '700' }}>Clinical Findings:</p>
  {(() => {
    const res = selectedRecord.test_results;
    // Check if it is a standard object that we can iterate over
    if (res !== null && typeof res === 'object' && !Array.isArray(res)) {
      return Object.entries(res).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
          <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
          <span style={{ fontWeight: '600' }}>
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ));
    }
    // Fallback: render as raw string if it's not an object
    return <p style={{ margin: 0 }}>{String(res ?? "No results available")}</p>;
  })()}

  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
    <p style={{ margin: '0 0 4px 0', fontWeight: '700' }}>Summary:</p>
    <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>{selectedRecord.result_summary}</p>
  </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button onClick={() => setSelectedRecord(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Close</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Print Report</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LabRecords;