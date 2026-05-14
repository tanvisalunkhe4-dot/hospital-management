import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertTriangle, CheckCircle, Clock, ChevronRight, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PharmacyOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    pendingVerify: 0,
    readyToDispense: 0,
    lowStockCount: 0,
    completedToday: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const hospitalId = sessionStorage.getItem('hospital_id');
      const token = sessionStorage.getItem('token');
      
      // PRODUCT LOGIC: In a full build, we'd hit a stats endpoint. 
      // For now, we fetch the pending list to get a real count.
      const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/pending/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSummary(prev => ({
        ...prev,
        pendingVerify: res.data.length,
        readyToDispense: 5, // Mocked until we build the Dispensing fetch
        lowStockCount: 3,
        completedToday: 14
      }));
    } catch (err) {
      console.error("Stats fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Pharmacy Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Departmental status and inventory alerts.</p>
      </header>

      {/* KPI Section - The Core Product Value */}
      <div style={statsGrid}>
        <StatCard 
          icon={<Clock color="#f59e0b" />} 
          label="Prescriptions Pending" 
          value={summary.pendingVerify} 
          color="#fff7ed" 
          onClick={() => navigate('/pharmacist/prescriptions')}
        />
        <StatCard 
          icon={<Pill color="#3b82f6" />} 
          label="Ready to Dispense" 
          value={summary.readyToDispense} 
          color="#eff6ff" 
          onClick={() => navigate('/pharmacist/dispense')}
        />
        <StatCard 
          icon={<AlertTriangle color="#ef4444" />} 
          label="Stock Alerts" 
          value={summary.lowStockCount} 
          color="#fef2f2" 
          onClick={() => navigate('/pharmacist/inventory')}
        />
        <StatCard 
          icon={<CheckCircle color="#10b981" />} 
          label="Dispensed Today" 
          value={summary.completedToday} 
          color="#f0fdf4" 
        />
      </div>

      <div style={mainGrid}>
        {/* Urgent Action Center */}
        <div style={card}>
          <div style={cardHeader}>
            <h3 style={cardTitle}>Critical Inventory</h3>
            <button style={textBtn} onClick={() => navigate('/pharmacist/inventory')}>Manage Stock</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InventoryAlert name="Paracetamol 500mg" stock={12} total={500} />
            <InventoryAlert name="Amoxicillin 250mg" stock={5} total={100} />
          </div>
        </div>

        {/* Workflow Status */}
        <div style={card}>
          <h3 style={cardTitle}>Workflow Efficiency</h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Avg. processing time: <b>12 mins</b></p>
          <div style={{ marginTop: '20px', height: '100px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            [Efficiency Graph]
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Sub-Components for Clean Code
const StatCard = ({ icon, label, value, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5, cursor: onClick ? 'pointer' : 'default' }} 
    onClick={onClick}
    style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}
  >
    <div>
      <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{value}</h4>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{label}</p>
    </div>
    <div style={{ backgroundColor: color, padding: '12px', borderRadius: '12px', height: 'fit-content' }}>{icon}</div>
  </motion.div>
);

const InventoryAlert = ({ name, stock, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fef2f2', borderRadius: '12px' }}>
    <Package size={18} color="#ef4444" />
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#991b1b' }}>{name}</p>
      <div style={{ width: '100%', height: '4px', background: '#fee2e2', borderRadius: '2px', marginTop: '4px' }}>
        <div style={{ width: `${(stock/total)*100}%`, height: '100%', background: '#ef4444' }} />
      </div>
    </div>
    <span style={{ fontSize: '12px', fontWeight: '800', color: '#ef4444' }}>{stock} left</span>
  </div>
);

// Styles
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' };
const card = { background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const cardTitle = { fontSize: '18px', fontWeight: '700', color: '#334155', margin: 0 };
const textBtn = { background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', fontSize: '13px', cursor: 'pointer' };

export default PharmacyOverview;