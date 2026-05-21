import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, CheckCircle, Clock, Search } from 'lucide-react';
import PrescriptionCard from '../components/PrescriptionCard';

const PrescriptionQueue = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPendingPrescriptions = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const hospitalId = sessionStorage.getItem('hospital_id');
      
      // PRODUCT LOGIC: Query strictly for Stage 1 (Verification/Pricing)
      const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/pending/${hospitalId}`, {
        params: { status: "Pending-Pharmacy" }, 
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOrders(res.data);
    } catch (err) {
      console.error("Failed to load pharmacy queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  // Filter orders based on search input
  const filteredOrders = pendingOrders.filter(order => 
    order.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromQueue = (apptId) => {
    setPendingOrders(prev => prev.filter(order => order.appt_id !== apptId));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          {/* Aligned semantic header to distinctly differentiate from Handover Desk */}
          <h2 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>Verification & Pricing Desk</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Verify medication inventory and configure accurate itemized pricing summaries.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search Patient Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '14px' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredOrders.map((order) => (
          <PrescriptionCard 
            key={order.appt_id} 
            order={order} 
            mode="verify" // Explicitly lock card state behavior to Pricing Matrix input layouts
            onVerifySuccess={() => handleRemoveFromQueue(order.appt_id)} 
          />
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <Clock size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#64748b' }}>{searchQuery ? "No matches found" : "No pending prescriptions"}</h3>
          <p style={{ color: '#94a3b8' }}>Orders appear here once finalized by doctors.</p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionQueue;