import React, { useState, useEffect } from 'react';
import { 
  Search, Receipt, Clock, CheckCircle, 
  Download, ArrowLeft, X, CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Added initialFilter prop to catch the navigation from the Dashboard card
const Billing = ({ invoices, hosp_id, onBack, refresh, initialFilter = "All" }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State to track which filter is active: 'All', 'Pending', or 'Paid'
  // Initialized with initialFilter so clicking "Pending Bills" works immediately
  const [filterStatus, setFilterStatus] = useState(initialFilter);

  // Sync state if prop changes while component is mounted
  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);

  // Logic: Sum ONLY paid invoices for Total Collections
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
    
  const pendingCount = invoices.filter(i => i.status === 'Pending').length;

  // Optimized Double-Filtering Logic (Card Filter + Search Bar)
  const filteredInvoices = invoices.filter(inv => {
    const invNum = inv.invoice_number ? inv.invoice_number.toLowerCase() : "";
    const pName = inv.patient_name ? inv.patient_name.toLowerCase() : "";
    const pId = inv.patient_id ? inv.patient_id.toString() : "";
    
    // Checks if search term matches Invoice #, Patient Name, OR Patient ID
    const matchesSearch = 
      invNum.includes(searchTerm.toLowerCase()) || 
      pName.includes(searchTerm.toLowerCase()) || 
      pId.includes(searchTerm);
  
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

  // --- PDF/PRINT RECEIPT LOGIC ---
  const handleDownloadInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    
    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - ${invoice.invoice_number}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-name { font-size: 24px; font-weight: 800; margin: 0; }
            .details-container { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: 800; color: #059669; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print { @page { margin: 0; } body { margin: 1.6cm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">Nex<span style="color:#10b981">Health</span></div>
            <p style="margin:5px 0; color:#64748b;">Official Payment Receipt</p>
          </div>
          <div class="details-container">
            <div>
              <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Patient:</strong> ${invoice.patient_name} (#${invoice.patient_id})</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th style="text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>General Medical Consultation & Services</td>
                <td style="text-align: right;">₹${invoice.total_amount}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-section">Total Paid: ₹${invoice.total_amount}</div>
          <div class="footer">
            <p>Thank you for choosing NexHealth. This is a computer-generated receipt.</p>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={onBack} style={backBtnStyle}><ArrowLeft size={16} /> Back to Dashboard</button>
      
      {/* Interactive Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div onClick={() => setFilterStatus("All")} style={{ cursor: 'pointer' }}>
            <StatCard 
                icon={<Receipt color="#059669" />} 
                label="Total Invoices" 
                value={invoices.length} 
                trend="Monthly" 
                isActive={filterStatus === "All"}
            />
        </div>
        <div onClick={() => setFilterStatus("Pending")} style={{ cursor: 'pointer' }}>
            <StatCard 
                icon={<Clock color="#ea580c" />} 
                label="Unpaid Invoices" 
                value={pendingCount} 
                trend="Attention" 
                isActive={filterStatus === "Pending"}
            />
        </div>
        <div onClick={() => setFilterStatus("Paid")} style={{ cursor: 'pointer' }}>
            <StatCard 
                icon={<CheckCircle color="#10b981" />} 
                label="Total Collections" 
                value={`₹${totalRevenue.toLocaleString()}`} 
                trend="Live" 
                isActive={filterStatus === "Paid"}
            />
        </div>
      </div>

      {/* Search and Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
         <div style={searchWrapperStyle}>
            <Search size={18} color="#94a3b8" />
            <input 
                type="text" 
                placeholder="Search by Name, Invoice #, or Patient ID..." 
                style={searchInputStyle} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button onClick={() => setShowModal(true)} style={generateBtnStyle}>+ Generate New Bill</button>
      </div>

      {/* Table Section */}
      <div style={tableCardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Patient Details</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Date</th>
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
                <td style={tdStyle}>₹{inv.total_amount}</td>
                <td style={tdStyle}>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <span style={inv.status === 'Paid' ? statusBadgeGreen : statusBadgeBlue}>{inv.status}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {inv.status === 'Pending' && (
                      <button onClick={() => handleMarkAsPaid(inv.id)} style={payBtnStyle}>
                        <CreditCard size={14} /> Pay
                      </button>
                    )}
                    <div 
                      onClick={() => handleDownloadInvoice(inv)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: inv.status === 'Paid' ? '#059669' : '#94a3b8' }}
                      title="Download Receipt"
                    >
                      <Download size={18} />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Receipt</span>
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} billing records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <InvoiceModal 
            hosp_id={hosp_id} 
            onClose={() => setShowModal(false)} 
            onSuccess={() => { setShowModal(false); refresh(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Internal Components --- */

const StatCard = ({ icon, label, value, trend, isActive }) => (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '20px', 
      border: isActive ? `2px solid #10b981` : `1px solid #e2e8f0`, 
      boxShadow: isActive ? '0 10px 15px -3px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.2s ease-in-out',
      transform: isActive ? 'scale(1.02)' : 'scale(1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{icon}</div>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: isActive ? 'white' : '#10b981', 
          background: isActive ? '#10b981' : '#f0fdf4', 
          padding: '4px 8px', 
          borderRadius: '6px' 
        }}>
          {isActive ? 'Filtered' : trend}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: 0 }}>{label}</p>
      <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{value}</h4>
    </div>
);

const InvoiceModal = ({ hosp_id, onClose, onSuccess }) => {
    const [patientId, setPatientId] = useState('');
    const [items, setItems] = useState([
        { service_name: 'Consultation Fee', quantity: 1, unit_price: 500 }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`http://localhost:8000/api/v1/receptionist/invoices/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                patient_id: parseInt(patientId), 
                hospital_id: parseInt(hosp_id), 
                items, 
                discount: 0, 
                tax_rate: 0.05 
            })
          });
          if (res.ok) onSuccess();
        } catch (err) { console.error("Billing failed:", err); }
    };

    return (
        <div style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={modalContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '20px' }}>Generate New Invoice</h3>
                    <X cursor="pointer" onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', display: 'block' }}>PATIENT ID</label>
                        <input placeholder="Enter ID (e.g. 1)" required style={inputStyle} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                    </div>
                    
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', display: 'block' }}>BILLING ITEMS</label>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input placeholder="Service" style={{ ...inputStyle, flex: 2 }} value={item.service_name} onChange={(e) => {
                                    const newItems = [...items]; newItems[idx].service_name = e.target.value; setItems(newItems);
                                }} />
                                <input type="number" placeholder="Price" style={{ ...inputStyle, flex: 1 }} value={item.unit_price} onChange={(e) => {
                                    const newItems = [...items]; newItems[idx].unit_price = parseFloat(e.target.value); setItems(newItems);
                                }} />
                            </div>
                        ))}
                    </div>
                    
                    <button type="submit" style={{ ...generateBtnStyle, marginTop: '10px', width: '100%' }}>Create & Post Invoice</button>
                </form>
            </motion.div>
        </div>
    );
};

/* --- Styles --- */
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const tableCardStyle = { background: 'white', padding: '24px', borderRadius: '24px', border: `1px solid #e2e8f0`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const statusBadgeBlue = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#eff6ff', color: '#1e40af' };
const statusBadgeGreen = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#ecfdf5', color: '#059669' };
const payBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const searchWrapperStyle = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInputStyle = { width: '100%', padding: '12px 0', border: 'none', outline: 'none', fontSize: '14px' };
const generateBtnStyle = { padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const backBtnStyle = { border: 'none', background: 'none', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'fit-content' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', width: '100%', background: '#f8fafc' };

export default Billing;