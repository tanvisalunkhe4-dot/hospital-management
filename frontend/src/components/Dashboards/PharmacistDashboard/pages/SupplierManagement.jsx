import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ShoppingCart, History, Plus, DollarSign, Briefcase } from 'lucide-react';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState('purchase'); // 'purchase' or 'history'

    // Form states
    const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
    const [purchaseForm, setPurchaseForm] = useState({ supplier_id: '', medicine_name: '', quantity_ordered: '', unit_cost: '' });

    const hospitalId = sessionStorage.getItem('hospital_id');

    const fetchData = async () => {
        try {
            const supRes = await axios.get(`http://localhost:8000/api/v1/pharmacy/suppliers/${hospitalId}`);
            setSuppliers(supRes.data);
            const histRes = await axios.get(`http://localhost:8000/api/v1/pharmacy/purchase-history/${hospitalId}`);
            setHistory(histRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading supplier core logs:", err);
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:8000/api/v1/pharmacy/suppliers/${hospitalId}`, supplierForm);
            alert("Supplier registered successfully!");
            setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
            fetchData();
        } catch (err) { alert("Registration error"); }
    };

    const handleNewPurchase = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:8000/api/v1/pharmacy/purchase/${hospitalId}`, purchaseForm);
            alert("Purchase executed! Inventory stock replenished automatically.");
            setPurchaseForm({ supplier_id: '', medicine_name: '', quantity_ordered: '', unit_cost: '' });
            fetchData();
        } catch (err) { alert("Transaction log error"); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <h2 style={styles.pageTitle}>Supplier & Supply Management</h2>
                <p style={styles.pageSubtitle}>Manage wholesale drug vendors, log incoming stock shipments, and monitor B2B balance logs.</p>
            </div>

            {/* Sub Tabs Navigation */}
            <div style={styles.tabBar}>
                <button 
                    style={activeSubTab === 'purchase' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveSubTab('purchase')}
                >
                    <ShoppingCart size={16} /> Purchase Restock Order
                </button>
                <button 
                    style={activeSubTab === 'history' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveSubTab('history')}
                >
                    <History size={16} /> Procurement Ledger Logs
                </button>
            </div>

            {activeSubTab === 'purchase' ? (
                <div style={styles.gridContainer}>
                    {/* Add Supplier Form */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconBox, background: '#e0f2fe' }}><Truck size={18} color="#0284c7" /></div>
                            <div>
                                <h3 style={styles.cardTitle}>Onboard Vendor / Supplier</h3>
                                <p style={styles.cardSubtitle}>Register wholesale medical production distributors</p>
                            </div>
                        </div>
                        <form onSubmit={handleAddSupplier} style={styles.form}>
                            <input style={styles.input} placeholder="Company Name (e.g., Sun Pharma Wholesale)" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} required />
                            <input style={styles.input} placeholder="Contact Person Representative" value={supplierForm.contact_person} onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})} />
                            <div style={styles.row}>
                                <input style={styles.input} placeholder="Phone Line" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} />
                                <input style={styles.input} type="email" placeholder="Email Contact" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} />
                            </div>
                            <input style={styles.input} placeholder="Office Physical Address" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} />
                            <button type="submit" style={styles.blueBtn}><Plus size={16}/> Register Vendor</button>
                        </form>
                    </div>

                    {/* New Purchase Order Form */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconBox, background: '#ecfdf5' }}><ShoppingCart size={18} color="#10b981" /></div>
                            <div>
                                <h3 style={styles.cardTitle}>Create Purchase Inward Order</h3>
                                <p style={styles.cardSubtitle}>Logs supply buy-backs and increments inventory counts instantly</p>
                            </div>
                        </div>
                        <form onSubmit={handleNewPurchase} style={styles.form}>
                            <select style={styles.input} value={purchaseForm.supplier_id} onChange={e => setPurchaseForm({...purchaseForm, supplier_id: e.target.value})} required>
                                <option value="">-- Select Registered Vendor --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input style={styles.input} placeholder="Medicine Name (Matches inventory exactly)" value={purchaseForm.medicine_name} onChange={e => setPurchaseForm({...purchaseForm, medicine_name: e.target.value})} required />
                            <div style={styles.row}>
                                <input style={styles.input} type="number" placeholder="Units to Purchase (e.g. 100)" value={purchaseForm.quantity_ordered} onChange={e => setPurchaseForm({...purchaseForm, quantity_ordered: e.target.value})} required />
                                <input style={styles.input} type="number" step="0.01" placeholder="Cost Price per Unit (₹)" value={purchaseForm.unit_cost} onChange={e => setPurchaseForm({...purchaseForm, unit_cost: e.target.value})} required />
                            </div>
                            <button type="submit" style={styles.greenBtn}>Execute Stock Replenishment</button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Procurement Running Log History List Sheet */
                <div style={styles.cardFull}>
                    <h3 style={{...styles.cardTitle, marginBottom: '20px'}}>Procurement Ledger History Statement</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Invoice Item</th>
                                <th style={styles.th}>Wholesale Distributor Vendor</th>
                                <th style={styles.th}>Purchased Vol</th>
                                <th style={styles.th}>Base Cost</th>
                                <th style={styles.th}>Total Disbursed</th>
                                <th style={styles.th}>Date Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} style={styles.tdRow}>
                                    <td style={{...styles.td, fontWeight: '700', color: '#1e293b'}}>{h.medicine_name}</td>
                                    <td style={styles.td}>{h.supplier_name}</td>
                                    <td style={styles.td}>{h.quantity_ordered} units</td>
                                    <td style={styles.td}>₹{h.unit_cost.toFixed(2)}</td>
                                    <td style={{...styles.td, fontWeight: '700', color: '#10b981'}}>₹{h.total_amount.toFixed(2)}</td>
                                    <td style={styles.td}>{h.purchase_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {history.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>No business transaction records loaded.</div>}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '85vh', fontFamily: 'Inter, system-ui, sans-serif' },
    headerSection: { marginBottom: '28px' },
    pageTitle: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
    pageSubtitle: { margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' },
    tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    activeTabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderBottom: '2px solid #2563eb', borderRadius: '8px 8px 0 0', color: '#2563eb', fontSize: '14px', fontWeight: '700', cursor: 'default' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    card: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    cardFull: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
    iconBox: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' },
    cardSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' },
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    row: { display: 'flex', gap: '12px' },
    input: { padding: '11px 14px', fontSize: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', width: '100%', boxSizing: 'border-box' },
    blueBtn: { background: '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
    greenBtn: { background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    thRow: { borderBottom: '2px solid #f1f5f9' },
    th: { textAlign: 'left', padding: '12px', color: '#64748b', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' },
    tdRow: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '14px 12px', color: '#475569' }
};

export default SupplierManagement;