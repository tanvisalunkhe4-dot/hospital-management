import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestRequests = () => {
  const [requests, setRequests] = useState([]);

  // Fetch requests from your FastAPI backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/lab/requests', {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        setRequests(res.data);
      } catch (err) { console.error("Error fetching lab requests", err); }
    };
    fetchRequests();
  }, []);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Pending Test Requests</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
            <th style={{ padding: '12px' }}>Patient</th>
            <th>Test Required</th>
            <th>Ordered By</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px' }}>{req.patient_name}</td>
              <td>{req.test_name}</td>
              <td>Dr. {req.doctor_name}</td>
              <td><span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px' }}>{req.status}</span></td>
              <td><button style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestRequests;