import React, { useState } from 'react';
import { User, CheckCircle, IndianRupee, XCircle, Hash, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const PrescriptionCard = ({ order, onVerifySuccess, mode = "verify" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [meds, setMeds] = useState(
    order.prescriptions.map(m => ({
      ...m,
      is_available: m.is_out_of_stock ? false : (m.is_available ?? true),
      price: m.price || 0,
      quantity: m.quantity || 1
    }))
  );

  const toggleAvailability = (index) => {
    if (mode === "dispense") return; 
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
    .reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const handleAction = async () => {
    if (mode === "verify" && totalAmount === 0 && meds.some(m => m.is_available)) {
      alert("Please enter prices for available medications.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = sessionStorage.getItem('token');
      
      // FIXED STATE DIRECTIONAL FLOW VALUES
      const nextStatus = mode === "verify" ? "Ready-to-Dispense" : "Pharmacy-Verified";

      const payload = {
        status: nextStatus,
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
      console.error("Action failed", err);
      alert("Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={styles.iconBadge}>
              {mode === "verify" ? <User size={20} color="#10b981" /> : <ShoppingBag size={20} color="#3b82f6" />}
            </div>
            <div>
              <h4 style={styles.patientName}>{order.patient_name}</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span style={styles.subText}><Hash size={10} /> {order.appt_id}</span>
                <span style={styles.dot}></span>
                <span style={styles.subText}>{order.time}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.stageBadge}>
              {mode === "verify" ? "Pricing Queue" : "Ready to Dispense"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {meds.map((med, idx) => (
            <div key={idx} style={{ 
              ...styles.medItem,
              background: med.is_available ? '#ffffff' : '#fff1f2',
              border: `1px solid ${med.is_available ? '#e2e8f0' : '#fecaca'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ opacity: med.is_available ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ ...styles.medName, textDecoration: med.is_available ? 'none' : 'line-through' }}>
                      {med.medicine_name || med.name}
                    </p>
                    {med.is_out_of_stock && (
                      <span style={styles.outOfStockBadge}>
                         OUT OF STOCK ({med.current_inventory} LEFT)
                      </span>
                    )}
                  </div>
                  <p style={styles.medDetails}>
                    {med.dosage} • {med.frequency} • <b>Qty: {med.quantity}</b>
                  </p>
                </div>
                
                <button 
                  onClick={() => toggleAvailability(idx)}
                  style={{ ...styles.toggleBtn, cursor: mode === "verify" ? 'pointer' : 'default' }}
                  disabled={mode === "dispense"}
                >
                  {med.is_available ? <CheckCircle size={22} color="#10b981" /> : <XCircle size={22} color="#ef4444" />}
                </button>
              </div>

              {med.is_available && (
                <div style={styles.priceSection}>
                  <div style={styles.inputWrapper}>
                    <IndianRupee size={12} color="#64748b" />
                    {mode === "verify" ? (
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={med.price || ""}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        disabled={med.is_out_of_stock}
                        style={{
                          ...styles.priceInput,
                          cursor: med.is_out_of_stock ? 'not-allowed' : 'text',
                          opacity: med.is_out_of_stock ? 0.5 : 1
                        }}
                      />
                    ) : (
                      <span style={styles.fixedPrice}>{med.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div style={styles.subtotalText}>
                    Total: ₹{(med.price * med.quantity).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={styles.totalRow}>
            <div>
              <p style={styles.totalLabel}>Estimated Total</p>
              <h2 style={styles.totalAmount}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <p style={styles.disclaimer}>
              {mode === "verify" ? "Finalize for Dispensing" : "Proceed to Billing"}
            </p>
          </div>

          <button 
            onClick={handleAction}
            disabled={isProcessing}
            style={{ 
              ...styles.mainBtn,
              background: isProcessing ? '#94a3b8' : (mode === "verify" ? '#10b981' : '#3b82f6'),
            }}
          >
            {isProcessing ? "Processing..." : (mode === "verify" ? "Confirm Pricing" : "Handover & Finalize")}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  header: { padding: '20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' },
  iconBadge: { width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  patientName: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  subText: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' },
  stageBadge: { padding: '4px 10px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#475569' },
  medItem: { padding: '16px', borderRadius: '16px', transition: 'all 0.2s ease' },
  medName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  medDetails: { margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' },
  outOfStockBadge: { background: '#fff1f2', border: '1px solid #fda4af', color: '#e11d48', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' },
  toggleBtn: { background: 'none', border: 'none', padding: '4px', display: 'flex' },
  priceSection: { marginTop: '12px', display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' },
  inputWrapper: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '110px' },
  priceInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', fontWeight: '700', color: '#0f172a' },
  fixedPrice: { fontSize: '13px', fontWeight: '700', color: '#0f172a' },
  subtotalText: { fontSize: '12px', fontWeight: '600', color: '#64748b' },
  footer: { marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #f8fafc' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' },
  totalLabel: { margin: 0, fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  totalAmount: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#10b981' },
  disclaimer: { margin: 0, fontSize: '11px', color: '#64748b', fontStyle: 'italic', textAlign: 'right' },
  mainBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }
};

export default PrescriptionCard;