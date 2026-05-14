import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Clock } from 'lucide-react';
import PrescriptionCard from '../components/PrescriptionCard';

const MedicineDispensing = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReadyToDispense = async () => {
    setLoading(true);
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
      const token = sessionStorage.getItem('token');
      
      // PRODUCT LOGIC: Fetch only those who passed the 'Verification/Pricing' stage
      const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/pending/${hospitalId}`, {
        params: { status: "Ready-to-Dispense" }, // Filter for Stage 2
        headers: { Authorization: `Bearer ${token}` }
      });
      setReadyOrders(res.data);
    } catch (err) {
      console.error("Dispensing fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyToDispense();
  }, []);

  // Removes the card from the UI after it moves to the Billing stage
  const handleDispenseSuccess = (apptId) => {
    setReadyOrders(prev => prev.filter(order => order.appt_id !== apptId));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
          Dispensing Desk
        </h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>
          Final handover of medications to patients and move to billing.
        </p>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <p style={{ color: '#94a3b8' }}>Loading dispensing queue...</p>
        </div>
      ) : readyOrders.length > 0 ? (
        <div style={styles.grid}>
          {readyOrders.map(order => (
            <PrescriptionCard 
              key={order.appt_id} 
              order={order} 
              mode="dispense" // Configures card for Handover mode
              onVerifySuccess={() => handleDispenseSuccess(order.appt_id)}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#64748b', margin: 0 }}>Desk is Clear</h3>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>
            Patients will appear here once their prescriptions are priced and verified.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#f8fafc',
    borderRadius: '24px',
    border: '2px dashed #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default MedicineDispensing;