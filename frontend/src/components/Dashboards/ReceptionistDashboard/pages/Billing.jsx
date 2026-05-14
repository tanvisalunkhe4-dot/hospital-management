import React, { useState, useEffect } from 'react';
import { 
  Search, Receipt, Clock, CheckCircle, 
  Download, ArrowLeft, X, CreditCard, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Billing = ({ invoices, hosp_id, onBack, refresh, initialFilter = "All" }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [billingQueue, setBillingQueue] = useState([]);
  
  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
    
  const pendingCount = invoices.filter(i => i.status === 'Pending').length;

  const filteredInvoices = invoices.filter(inv => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (inv.invoice_number?.toLowerCase() || "").includes(searchLower) || 
      (inv.patient_name?.toLowerCase() || "").includes(searchLower) || 
      (inv.patient_id?.toString() || "").includes(searchTerm);
  
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/invoices/${invoiceId}/pay?hosp_id=${hosp_id}`, {
        method: 'PATCH',
      });
      if (res.ok) refresh();
    } catch (err) {
      console.error("Payment update failed:", err);
    }
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/receptionist/billing/queue/${hosp_id}`)
      .then(res => res.json())
      .then(data => setBillingQueue(data))
      .catch(err => console.error("Queue fetch failed:", err));
  }, [hosp_id, invoices]);

  const handleDownloadInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    const receiptHtml = `
      <html>
        <head>
          <title>Invoice - ${invoice.invoice_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.5; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #10b981; padding-bottom: 30px; margin-bottom: 40px; }
            .hospital-info h1 { margin: 0; font-size: 28px; font-weight: 800; color: #0f172a; }
            .hospital-info p { margin: 4px 0; color: #64748b; font-size: 13px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; font-size: 32px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: -1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box h3 { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .info-box p { margin: 4px 0; font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 14px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            td { padding: 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .text-right { text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; margin-top: 30px; }
            .totals-table { width: 300px; }
            .grand-total { border-top: 2px solid #10b981 !important; padding-top: 15px !important; }
            .grand-total-label { font-size: 18px; font-weight: 800; color: #0f172a; }
            .grand-total-value { font-size: 22px; font-weight: 900; color: #10b981; }
            .footer { margin-top: 80px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .footer p { font-size: 12px; color: #94a3b8; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="hospital-info">
              <h1>Nex<span style="color:#10b981">Health</span></h1>
              <p>Multispeciality Hospital & Care Center</p>
              <p>Pune, Maharashtra, India</p>
            </div>
            <div class="invoice-title">
              <h2>Medical Invoice</h2>
              <p># ${invoice.invoice_number}</p>
              <p>Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <h3>Patient Information</h3>
              <p>Name: ${invoice.patient_name}</p>
              <p>ID: #${invoice.patient_id || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>Hospital Details</h3>
              <p>Hospital ID: #${hosp_id}</p>
              <p>Type: Outpatient Billing</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th class="text-right">Total Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Medical Consultation & Integrated Services</td><td class="text-right">₹${invoice.total_amount}</td></tr>
            </tbody>
          </table>
          <div class="totals-container">
            <table class="totals-table">
              <tr class="grand-total">
                <td class="grand-total-label">Total Due</td>
                <td class="grand-total-value text-right">₹${invoice.total_amount}</td>
              </tr>
            </table>
          </div>
          <div class="footer"><p>Thank you for choosing NexHealth.</p></div>
          <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={onBack} style={backBtnStyle}><ArrowLeft size={16} /> Back to Dashboard</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div onClick={() => setFilterStatus("All")} style={{ cursor: 'pointer' }}>
            <StatCard icon={<Receipt color="#059669" />} label="Total Invoices" value={invoices.length} trend="Monthly" isActive={filterStatus === "All"} />
        </div>
        <div onClick={() => setFilterStatus("Pending")} style={{ cursor: 'pointer' }}>
            <StatCard icon={<Clock color="#ea580c" />} label="Unpaid Invoices" value={pendingCount} trend="Attention" isActive={filterStatus === "Pending"} />
        </div>
        <div onClick={() => setFilterStatus("Paid")} style={{ cursor: 'pointer' }}>
            <StatCard icon={<CheckCircle color="#10b981" />} label="Total Collections" value={`₹${totalRevenue.toLocaleString()}`} trend="Live" isActive={filterStatus === "Paid"} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
           <div style={searchWrapperStyle}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search Patient..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={() => { setSelectedApptId(null); setShowModal(true); }} style={generateBtnStyle}>+ Manual Bill</button>
        </div>

        {billingQueue.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '12px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', alignSelf: 'center', marginRight: '5px' }}>READY FOR BILLING:</span>
            {billingQueue.map(queueItem => (
              <button 
                key={queueItem.id}
                onClick={() => { setSelectedApptId(queueItem.id); setShowModal(true); }}
                style={queueButtonStyle}
              >
                <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                {queueItem.patient_name} (ID: #{queueItem.patient_id})
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={tableCardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Patient Details</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Prescription</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: `1px solid #f8fafc` }}>
                <td style={tdStyle}><span style={{ fontWeight: '700', color: '#1e293b' }}>{inv.invoice_number}</span></td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{inv.patient_name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{inv.patient_id || 'N/A'}</div>
                </td>
                <td style={tdStyle}>₹{inv.total_amount.toLocaleString()}</td>
                <td style={tdStyle}>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <button onClick={() => { setSelectedInvoice(inv); setShowPrescription(true); }} style={viewRxButtonStyle}>View RX</button>
                </td>
                <td style={tdStyle}>
                  <span style={inv.status === 'Paid' ? statusBadgeGreen : statusBadgeBlue}>{inv.status}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {inv.status === 'Pending' && (
                      <button onClick={() => handleMarkAsPaid(inv.id)} style={payBtnStyle}><CreditCard size={14} /> Pay</button>
                    )}
                    <div onClick={() => handleDownloadInvoice(inv)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                      <Download size={18} /> <span style={{ fontSize: '12px', fontWeight: '600' }}>Receipt</span>
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <InvoiceModal 
            hosp_id={hosp_id} 
            apptId={selectedApptId}
            onClose={() => { setShowModal(false); setSelectedApptId(null); }} 
            onSuccess={() => { setShowModal(false); setSelectedApptId(null); refresh(); }} 
          />
        )}
        {showPrescription && (
          <PrescriptionDetailModal 
            invoice={selectedInvoice} 
            onClose={() => { setShowPrescription(false); setSelectedInvoice(null); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Stat Card Component --- */
const StatCard = ({ icon, label, value, trend, isActive }) => (
    <div style={{ 
      background: 'white', padding: '24px', borderRadius: '20px', 
      border: isActive ? `2px solid #10b981` : `1px solid #e2e8f0`, 
      boxShadow: isActive ? '0 10px 15px -3px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
      transform: isActive ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{icon}</div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: isActive ? 'white' : '#10b981', background: isActive ? '#10b981' : '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>{trend}</span>
      </div>
      <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: 0 }}>{label}</p>
      <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{value}</h4>
    </div>
);

/* --- Invoice Modal Component (Updated with Availability Logic) --- */
const InvoiceModal = ({ hosp_id, onClose, onSuccess, apptId }) => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
      if (apptId) {
          setLoading(true);
          fetch(`http://localhost:8000/api/v1/pharmacy/final-bill/${apptId}`)
              .then(res => res.json())
              .then(data => {
                  setPatientId(data.patient_id); 
                  setPatientName(data.patient_name);
                  const formattedItems = [
                    { service_name: 'Consultation Fee', unit_price: data.consultation_fee, type: 'Consultation', quantity: 1, is_available: true },
                    ...data.medicines.map(m => ({
                      service_name: m.name,
                      unit_price: m.unit_price,
                      type: 'Pharmacy',
                      quantity: m.qty,
                      is_available: m.is_available 
                    })),
                    ...(data.labs || []).map(l => ({
                      service_name: l.test,
                      unit_price: l.price,
                      type: 'Laboratory',
                      quantity: 1,
                      is_available: true
                    }))
                  ];
                  setItems(formattedItems); 
              })
              .finally(() => setLoading(false));
      } else {
          setPatientId('');
          setPatientName('');
          setItems([{ service_name: 'Consultation Fee', unit_price: 500, type: 'Consultation', quantity: 1, is_available: true }]);
      }
  }, [apptId, hosp_id]);

  const calculateTotal = () => items
    .filter(item => item.is_available !== false) 
    .reduce((acc, item) => acc + (item.unit_price * (item.quantity || 1)), 0);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          // Filter out items that are not available before sending to backend
          const billableItems = items.filter(item => item.is_available !== false);

          const res = await fetch(`http://localhost:8000/api/v1/receptionist/invoices/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  patient_id: parseInt(patientId), 
                  hospital_id: parseInt(hosp_id),
                  appointment_id: apptId ? parseInt(apptId) : null,
                  items: billableItems.map(item => ({
                    service_name: item.service_name,
                    unit_price: item.unit_price,
                    type: item.type,
                    quantity: item.quantity || 1
                  })), 
                  discount: 0, 
                  tax_rate: 0.05 
              })
          });
          if (res.ok) onSuccess();
      } catch (err) { console.error("Billing failed:", err); }
  };

  return (
      <div style={modalOverlay}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>
                      {loading ? 'Fetching Details...' : 'Finalize Invoice'}
                  </h3>
                  <div onClick={onClose} style={{ cursor: 'pointer', padding: '4px', borderRadius: '50%', background: '#f1f5f9' }}>
                      <X size={20} color="#64748b" />
                  </div>
              </div>
              
              {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Loader2 className="animate-spin" color="#059669" size={32} />
                      <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Loading record...</p>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <label style={labelStyle}>PATIENT DETAILS</label>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px' }}>{patientName || "Manual Entry"}</span>
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ID: #{patientId}</span>
                          </div>
                      </div>
                      
                      <div>
                          <label style={labelStyle}>BILLING SUMMARY</label>
                          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {items.map((item, idx) => (
                                  <div key={idx} style={{
                                    ...itemRowStyle,
                                    opacity: item.is_available === false ? 0.6 : 1,
                                    border: item.is_available === false ? '1px dashed #fda4af' : '1px solid #f1f5f9',
                                    background: item.is_available === false ? '#fff1f2' : '#ffffff'
                                  }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                          <span style={{ 
                                            fontSize: '14px', 
                                            fontWeight: '700', 
                                            color: item.is_available === false ? '#e11d48' : '#334155' 
                                          }}>
                                            {item.service_name}
                                          </span>
                                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={getTypeBadgeStyle(item.type)}>{item.type || 'General'}</span>
                                            {item.quantity > 1 && <span style={{ fontSize: '10px', color: '#94a3b8' }}>x{item.quantity}</span>}
                                          </div>
                                      </div>
                                      
                                      {item.is_available === false ? (
                                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#e11d48' }}>OUT OF STOCK</span>
                                      ) : (
                                        <span style={{ fontWeight: '800', color: '#1e293b' }}>
                                          ₹{(item.unit_price * (item.quantity || 1)).toLocaleString()}
                                        </span>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div style={{ marginTop: '10px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                              <span>Subtotal</span>
                              <span>₹{calculateTotal().toLocaleString()}</span>
                          </div>
                          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', color: '#065f46' }}>TOTAL PAYABLE</span>
                              <span style={{ fontSize: '22px', fontWeight: '900', color: '#065f46' }}>₹{calculateTotal().toLocaleString()}</span>
                          </div>
                      </div>
                      
                      <button type="submit" style={generateBtnStyle}>
                          <CreditCard size={18} style={{ marginRight: '8px' }} /> Confirm & Generate Invoice
                      </button>
                  </form>
              )}
          </motion.div>
      </div>
  );
};

/* --- Prescription Detail Modal Component --- */
const PrescriptionDetailModal = ({ invoice, onClose }) => {
  const [rxData, setRxData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoice?.appointment_id) {
      setLoading(true);
      fetch(`http://localhost:8000/api/v1/receptionist/prescriptions/${invoice.appointment_id}`)
        .then(res => res.json())
        .then(data => {
          setRxData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Clinical fetch failed:", err);
          setLoading(false);
        });
    }
  }, [invoice]);

  if (!invoice) return null;

  const cellStyle = { padding: '10px 15px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#1e293b' };
  const headerLabelStyle = { ...cellStyle, background: '#f8fafc', fontWeight: '700', color: '#64748b', width: '130px' };

  return (
    <div style={modalOverlay}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ ...modalContent, maxWidth: '800px', padding: '40px', background: '#fff' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #059669', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>Nex<span style={{ color: '#059669' }}>Health</span></h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '700' }}>MULTISPECIALITY HOSPITAL</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>PRESCRIPTION</h2>
             <X onClick={onClose} style={{ cursor: 'pointer', marginTop: '5px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
            <div style={headerLabelStyle}>Patient</div>
            <div style={cellStyle}>{invoice.patient_name}</div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', borderLeft: '1px solid #cbd5e1' }}>
            <div style={headerLabelStyle}>Date</div>
            <div style={cellStyle}>{new Date(invoice.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={headerLabelStyle}>Vitals</div>
            <div style={cellStyle}>
              {loading ? '...' : `BP: ${rxData?.vitals?.bp || '--'} | Pulse: ${rxData?.vitals?.pulse || '--'}`}
            </div>
          </div>
          <div style={{ display: 'flex', borderLeft: '1px solid #cbd5e1' }}>
            <div style={headerLabelStyle}>Diagnosis</div>
            <div style={cellStyle}>{loading ? 'Loading...' : (rxData?.diagnosis || 'General Checkup')}</div>
          </div>
        </div>

        <div style={{ fontSize: '40px', fontWeight: '900', color: '#e2e8f0', marginBottom: '10px', fontFamily: 'serif' }}>Rx</div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Medication Name</th>
              <th style={cellStyle}>Dosage</th>
              <th style={cellStyle}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rxData?.medications?.map((med, idx) => (
              <tr key={idx}>
                <td style={{ ...cellStyle, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ ...cellStyle, fontWeight: '700' }}>{med.name}</td>
                <td style={cellStyle}>{med.dosage}</td>
                <td style={cellStyle}>{med.duration}</td>
              </tr>
            ))}
            {[...Array(3)].map((_, i) => <tr key={i}><td colSpan="4" style={{ ...cellStyle, height: '35px' }}></td></tr>)}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
          <div style={{ width: '60%', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>DOCTOR'S ADVICE</span>
            <p style={{ margin: '5px 0 0', fontSize: '13px' }}>{rxData?.advice || "Take rest and drink plenty of water."}</p>
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '5px', marginBottom: '5px' }}>
               <span style={{ fontFamily: 'cursive', fontSize: '16px' }}>Dr. Manish Gupta</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Authorized Signature</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* --- Global Styles --- */
const itemRowStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '12px', 
  borderRadius: '12px',
  transition: 'all 0.2s'
};

const getTypeBadgeStyle = (type) => {
  let colors = { bg: '#f1f5f9', text: '#64748b' }; 
  if (type === 'Laboratory' || type === 'Pathology' || type === 'Radiology') colors = { bg: '#fef3c7', text: '#92400e' };
  if (type === 'Pharmacy') colors = { bg: '#dcfce7', text: '#166534' };
  if (type === 'Consultation') colors = { bg: '#e0f2fe', text: '#075985' };

  return {
      fontSize: '10px',
      fontWeight: '800',
      textTransform: 'uppercase',
      padding: '2px 8px',
      borderRadius: '6px',
      background: colors.bg,
      color: colors.text,
      width: 'fit-content'
  };
};

const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', display: 'block' };
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const tableCardStyle = { background: 'white', padding: '24px', borderRadius: '24px', border: `1px solid #e2e8f0`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const statusBadgeBlue = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#eff6ff', color: '#1e40af' };
const statusBadgeGreen = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#ecfdf5', color: '#059669' };
const payBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const searchWrapperStyle = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInputStyle = { width: '100%', padding: '12px 0', border: 'none', outline: 'none', fontSize: '14px' };
const generateBtnStyle = { padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const backBtnStyle = { border: 'none', background: 'none', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' };
const modalOverlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '450px' };
const viewRxButtonStyle = { padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer' };
const queueButtonStyle = { padding: '6px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', color: '#1e40af', cursor: 'pointer', fontWeight: '700', display: 'flex', gap: '6px', alignItems: 'center' };

export default Billing;