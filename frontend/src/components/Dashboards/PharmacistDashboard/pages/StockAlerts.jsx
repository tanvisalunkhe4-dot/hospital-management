import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Package, AlertCircle, ShieldAlert, Clock } from 'lucide-react';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const hospitalId = sessionStorage.getItem('hospital_id');
                const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/inventory-alerts/${hospitalId}`);
                setAlerts(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed fetching dashboard health alerts:", err);
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) {
        return (
            <div style={styles.loadingWrapper}>
                <div style={styles.spinner}>Analyzing inventory health matrix...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.headerSection}>
                <h2 style={styles.pageTitle}>Inventory Health</h2>
                <p style={styles.pageSubtitle}>Real-time tracking of critical stock depletion thresholds and upcoming batch expirations.</p>
            </div>
            
            <div style={styles.gridContainer}>
                {/* Low Stock Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconBox, background: '#fee2e2' }}><Package size={18} color="#ef4444" /></div>
                        <div>
                            <h3 style={styles.cardTitle}>Stock Depletion</h3>
                            <p style={styles.cardSubtitle}>Active items that have crossed safety reserve margins</p>
                        </div>
                    </div>
                    <div style={styles.listWrapper}>
                        {alerts.low_stock.map((item, idx) => (
                            <div key={idx} style={styles.alertItem}>
                                <div style={styles.itemMeta}>
                                    <span style={styles.medicineName}>{item.name}</span>
                                    <span style={styles.subtext}>Safety Limit: {item.reserve_limit} units</span>
                                </div>
                                <span style={styles.stockBadge}>
                                    <span style={styles.statusDotRed}></span>
                                    {item.current_stock} units left
                                </span>
                            </div>
                        ))}
                        {alerts.low_stock.length === 0 && (
                            <div style={styles.emptyContainer}>
                                <ShieldAlert size={28} color="#10b981" />
                                <div style={styles.emptyText}>All stocks are healthy!</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiry Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconBox, background: '#fffbeb' }}><Calendar size={18} color="#d97706" /></div>
                        <div>
                            <h3 style={styles.cardTitle}>Expiring Soon</h3>
                            <p style={styles.cardSubtitle}>Inventory tracking batches expiring within 30 days</p>
                        </div>
                    </div>
                    <div style={styles.listWrapper}>
                        {alerts.expiring_soon.map((item, idx) => {
                            const isExpired = item.days_left <= 0;
                            return (
                                <div key={idx} style={styles.alertItem}>
                                    <div style={styles.itemMeta}>
                                        <span style={styles.medicineName}>{item.name}</span>
                                        <span style={styles.subtext}>Expires: {item.expiry_date || 'N/A'}</span>
                                    </div>
                                    <span style={isExpired ? styles.expiredBadge : styles.expiryBadge}>
                                        <span style={isExpired ? styles.statusDotGray : styles.statusDotOrange}></span>
                                        {isExpired ? 'Expired' : `${item.days_left} days left`}
                                    </span>
                                </div>
                            );
                        })}
                        {alerts.expiring_soon.length === 0 && (
                            <div style={styles.emptyContainer}>
                                <Clock size={28} color="#64748b" />
                                <div style={styles.emptyText}>No items expiring within 30 days.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ENTERPRISE PRODUCT LEVEL STYLES ---
const styles = {
    container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '85vh', fontFamily: 'Inter, system-ui, sans-serif' },
    headerSection: { marginBottom: '28px' },
    pageTitle: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
    pageSubtitle: { margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    
    alertCard: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
    iconBox: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' },
    cardSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' },
    
    listWrapper: { maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' },
    alertItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f8fafc' },
    itemMeta: { display: 'flex', flexDirection: 'column', gap: '3px' },
    medicineName: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
    subtext: { fontSize: '12px', color: '#94a3b8' },
    
    // Premium Pill Badges with live indicators
    stockBadge: { background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    expiryBadge: { background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    expiredBadge: { background: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    
    statusDotRed: { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' },
    statusDotOrange: { width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' },
    statusDotGray: { width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' },
    
    emptyContainer: { padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    emptyText: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
    loadingWrapper: { padding: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    spinner: { color: '#64748b', fontSize: '14px', fontWeight: '500' }
};

export default StockAlerts;