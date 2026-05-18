import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Calendar, Package } from 'lucide-react';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const hospitalId = sessionStorage.getItem('hospital_id');
                // Hits the optimized endpoint (will return max 50 actual low-stock items)
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
        return <div style={{ padding: '24px', color: '#64748b' }}>Analyzing inventory health...</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Inventory Health</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Low Stock Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <Package color="#e11d48" />
                        <h3 style={{ margin: 0, color: '#1e293b' }}>Stock Depletion</h3>
                    </div>
                    <div style={styles.listWrapper}>
                        {alerts.low_stock.map((item, idx) => (
                            <div key={idx} style={styles.alertItem}>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item.name}</span>
                                <span style={styles.stockBadge}>
                                    {item.current_stock} left (Goal: {item.reserve_limit})
                                </span>
                            </div>
                        ))}
                        {alerts.low_stock.length === 0 && (
                            <div style={styles.emptyText}>All stocks are healthy! 🎉</div>
                        )}
                    </div>
                </div>

                {/* Expiry Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <Calendar color="#f59e0b" />
                        <h3 style={{ margin: 0, color: '#1e293b' }}>Expiring Soon</h3>
                    </div>
                    <div style={styles.listWrapper}>
                        {alerts.expiring_soon.map((item, idx) => (
                            <div key={idx} style={styles.alertItem}>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item.name}</span>
                                <span style={styles.expiryBadge}>
                                    {item.days_left <= 0 ? 'Expired' : `${item.days_left} days left`}
                                </span>
                            </div>
                        ))}
                        {alerts.expiring_soon.length === 0 && (
                            <div style={styles.emptyText}>No items expiring in the next 30 days.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    alertCard: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
    listWrapper: { maxHeight: '400px', overflowY: 'auto' }, // Adds a clean scrollbar if alerts get heavy
    alertItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
    stockBadge: { background: '#fff1f2', color: '#e11d48', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
    expiryBadge: { background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
    emptyText: { padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }
};

export default StockAlerts;