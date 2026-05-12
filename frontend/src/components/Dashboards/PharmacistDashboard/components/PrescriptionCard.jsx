import React, { useState } from 'react';
import { Pill, User, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const PrescriptionCard = ({ order, onVerifySuccess }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const token = sessionStorage.getItem('token');
      // Update status to 'Pending-Billing'
      await axios.patch(`http://localhost:8000/api/v1/pharmacy/verify/${order.appt_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onVerifySuccess(); // Tell parent to remove this card
    } catch (err) {
      console.error("Dispensing failed", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#16a34a" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{order.patient_name}</h4>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Appt ID: #{order.appt_id}</span>
          </div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>{order.timestamp}</span>
      </div>

      <div style={{ padding: '16px' }}>
        <h5 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Prescribed Medicines</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {order.prescriptions.map((med, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#fdfdfd', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{med.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{med.dosage} • {med.frequency}</p>
              </div>
              <Pill size={14} color="#10b981" />
            </div>
          ))}
        </div>

        <button 
          onClick={handleVerify}
          disabled={isVerifying}
          style={{ 
            width: '100%', 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: isVerifying ? '#94a3b8' : '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            fontWeight: '700', 
            cursor: isVerifying ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {isVerifying ? "Processing..." : <><CheckCircle size={18} /> Mark as Prepared</>}
        </button>
      </div>
    </div>
  );
};

export default PrescriptionCard;