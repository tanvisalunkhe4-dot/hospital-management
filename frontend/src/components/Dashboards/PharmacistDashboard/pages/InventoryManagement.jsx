import React, { useState, useEffect } from 'react';
import { 
    PlusCircle, Package, IndianRupee, ShieldAlert, 
    Calendar, Search, Edit3, Activity, AlertCircle, X, Save 
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InventoryManagement = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        stock_quantity: '', 
        min_reserve_limit: '',
        price: '', 
        expiry_date: ''
    });
    const [inventory, setInventory] = useState([]);
    const [totalCatalogCount, setTotalCatalogCount] = useState(0);
    const [globalAlertCount, setGlobalAlertCount] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Modal Control States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalData, setModalData] = useState({
        added_stock: '',
        min_reserve_limit: '',
        price: '',
        expiry_date: ''
    });

    const fetchInventoryData = async (searchQuery = "") => {
        try {
            const hospitalId = sessionStorage.getItem('hospital_id');
            const alertRes = await axios.get(
                `http://localhost:8000/api/v1/pharmacy/inventory-alerts/${hospitalId}?q=${searchQuery}`
            );
            setInventory(alertRes.data.low_stock || []); 
            
            const statsRes = await axios.get(`http://localhost:8000/api/v1/pharmacy/inventory-stats/${hospitalId}`);
            setTotalCatalogCount(statsRes.data.total_medicines || 0);
            setGlobalAlertCount(statsRes.data.low_stock_alerts || 0); 

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchInventoryData(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    useEffect(() => {
        const searchMedicines = async () => {
            if (formData.name.trim().length < 3) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/search-master?q=${formData.name}`);
                setSuggestions(res.data);
            } catch (err) {
                console.error("Error fetching lookup suggestions", err);
            }
        };

        const delayDebounce = setTimeout(() => {
            searchMedicines();
        }, 250);
        return () => clearTimeout(delayDebounce);
    }, [formData.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hospitalId = sessionStorage.getItem('hospital_id');
            const payload = {
                name: formData.name,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                min_reserve_limit: parseInt(formData.min_reserve_limit) || 0,
                price: parseFloat(formData.price) || 0.0,
                expiry_date: formData.expiry_date === "" ? null : formData.expiry_date
            };

            await axios.post(`http://localhost:8000/api/v1/pharmacy/inventory/${hospitalId}`, payload);
            alert("Medicine added to catalog successfully!");
            setFormData({ name: '', stock_quantity: '', min_reserve_limit: '', price: '', expiry_date: '' });
            setSuggestions([]);
            setShowSuggestions(false);
            fetchInventoryData(searchTerm); 
        } catch (err) {
            alert("Error mapping medicine: " + (err.response?.data?.detail || err.message));
        }
    };

    // Open Modal and pre-populate fields with existing DB values
    const openEditModal = (item) => {
        setSelectedItem(item);
        setModalData({
            added_stock: '', // Kept empty for additive tracking entry
            min_reserve_limit: item.reserve_limit || 0,
            price: item.price || 0,
            expiry_date: item.expiry_date || ''
        });
        setIsModalOpen(true);
    };

    const handleModalSave = async (e) => {
        e.preventDefault();
        try {
            const hospitalId = sessionStorage.getItem('hospital_id');
            const payload = {
                name: selectedItem.name,
                stock_quantity: parseInt(modalData.added_stock) || 0, 
                min_reserve_limit: parseInt(modalData.min_reserve_limit) || 0,
                price: parseFloat(modalData.price) || 0.0,
                expiry_date: modalData.expiry_date === "" ? null : modalData.expiry_date
            };

            await axios.post(`http://localhost:8000/api/v1/pharmacy/inventory/${hospitalId}`, payload);
            setIsModalOpen(false);
            setSelectedItem(null);
            fetchInventoryData(searchTerm);
        } catch (err) {
            alert("Error updating supply batch: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div style={container}>
            <div style={pageHeader}>
                <div>
                    <h2 style={title}>Pharmacy Inventory</h2>
                    <p style={subtitle}>Real-time stock monitoring and activation mapping.</p>
                </div>
                
                <div style={statsRow}>
                    <div style={miniStatCard}>
                        <div style={statIconBox}><Activity size={18} color="#10b981"/></div>
                        <div>
                            <span style={statLabel}>Total Catalog</span>
                            <span style={statValue}>{totalCatalogCount}</span>
                        </div>
                    </div>
                    <div 
                        style={miniStatCardRedClickable}
                        onClick={() => navigate('/pharmacist/alerts')}
                    >
                        <div style={{...statIconBox, background: '#fef2f2'}}><AlertCircle size={18} color="#ef4444"/></div>
                        <div>
                            <span style={{...statLabel, color: '#b91c1c'}}>Stock Alerts</span>
                            <span style={{...statValue, color: '#ef4444'}}>{globalAlertCount} <span style={{fontSize: '11px', fontWeight: 'bold'}}>View →</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={contentGrid}>
                {/* Form Section */}
                <div style={formCard}>
                    <h3 style={sectionTitle}>
                        <PlusCircle size={20} color="#10b981" /> 
                        Register New Medicine
                    </h3>
                    
                    <form onSubmit={handleSubmit} style={formLayout}>
                        <div style={{...inputContainer, position: 'relative'}}>
                            <label style={label}>Medicine Name</label>
                            <input 
                                style={textInput}
                                placeholder="Type at least 3 letters to search master catalog..."
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({...formData, name: e.target.value});
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                                required
                            />
                            
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={autocompleteWindow}>
                                    {suggestions.map((item) => (
                                        <div 
                                            key={item.id}
                                            style={suggestionRow}
                                            onMouseDown={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    name: item.name,
                                                    price: item.price || ''
                                                });
                                                setSuggestions([]);
                                                setShowSuggestions(false);
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.category || 'General'} | {item.manufacturer || 'Unknown Lab'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div style={formRow}>
                            <div style={inputContainer}>
                                <label style={label}>Initial Stock</label>
                                <div style={iconInputGroup}>
                                    <Package size={16} color="#64748b" />
                                    <input type="number" style={rawInput} placeholder="0"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={inputContainer}>
                                <label style={label}>Reserve Limit</label>
                                <div style={iconInputGroup}>
                                    <ShieldAlert size={16} color="#64748b" />
                                    <input type="number" style={rawInput} placeholder="10"
                                        value={formData.min_reserve_limit}
                                        onChange={(e) => setFormData({...formData, min_reserve_limit: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={formRow}>
                            <div style={inputContainer}>
                                <label style={label}>Price per Unit</label>
                                <div style={iconInputGroup}>
                                    <IndianRupee size={16} color="#64748b" />
                                    <input type="number" step="0.01" style={rawInput} placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={inputContainer}>
                                <label style={label}>Expiry Date</label>
                                <div style={iconInputGroup}>
                                    <Calendar size={16} color="#64748b" />
                                    <input type="date" style={rawInput}
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" style={submitBtn}>
                            Add to Catalog
                        </button>
                    </form>
                </div>

                {/* Table Section */}
                <div style={tableCard}>
                    <div style={tableHeader}>
                        <h3 style={sectionTitle}>Stock Ledger</h3>
                        <div style={searchBar}>
                            <Search size={16} color="#94a3b8" />
                            <input 
                                placeholder="Search all hospital alerts..." 
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
                                    <th style={{...th, textAlign: 'center'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, idx) => {
                                    const percentage = Math.min((item.current_stock / (item.reserve_limit || 1)) * 100, 100);
                                    const isCritical = item.current_stock <= 5;
                                    const barColor = isCritical ? '#ef4444' : '#f59e0b';

                                    return (
                                        <tr key={idx} style={tableRow}>
                                            <td style={td}>
                                                <div style={{fontWeight: '700', color: '#1e293b', fontSize: '15px'}}>{item.name}</div>
                                                <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '2px'}}>₹{item.price ? item.price.toFixed(2) : "0.00"} per unit</div>
                                            </td>
                                            <td style={td}>
                                                <div style={stockLevelWrapper}>
                                                    <div style={stockHeader}>
                                                        {isCritical ? (
                                                            <span style={critTextBadge}>CRITICAL ({item.current_stock} left)</span>
                                                        ) : (
                                                            <span style={lowTextBadge}>LOW STOCK ({item.current_stock} left)</span>
                                                        )}
                                                        <span style={reserveText}>Goal: {item.reserve_limit}+</span>
                                                    </div>
                                                    <div style={progressBarContainer}>
                                                        <div style={{
                                                            ...progressBarFill,
                                                            width: `${percentage}%`,
                                                            background: barColor
                                                        }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{...td, textAlign: 'center'}}>
                                                <button 
                                                    onClick={() => openEditModal(item)} 
                                                    style={actionBtn}
                                                >
                                                    <Edit3 size={16} color="#2563eb"/>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {inventory.length === 0 && !loading && (
                            <div style={emptyState}>No medicines found matching your search.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- COMPACT MODAL CARD WITH REGULAR LABELS --- */}
            {isModalOpen && selectedItem && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        
                        <div style={modalHeader}>
                            <div>
                                <h3 style={modalTitle}>Update Supply Batch</h3>
                                <p style={modalSubtitle}>Medication: <strong style={{color: '#0f172a'}}>{selectedItem.name}</strong></p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtn}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleModalSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={label}>Stock Quantity to Add</label>
                                <input 
                                    type="number" required placeholder="Type incoming quantity units (e.g. 50)..."
                                    value={modalData.added_stock}
                                    onChange={(e) => setModalData({...modalData, added_stock: e.target.value})}
                                    style={modalInputField}
                                />
                                <span style={modalInputSubtext}>
                                    Currently in stock: <strong>{selectedItem.current_stock} units</strong>.
                                </span>
                            </div>

                            <div style={formRow}>
                                <div style={inputContainer}>
                                    <label style={label}>Price per Unit (₹)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        value={modalData.price}
                                        onChange={(e) => setModalData({...modalData, price: e.target.value})}
                                        style={modalInputField}
                                    />
                                </div>
                                <div style={inputContainer}>
                                    <label style={label}>Reserve Limit</label>
                                    <input 
                                        type="number" required
                                        value={modalData.min_reserve_limit}
                                        onChange={(e) => setModalData({...modalData, min_reserve_limit: e.target.value})}
                                        style={modalInputField}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={label}>Expiry Date</label>
                                <input 
                                    type="date"
                                    value={modalData.expiry_date}
                                    onChange={(e) => setModalData({...modalData, expiry_date: e.target.value})}
                                    style={modalInputField}
                                />
                            </div>

                            <div style={modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={modalCancelBtn}>Discard</button>
                                <button type="submit" style={modalSaveBtn}><Save size={15} /> Save Updates</button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLING COEFFICIENTS ---
const container = { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' };
const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' };
const title = { margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' };
const subtitle = { margin: '4px 0 0 0', fontSize: '15px', color: '#64748b' };
const statsRow = { display: 'flex', gap: '16px' };
const miniStatCard = { background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const miniStatCardRedClickable = { background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'pointer' };
const statIconBox = { width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statLabel = { display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600' };
const statValue = { display: 'block', fontSize: '20px', fontWeight: '800', color: '#1e293b' };
const contentGrid = { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px' };
const formCard = { background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' };
const tableCard = { background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', marginTop: 0 };
const formLayout = { display: 'flex', flexDirection: 'column', gap: '20px' };
const formRow = { display: 'flex', gap: '16px' };
const inputContainer = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' };
const label = { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' };
const textInput = { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px' };
const iconInputGroup = { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const rawInput = { width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1e293b' };
const submitBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginTop: '10px' };
const tableHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '12px' };
const searchField = { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '180px' };
const mainTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { borderBottom: '2px solid #f1f5f9' };
const th = { textAlign: 'left', padding: '14px 12px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tableRow = { borderBottom: '1px solid #f1f5f9' };
const td = { padding: '20px 12px', fontSize: '15px', verticalAlign: 'middle' }; 
const stockLevelWrapper = { width: '210px' };
const stockHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', alignItems: 'center' };
const reserveText = { color: '#94a3b8', fontWeight: '600', fontSize: '11px' };
const critTextBadge = { color: '#ef4444', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' };
const lowTextBadge = { color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' };
const progressBarContainer = { width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' };
const progressBarFill = { height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' };
const actionBtn = { background: '#fff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const emptyState = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' };
const tableWrapper = { minHeight: '300px' };
const autocompleteWindow = { position: 'absolute', top: '72px', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const suggestionRow = { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' };

// --- MODAL STYLES ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 };
const modalCard = { background: 'white', padding: '32px', borderRadius: '24px', width: '460px', maxWidth: '92%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' };
const modalTitle = { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 };
const modalSubtitle = { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' };
const closeBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px' };
const modalInputField = { width: '100%', padding: '12px 14px', fontSize: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', fontWeight: '500', color: '#1e293b' };
const modalInputSubtext = { fontSize: '12px', color: '#64748b', marginTop: '5px', display: 'block' };
const modalFooter = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' };
const modalCancelBtn = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' };
const modalSaveBtn = { background: '#2563eb', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

export default InventoryManagement;