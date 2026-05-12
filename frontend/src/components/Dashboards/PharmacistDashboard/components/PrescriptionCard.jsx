import React, { useState, useEffect } from 'react';
import { User, CheckCircle, IndianRupee, XCircle, Info, Hash } from 'lucide-react';
import axios from 'axios';

const PrescriptionCard = ({ order, onVerifySuccess }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 1. Live Data Initialization: Use database values if they exist
  const [meds, setMeds] = useState(
    order.prescriptions.map(m => ({
      ...m,
      is_available: m.is_available ?? true, // Use DB value or default to true
      price: m.price || 0 // Use DB price if already set by catalog
    }))
  );

  const toggleAvailability = (index) => {
    const updated = [...meds];
    updated[index].is_available = !updated[index].is_available;
    setMeds(updated);
  };

  const handlePriceChange = (index, value) => {
    const updated = [...meds];
    updated[index].price = parseFloat(value) || 0;
    setMeds(updated);
  };

  const totalAmount = meds
    .filter(m => m.is_available)
    .reduce((acc, curr) => acc + curr.price, 0);

  const handleVerify = async () => {
    if (totalAmount === 0 && meds.some(m => m.is_available)) {
      alert("Please enter prices for available medications.");
      return;
    }

    setIsVerifying(true);
    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        medicines: meds.map(m => ({
          id: m.id,
          price: m.price,
          is_available: m.is_available
        }))
      };

      await axios.patch(
        `http://localhost:8000/api/v1/pharmacy/verify/${order.appt_id}`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onVerifySuccess();
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '20px', 
      border: '1px solid #f1f5f9', 
      overflow: 'hidden', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)',
      transition: 'transform 0.2s ease'
    }}>
      {/* Top Identity Bar */}
      <div style={{ padding: '20px', background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <User size={20} color="#10b981" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{order.patient_name}</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Hash size={10} /> {order.appt_id}
                </span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{order.time}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', 
              fontSize: '11px', fontWeight: '600', color: '#475569' 
            }}>
              Pharmacy Pending
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Prescription List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {meds.map((med, idx) => (
            <div key={idx} style={{ 
              padding: '16px', 
              borderRadius: '16px',
              background: med.is_available ? '#ffffff' : '#fff1f2',
              border: `1px solid ${med.is_available ? '#e2e8f0' : '#fecaca'}`,
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ opacity: med.is_available ? 1 : 0.6 }}>
                  <p style={{ 
                    margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b',
                    textDecoration: med.is_available ? 'none' : 'line-through' 
                  }}>
                    {med.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
                
                {/* Inside your meds.map loop */}
<button 
  onClick={() => toggleAvailability(idx)}
  style={{ 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = med.is_available ? '#f0fdf4' : '#fff1f2'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
  {med.is_available ? (
    <CheckCircle size={22} color="#10b981" /> 
  ) : (
    <XCircle size={22} color="#ef4444" />
  )}
</button>
              </div>

              {med.is_available && (
                <div style={{ 
                  marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                  paddingTop: '12px', borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    background: '#f8fafc', padding: '6px 12px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', width: '120px'
                  }}>
                    <IndianRupee size={12} color="#64748b" />
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={med.price || ""}
                      onChange={(e) => handlePriceChange(idx, e.target.value)}
                      style={{ 
                        border: 'none', background: 'transparent', outline: 'none', 
                        fontSize: '13px', width: '100%', fontWeight: '700', color: '#0f172a' 
                      }}
                    />
                  </div>
                  {med.instructions && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                      <Info size={12} />
                      <span style={{ fontSize: '11px' }}>{med.instructions}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Est. Medication Total
              </p>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              Final bill generated at reception
            </p>
          </div>

          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              background: isVerifying ? '#94a3b8' : '#10b981', 
              color: 'white', fontWeight: '700', fontSize: '15px',
              cursor: isVerifying ? 'not-allowed' : 'pointer',
              boxShadow: isVerifying ? 'none' : '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
          >
            {isVerifying ? "Updating Registry..." : "Finalize & Send to Billing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;