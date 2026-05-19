import React, { useState, useEffect } from 'react';
import { Pill, AlertTriangle, CheckCircle, Clock, Truck, ShieldAlert, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PharmacyOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pending_verify: 0,
    ready_to_dispense: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_suppliers: 0
  });

  const hospitalId = sessionStorage.getItem('hospital_id');

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/pharmacy/overview-metrics/${hospitalId}`);
        setMetrics(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard metrics terminal:", err);
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, [hospitalId]);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}>Compiling live department metrics...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.headerSection}>
        <h2 style={styles.pageTitle}>Pharmacy Control Terminal</h2>
        <p style={styles.pageSubtitle}>Monitor real-time fulfillment pipelines, live inventory health metrics, and supplier allocations.</p>
      </div>

      {/* Main Stats Grid Block */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }} onClick={() => navigate('/pharmacist/queue')}>
          <div>
            <span style={styles.statLabel}>Pending Verification</span>
            <h3 style={styles.statValue}>{metrics.pending_verify}</h3>
            <span style={styles.actionText}>Open Queue <ChevronRight size={12} /></span>
          </div>
          <div style={{ ...styles.iconBox, background: '#eff6ff' }}><Clock color="#3b82f6" size={22} /></div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }} onClick={() => navigate('/pharmacist/dispensing')}>
          <div>
            <span style={styles.statLabel}>Ready to Dispense</span>
            <h3 style={styles.statValue}>{metrics.ready_to_dispense}</h3>
            <span style={styles.actionText}>Handover Desk <ChevronRight size={12} /></span>
          </div>
          <div style={{ ...styles.iconBox, background: '#ecfdf5' }}><CheckCircle color="#10b981" size={22} /></div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #f97316' }} onClick={() => navigate('/pharmacist/alerts')}>
          <div>
            <span style={styles.statLabel}>Low Stock Items</span>
            <h3 style={styles.statValue}>{metrics.low_stock_count}</h3>
            <span style={styles.actionText}>View Warnings <ChevronRight size={12} /></span>
          </div>
          <div style={{ ...styles.iconBox, background: '#fff7ed' }}><AlertTriangle color="#f97316" size={22} /></div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #ef4444' }} onClick={() => navigate('/pharmacist/alerts')}>
          <div>
            <span style={styles.statLabel}>Out of Stock</span>
            <h3 style={styles.statValue}>{metrics.out_of_stock_count}</h3>
            <span style={styles.actionText}>Needs Procurement <ChevronRight size={12} /></span>
          </div>
          <div style={{ ...styles.iconBox, background: '#fef2f2' }}><ShieldAlert color="#ef4444" size={22} /></div>
        </div>
      </div>

      {/* Lower Secondary Management Hub Row */}
      <div style={styles.lowerSection}>
        <div style={styles.managementCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.smallIconBox, background: '#e0f2fe' }}><Truck size={18} color="#0284c7" /></div>
            <div>
              <h4 style={styles.cardTitle}>Supply Chain Status</h4>
              <p style={styles.cardSubtitle}>Connected wholesale manufacturing distributors</p>
            </div>
          </div>
          <div style={styles.supplierOverviewBody}>
            <p style={styles.supplierStatText}>
              You currently have <strong style={{ color: '#0284c7', fontSize: '18px' }}>{metrics.total_suppliers}</strong> authorized suppliers registered under this hospital entity row.
            </p>
            <button style={styles.primaryBtn} onClick={() => navigate('/pharmacist/suppliers')}>
              Manage Vendor Partnerships →
            </button>
          </div>
        </div>

        <div style={styles.managementCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.smallIconBox, background: '#f1f5f9' }}><Pill size={18} color="#475569" /></div>
            <div>
              <h4 style={styles.cardTitle}>Master Catalog Terminal</h4>
              <p style={styles.cardSubtitle}>General adjustments and configurations</p>
            </div>
          </div>
          <div style={styles.supplierOverviewBody}>
            <p style={styles.supplierStatText}>
              Access the main stock book ledger directly to adjust pricing tables, thresholds, or add direct physical adjustments.
            </p>
            <button style={styles.secondaryBtn} onClick={() => navigate('/pharmacist/inventory')}>
              Launch Inventory Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '85vh', fontFamily: 'Inter, system-ui, sans-serif' },
  loadingWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' },
  spinner: { fontSize: '15px', color: '#64748b', fontWeight: '600' },
  headerSection: { marginBottom: '32px' },
  pageTitle: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
  pageSubtitle: { margin: '6px 0 0 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' },
  statLabel: { fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' },
  statValue: { margin: '8px 0', fontSize: '28px', fontWeight: '800', color: '#0f172a' },
  actionText: { fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' },
  iconBox: { width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lowerSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  managementCard: { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
  smallIconBox: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' },
  supplierOverviewBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  supplierStatText: { margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' },
  primaryBtn: { background: '#0284c7', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' },
  secondaryBtn: { background: '#475569', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' }
};

export default PharmacyOverview;