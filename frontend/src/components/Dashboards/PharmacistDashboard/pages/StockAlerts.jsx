import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Calendar, Package } from 'lucide-react';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });

    useEffect(() => {
        const fetchAlerts = async () => {
            const hospitalId = sessionStorage.getItem('hospital_id');
            const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/inventory-alerts/${hospitalId}`);
            setAlerts(res.data);
        };
        fetchAlerts();
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ fontWeight: '800', marginBottom: '20px' }}>Inventory Health</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Low Stock Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <Package color="#e11d48" />
                        <h3 style={{ margin: 0 }}>Stock Depletion</h3>
                    </div>
                    {alerts.low_stock.map((item, idx) => (
                        <div key={idx} style={styles.alertItem}>
                            <span>{item.name}</span>
                            <span style={styles.stockBadge}>{item.current_stock} left</span>
                        </div>
                    ))}
                </div>

                {/* Expiry Section */}
                <div style={styles.alertCard}>
                    <div style={styles.cardHeader}>
                        <Calendar color="#f59e0b" />
                        <h3 style={{ margin: 0 }}>Expiring Soon</h3>
                    </div>
                    {alerts.expiring_soon.map((item, idx) => (
                        <div key={idx} style={styles.alertItem}>
                            <span>{item.name}</span>
                            <span style={styles.expiryBadge}>{item.days_left} days</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    alertCard: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
    alertItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' },
    stockBadge: { background: '#fff1f2', color: '#e11d48', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
    expiryBadge: { background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }
};

export default StockAlerts;