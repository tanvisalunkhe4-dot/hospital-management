import React, { useState, useEffect, useMemo } from 'react';
import { 
    PlusCircle, Package, IndianRupee, ShieldAlert, 
    Calendar, Search, Edit3, Activity, AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const InventoryManagement = () => {
    const [formData, setFormData] = useState({
        name: '',
        stock_quantity: 0,
        min_reserve_limit: 0,
        price_per_unit: 0,
        expiry_date: ''
    });
    const [inventory, setInventory] = useState([]);
    const [totalCatalogCount, setTotalCatalogCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchInventoryData = async () => {
        try {
            const hospitalId = sessionStorage.getItem('hospital_id');
            
            // 1. Fetch alerts for the table
            const alertRes = await axios.get(`http://localhost:8000/api/v1/pharmacy/inventory-alerts/${hospitalId}`);
            setInventory(alertRes.data.low_stock || []); 
            
            // 2. Fetch total count from our new stats endpoint
            const statsRes = await axios.get(`http://localhost:8000/api/v1/pharmacy/inventory-stats/${hospitalId}`);
            setTotalCatalogCount(statsRes.data.total_medicines || 0);

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hospitalId = sessionStorage.getItem('hospital_id');
            await axios.post(`http://localhost:8000/api/v1/pharmacy/inventory/${hospitalId}`, formData);
            alert("Medicine registered successfully!");
            fetchInventoryData(); // Refresh list and stats
        } catch (err) {
            console.error("Error adding medicine:", err);
            alert("Failed to add medicine.");
        }
    };

    // PERFORMANCE OPTIMIZATION: useMemo prevents the "lag" when typing in search
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, inventory]);

    return (
        <div style={container}>
            {/* Header with SaaS-style Stat Cards */}
            <div style={pageHeader}>
                <div>
                    <h2 style={title}>Pharmacy Inventory</h2>
                    <p style={subtitle}>Real-time stock monitoring and replenishment.</p>
                </div>
                
                <div style={statsRow}>
                    <div style={miniStatCard}>
                        <div style={statIconBox}><Activity size={18} color="#10b981"/></div>
                        <div>
                            <span style={statLabel}>Total Catalog</span>
                            <span style={statValue}>{totalCatalogCount}</span>
                        </div>
                    </div>
                    <div style={{...miniStatCard, borderLeft: '4px solid #ef4444'}}>
                        <div style={{...statIconBox, background: '#fef2f2'}}><AlertCircle size={18} color="#ef4444"/></div>
                        <div>
                            <span style={statLabel}>Stock Alerts</span>
                            <span style={{...statValue, color: '#ef4444'}}>
                                {inventory.filter(i => i.status === 'Critical').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={contentGrid}>
                {/* Section 1: Registration Form */}
                <div style={formCard}>
                    <h3 style={sectionTitle}>
                        <PlusCircle size={20} color="#10b981" /> 
                        Register New Medicine
                    </h3>
                    
                    <form onSubmit={handleSubmit} style={formLayout}>
                        <div style={inputContainer}>
                            <label style={label}>Medicine Name</label>
                            <input 
                                style={textInput}
                                placeholder="e.g. Paracetamol 500mg"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div style={formRow}>
                            <div style={inputContainer}>
                                <label style={label}>Initial Stock</label>
                                <div style={iconInputGroup}>
                                    <Package size={16} color="#64748b" />
                                    <input type="number" style={rawInput} placeholder="0"
                                        onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}/>
                                </div>
                            </div>
                            <div style={inputContainer}>
                                <label style={label}>Reserve Limit</label>
                                <div style={iconInputGroup}>
                                    <ShieldAlert size={16} color="#64748b" />
                                    <input type="number" style={rawInput} placeholder="10"
                                        onChange={(e) => setFormData({...formData, min_reserve_limit: e.target.value})}/>
                                </div>
                            </div>
                        </div>

                        <div style={formRow}>
                            <div style={inputContainer}>
                                <label style={label}>Price per Unit</label>
                                <div style={iconInputGroup}>
                                    <IndianRupee size={16} color="#64748b" />
                                    <input type="number" style={rawInput} placeholder="0.00"
                                        onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}/>
                                </div>
                            </div>
                            {/* FIXED: Removed double expiry date container */}
                            <div style={inputContainer}>
                                <label style={label}>Expiry Date</label>
                                <div style={iconInputGroup}>
                                    <Calendar size={16} color="#64748b" />
                                    <input type="date" style={rawInput}
                                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}/>
                                </div>
                            </div>
                        </div>

                        <button type="submit" style={submitBtn}>
                            Add to Catalog
                        </button>
                    </form>
                </div>

                {/* Section 2: Visual Stock Ledger */}
                <div style={tableCard}>
                    <div style={tableHeader}>
                        <h3 style={sectionTitle}>Stock Ledger</h3>
                        <div style={searchBar}>
                            <Search size={16} color="#94a3b8" />
                            <input 
                                placeholder="Filter alerts..." 
                                style={searchField} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={tableWrapper}>
                        <table style={mainTable}>
                            <thead>
                                <tr style={tableHeaderRow}>
                                    <th style={th}>Medicine Details</th>
                                    <th style={th}>Inventory Status</th>
                                    <th style={th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item, idx) => (
                                    <tr key={idx} style={tableRow}>
                                        <td style={td}>
                                            <div style={{fontWeight: '700', color: '#1e293b'}}>{item.name}</div>
                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>SKU: {item.name.substring(0,3).toUpperCase()}-{idx+101}</div>
                                        </td>
                                        <td style={td}>
                                            <div style={stockLevelWrapper}>
                                                <div style={stockHeader}>
                                                    <span style={item.status === 'Critical' ? critText : lowText}>
                                                        {item.current_stock} in stock
                                                    </span>
                                                    <span style={reserveText}>Goal: {item.reserve_limit}+</span>
                                                </div>
                                                <div style={progressBarContainer}>
                                                    <div style={{
                                                        ...progressBarFill,
                                                        width: `${Math.min((item.current_stock / (item.reserve_limit || 1)) * 100, 100)}%`,
                                                        background: item.status === 'Critical' ? '#ef4444' : '#f59e0b'
                                                    }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={td}>
                                            <button style={actionBtn}><Edit3 size={14} color="#64748b"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInventory.length === 0 && !loading && (
                            <div style={emptyState}>No medicines found matching your search.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const container = { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' };
const title = { margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' };
const subtitle = { margin: '4px 0 0 0', fontSize: '15px', color: '#64748b' };
const statsRow = { display: 'flex', gap: '16px' };
const miniStatCard = { background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const statIconBox = { width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statLabel = { display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600' };
const statValue = { display: 'block', fontSize: '20px', fontWeight: '800', color: '#1e293b' };
const contentGrid = { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' };
const formCard = { background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const tableCard = { background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', marginTop: 0 };
const formLayout = { display: 'flex', flexDirection: 'column', gap: '20px' };
const formRow = { display: 'flex', gap: '16px' };
const inputContainer = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' };
const label = { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const textInput = { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', transition: 'all 0.2s' };
const iconInputGroup = { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const rawInput = { width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1e293b' };
const submitBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '15px', marginTop: '10px' };
const tableHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '12px' };
const searchField = { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '150px' };
const mainTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { borderBottom: '1px solid #f1f5f9' };
const th = { textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' };
const tableRow = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const td = { padding: '16px 12px', fontSize: '14px' };
const stockLevelWrapper = { width: '160px' };
const stockHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontWeight: '700' };
const critText = { color: '#ef4444' };
const lowText = { color: '#f59e0b' };
const reserveText = { color: '#94a3b8' };
const progressBarContainer = { width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' };
const progressBarFill = { height: '100%', borderRadius: '10px', transition: 'width 0.8s ease' };
const actionBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', cursor: 'pointer' };
const emptyState = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' };
const tableWrapper = { minHeight: '300px' };

export default InventoryManagement;