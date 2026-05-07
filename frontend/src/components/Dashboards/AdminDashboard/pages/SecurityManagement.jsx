import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShieldCheck, UserCheck, History, HardDrive, 
  Lock, Key, Eye, Download, RefreshCw, AlertCircle,
  Clock, ShieldAlert, Database
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const SecurityManagement = () => {
  const [activeTab, setActiveTab] = useState("access");

  // Audit Trail Mock Data
  const [liveLogs, setLiveLogs] = useState([]);
  const role = sessionStorage.getItem("role") || "Admin";  const [stats, setStats] = useState({ active_sessions: 0, audit_status: 'Syncing...', backup_status: 'Active' });

  const handleToggle = async (settingName, value) => {
    try {
      const hospitalId = sessionStorage.getItem("hospital_id") || 1;
      await axios.put(`http://localhost:8000/api/v1/admin/security/update-config/${hospitalId}`, { 
        [settingName]: value 
      });
      toast.success(`${settingName.replace('_', ' ').toUpperCase()} Updated`);
    } catch (err) {
      toast.error("Failed to update security policy");
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true; // Prevents memory leaks
  
    const fetchSecurityData = async () => {
      try {
        const hospitalId = sessionStorage.getItem("hospital_id") || 1;
        const res = await axios.get(
          `http://localhost:8000/api/v1/admin/security/stats/${hospitalId}?user_role=${role}`
        );
        console.log("Full Security Response:", res.data); // CHECK THIS IN CONSOLE
        // Only update if the component is still visible and data exists
        if (isMounted && res.data) {
          setStats(res.data);
          setLiveLogs(res.data.logs || []);        }
        
      } catch (err) {
        if (isMounted) {
          console.error("Security sync failed", err);
        }
      }
    };
  
    fetchSecurityData();
  
    return () => { isMounted = false; }; // Cleanup function
  }, [role]);
  
  return (
    <div style={styles.container}>
      <Toaster />
      
      {/* MODULE HEADER */}
      <header style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>MANAGEMENT / SECURITY OPERATIONS</div>
          <h2 style={styles.title}>Security Management</h2>
          <p style={styles.subtitle}>Protecting the "Digital Spine" with AES-256 Governance</p>
        </div>
        <div style={styles.statusBadge}>
          <ShieldCheck size={16} color="#10b981" />
          <span>ENCRYPTION ACTIVE</span>
        </div>
      </header>

     {/* SECURITY METRICS */}
{/* SECURITY METRICS */}
<div style={styles.metricGrid}>
  <MetricCard 
    icon={<UserCheck size={20}/>} 
    label="Active Sessions" 
    value={`${stats.active_sessions ?? 0} Nodes`} 
    sub="Verified Personnel" 
  />
  <MetricCard 
    icon={<History size={20}/>} 
    label="Audit Integrity" 
    value={stats?.audit_status || 'Checking...'} 
    sub="100% Logs Synced" 
  />
  <MetricCard 
    icon={<HardDrive size={20}/>} 
    label="Disaster Recovery" 
    value={stats?.backup_status || 'Active'} 
    sub="Cloud + Local Sync" 
  />
</div>
      {/* CORE INTERFACE */}
      <div style={styles.contentCard}>
        <div style={styles.sidebarNav}>
          <TabButton active={activeTab === "access"} onClick={() => setActiveTab("access")} icon={<Lock size={16}/>} label="Access Control" />
          <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")} icon={<Clock size={16}/>} label="Activity Logs" />        </div>

        <div style={styles.viewPort}>
          {activeTab === "access" && (
            <div className="fade-in">
              <h4 style={styles.viewTitle}>Role-Based Access Control (RBAC)</h4>
              <SecurityToggle 
      label="Multi-Factor Authentication (MFA)" 
      desc="Enforce mobile OTP for all Master Admin logins." 
      checked={stats.mfa_enabled} // Linked to DB state
      onChange={(val) => handleToggle('mfa_enabled', val)} // API call
    />

    <SecurityToggle 
      label="IP Whitelisting" 
      desc="Restrict dashboard access to hospital-registered network IPs." 
      checked={stats.ip_whitelist_enabled} // Linked to DB state
      onChange={(val) => handleToggle('ip_whitelist_enabled', val)} // API call
    />
              <div style={styles.settingBox}>
                <label style={styles.label}>SESSION EXPIRATION</label>
                <select style={styles.input}>
                  <option>30 Minutes (Recommended)</option>
                  <option>60 Minutes</option>
                  <option>8 Hours (End of Shift)</option>
                </select>
              </div>
            </div>
          )}

         
{activeTab === "logs" && (
  <div className="fade-in">
    <div style={styles.viewHeader}>
      <h4 style={styles.viewTitle}>Live System Audit Trail</h4>
      <button style={styles.secondaryBtn}><Download size={14}/> Export CSV</button>
    </div>
    <table style={styles.table}>
      <thead>
        <tr style={styles.th}>
          <th>TIMESTAMP</th>
          <th>PERSONNEL</th>
          <th>NODE</th>
          <th>ACTION EXECUTED</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
  {liveLogs.map((log) => (
    <tr key={log.id} style={styles.tr}>
      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
      <td style={{ fontWeight: '700' }}>{log.personnel}</td>
      <td><span style={styles.nodeBadge}>{log.node}</span></td>
      <td>{log.action_executed}</td>
      <td style={{ 
        color: log.status === 'Blocked' ? '#ef4444' : '#10b981', 
        fontWeight: '700' 
      }}>
        {log.status}
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}

          
          
        </div>
      </div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */
const MetricCard = ({ icon, label, value, sub }) => (
  <div style={styles.metricCard}>
    <div style={styles.metricIcon}>{icon}</div>
    <div>
      <p style={styles.metricLabel}>{label}</p>
      <h3 style={styles.metricValue}>{value}</h3>
      <p style={styles.metricSub}>{sub}</p>
    </div>
  </div>
);

// 2. TabButton: Needed for the sidebar navigation
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    ...styles.tabBtn,
    backgroundColor: active ? '#10b981' : 'transparent',
    color: active ? '#fff' : '#64748b'
  }}>
    {icon} {label}
  </button>
);

// 3. SecurityToggle: Needed for the Access Control view
// Update this helper component at the bottom of your file
const SecurityToggle = ({ label, desc, checked, onChange }) => (
  <div style={styles.toggleRow}>
    <div>
      <p style={{margin: 0, fontWeight: '700', fontSize: '14px'}}>{label}</p>
      <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>{desc}</p>
    </div>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} // Trigger the API call
      style={{cursor: 'pointer', width: '18px', height: '18px'}} 
    />
  </div>
);


/* --- STYLES OBJECT --- */
const styles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  breadcrumb: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' },
  title: { margin: '4px 0', fontSize: '32px', fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: '14px', color: '#64748b' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' },
  metricCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'center' },
  metricIcon: { backgroundColor: '#f1f5f9', color: '#10b981', padding: '12px', borderRadius: '12px' },
  metricLabel: { margin: 0, fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  metricValue: { margin: '2px 0', fontSize: '20px', fontWeight: '800', color: '#1e293b' },
  metricSub: { margin: 0, fontSize: '12px', color: '#64748b' },

  contentCard: { backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', minHeight: '500px', overflow: 'hidden' },
  sidebarNav: { width: '260px', borderRight: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fcfcfd' },
  tabBtn: { border: 'none', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700', textAlign: 'left', transition: '0.2s' },
  viewPort: { flex: 1, padding: '40px' },
  
  viewTitle: { margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '16px' },
  settingBox: { marginTop: '24px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '8px' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', outline: 'none' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', fontSize: '12px', color: '#94a3b8' },
  tr: { borderBottom: '1px solid #f8fafc', fontSize: '13px' },
  nodeBadge: { backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' },
  
  viewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  secondaryBtn: { backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  primaryBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  backupAlert: { backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center' }
};

export default SecurityManagement;