import React, { useState, useEffect } from "react";
import { 
  Building2, CreditCard, Lock, ArrowLeft, Zap, Bell, ChevronRight, 
  Globe, FileText, AlertTriangle, Edit3, ShieldCheck 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";


const SystemConfig = () => {
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    hospitalName: "NexHealth Digital Facility",
    branchCode: "NX-MUM-01",
    currency: "INR (₹)",
    taxRate: 18,
    sessionTimeout: 45,
    mfaEnabled: true,
    emailAlerts: true
  });

  // State to track which node is being edited (null = none)
  const [editingNode, setEditingNode] = useState(null);
  const [tempValue, setTempValue] = useState("");

  
  useEffect(() => {
    const loadConfig = async () => {
      const h_id = localStorage.getItem("hospital_id");
      if (!h_id) return;
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/admin/config/${h_id}`);
        setConfig({
          hospitalName: res.data.hospital_name || "NexHealth Digital Facility",
          branchCode: res.data.branch_code || "NX-MUM-01",
          taxRate: res.data.tax_rate || 18,
          currency: res.data.currency || "INR (₹)",
          sessionTimeout: res.data.session_timeout || 45,
          mfaEnabled: res.data.mfa_enabled ?? true,
          emailAlerts: res.data.email_alerts ?? true
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadConfig();
  }, []);

// 2. GLOBAL SYNC TO BACKEND
const handleGlobalSync = async () => {
  setLoading(true);
  const h_id = localStorage.getItem("hospital_id");
  try {
    await axios.put(`http://localhost:8000/api/v1/admin/config/${h_id}`, {
      hospital_name: config.hospitalName,
      branch_code: config.branchCode,
      tax_rate: config.taxRate,
      currency: config.currency,
      session_timeout: config.sessionTimeout,
      mfa_enabled: config.mfaEnabled,
      email_alerts: config.emailAlerts
    });
    toast.success("Master Control: Infrastructure Nodes Synchronized");
  } catch (err) {
    toast.error("Sync Failed: Ensure backend models match this data structure");
  } finally {
    setLoading(false);
  }
};

const handleEditClick = (nodeKey, currentVal) => {
  setEditingNode(nodeKey);
  setTempValue(currentVal);
};
const handleSaveLocal = () => {
  setConfig(prev => ({ ...prev, [editingNode]: tempValue }));
  setEditingNode(null);
  toast.success("Changes staged locally. Click 'Update Infrastructure' to save permanently.");
};

  const handleChange = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  
  
  
  /* --- SHARED UI COMPONENTS --- */
  const DetailHeader = ({ title, subtitle, onBack, onSync }) => (
    <div style={styles.detailHeaderArea}>
      <div>
        <button onClick={onBack} style={styles.backBtnStyle}>
          <ArrowLeft size={14} /> Return to Infrastructure Hub
        </button>
        <h2 style={styles.detailTitle}>{title}</h2>
        <p style={styles.detailSubtitle}>● {subtitle}</p>
      </div>
      <button 
        style={styles.primaryBtn} 
        onClick={onSync} 
        disabled={loading}
      >
        <Zap size={16} /> {loading ? "Syncing..." : "Update Infrastructure"}
      </button>
    </div>
  );

  /* --- SUB-COMPONENTS --- */
const NavCard = ({ icon, bg, title, desc, onClick }) => (
  <div style={styles.navCard} onClick={onClick}>
    <div style={{...styles.cardIconBox, backgroundColor: bg}}>{icon}</div>
    <h3 style={styles.cardTitle}>{title}</h3>
    <p style={styles.cardDesc}>{desc}</p>
    <div style={styles.cardFooter}>Manage Settings <ChevronRight size={14} /></div>
  </div>
);
const InfoCard = ({ icon, iconBg, label, value, subText, badge, badgeColor, badgeBg, isStatic, onEdit }) => (
  <div style={styles.borderedCard}>
    <div style={styles.cardHeaderSmall}>
      <div style={{...styles.iconBox, backgroundColor: iconBg}}>{icon}</div>
      <h4 style={styles.cardTitleSmall}>{label}</h4>
    </div>
    <div style={{ padding: '20px' }}>
      <h3 style={styles.mainValue}>{value}</h3>
      <p style={styles.subLabel}>{subText}</p>
      <div style={styles.cardFooterRow}>
        <div style={{...styles.badge, color: badgeColor || '#166534', backgroundColor: badgeBg || '#f0fdf4'}}>{badge}</div>
        {!isStatic && (
          <button 
            type="button" 
            style={{...styles.cardActionBtn, padding: '8px'}} // Added extra padding for easier clicking
            onClick={() => {
              console.log("Edit button clicked for:", label); // Verify in F12 console
              onEdit();
            }}
          >
            <Edit3 size={14} />
          </button>
        )}
      </div>
    </div>
  </div>
);

  return (
    <div style={styles.container}>
      <Toaster />
      
      {/* 1. MASTER HEADER */}
      <header style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>ADMINISTRATION / MASTER CONTROL</div>
          <h2 style={styles.title}>System Configuration</h2>
        </div>
        <div style={styles.statusBadge}>
          <span style={styles.pulseDot}></span> SYSTEM OPERATIONAL
        </div>
      </header>

      {/* 2. GLOBAL MODAL OVERLAY (Node Editing) */}
      {editingNode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                Update {
                  editingNode === 'hospitalName' ? 'Hospital Name' : 
                  editingNode === 'branchCode' ? 'Branch Identifier' :
                  editingNode === 'taxRate' ? 'Taxation Percentage' : 
                  'System Currency'
                }
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <label style={styles.label}>SYSTEM DATA ENTRY</label>
              <input 
                autoFocus
                style={{...styles.input, width: '100%', boxSizing: 'border-box', marginTop: '8px'}}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="Enter new value..."
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setEditingNode(null)} style={styles.cancelBtn}>
                  Discard
                </button>
                <button onClick={handleSaveLocal} style={{ ...styles.saveBtn, flex: 2, marginTop: 0 }}>
                  Apply to Infrastructure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC CONTENT AREA */}
      {view === "overview" ? (
        /* --- INFRASTRUCTURE HUB --- */
        <div style={styles.cardGrid}>
          <NavCard 
            icon={<Building2 size={24} color="#10b981" />} 
            bg="#f0fdf4" title="Hospital Identity" 
            desc="Set display names, branch identifiers, and regional locales."
            onClick={() => setView("general")}
          />
          <NavCard 
            icon={<CreditCard size={24} color="#8b5cf6" />} 
            bg="#f5f3ff" title="Revenue Logic" 
            desc="Configure GST rates, invoice prefixes, and currency defaults."
            onClick={() => setView("billing")}
          />
          <NavCard 
            icon={<Lock size={24} color="#ef4444" />} 
            bg="#fef2f2" title="Security Protocols" 
            desc="Manage session timeouts, MFA, and access hardening."
            onClick={() => setView("security")}
          />
          
        </div>
      ) : (
        /* --- NODE DETAIL VIEWS --- */
        <div className="fade-in">
          
          {/* A. HOSPITAL IDENTITY NODE */}
          {view === "general" && (
            <div>
              <DetailHeader 
                title="Hospital Infrastructure" 
                subtitle="System Identity Verified and Synced" 
                onBack={() => setView("overview")}
                onSync={handleGlobalSync}
              />
              <div style={styles.infraGrid}>
                <InfoCard 
                  icon={<Building2 size={18} color="#10b981" />}
                  iconBg="#f0fdf4"
                  label="Hospital Node"
                  value={config.hospitalName}
                  subText="Display Name"
                  badge="HFR-7 (Active)"
                  onEdit={() => handleEditClick("hospitalName", config.hospitalName)}
                />
                <InfoCard 
                  icon={<Globe size={18} color="#3b82f6" />}
                  iconBg="#eff6ff"
                  label="Branch Identifier"
                  value={config.branchCode}
                  subText="Network Branch Code"
                  badge="Verified Node"
                  onEdit={() => handleEditClick("branchCode", config.branchCode)}
                />
                <InfoCard 
                  icon={<FileText size={18} color="#6366f1" />}
                  iconBg="#e0e7ff"
                  label="License Protocol"
                  value="REG-MH-2026-X100"
                  subText="Medical License"
                  badge="Expires: 31 Mar"
                  isStatic
                />
              </div>
            </div>
          )}

          {/* B. REVENUE & FISCAL NODE */}
          {view === "billing" && (
            <div>
              <DetailHeader 
                title="Revenue & Fiscal Infrastructure" 
                subtitle="Financial Logic Verified and Synced" 
                onBack={() => setView("overview")}
                onSync={handleGlobalSync}
              />
              <div style={styles.infraGrid}>
                <InfoCard 
                  icon={<Zap size={18} color="#8b5cf6" />}
                  iconBg="#f5f3ff"
                  label="Taxation Protocol"
                  value={`${config.taxRate}%`}
                  subText="Standard GST Rate"
                  badge="Live Calculation"
                  badgeColor="#5b21b6"
                  badgeBg="#ede9fe"
                  onEdit={() => handleEditClick("taxRate", config.taxRate)}
                />
                <InfoCard 
                  icon={<CreditCard size={18} color="#059669" />}
                  iconBg="#ecfdf5"
                  label="Base Currency"
                  value={config.currency}
                  subText="Regional Settlement"
                  badge="Primary Node"
                  badgeColor="#065f46"
                  badgeBg="#d1fae5"
                  onEdit={() => handleEditClick("currency", config.currency)}
                />
                <InfoCard 
                  icon={<FileText size={18} color="#3b82f6" />}
                  iconBg="#eff6ff"
                  label="Invoice Sequence"
                  value="NX-INV-2026"
                  subText="Automatic Prefix"
                  badge="Active"
                  isStatic
                />
              </div>
            </div>
          )}

          {/* C. FORM-BASED SETTINGS (Security/Notifications) */}
          {view === "security" && (
            <div>
              <DetailHeader 
                title="Security & Access Hardening" 
                subtitle="Protocol Layers Verified and Active" 
                onBack={() => setView("overview")}
                onSync={handleGlobalSync}
              />
              <div style={styles.infraGrid}>
                <InfoCard 
                  icon={<Lock size={18} color="#ef4444" />}
                  iconBg="#fef2f2"
                  label="Session Protocol"
                  value={`${config.sessionTimeout} Minutes`}
                  subText="Automatic Inactivity Timeout"
                  badge="Active Protection"
                  badgeColor="#991b1b"
                  badgeBg="#fee2e2"
                  onEdit={() => handleEditClick("sessionTimeout", config.sessionTimeout)}
                />
                <InfoCard 
                  icon={<ShieldCheck size={18} color="#10b981" />}
                  iconBg="#f0fdf4"
                  label="Auth Hardening"
                  value={config.mfaEnabled ? "Multi-Factor ON" : "Multi-Factor OFF"}
                  subText="Identity Verification Layer"
                  badge="Enterprise Grade"
                  badgeColor="#166534"
                  badgeBg="#dcfce7"
                  onEdit={() => handleChange("mfaEnabled", !config.mfaEnabled)} 
                />
                <InfoCard 
                  icon={<Globe size={18} color="#3b82f6" />}
                  iconBg="#eff6ff"
                  label="Encryption Node"
                  value="AES-256-GCM"
                  subText="End-to-End Data Shield"
                  badge="Operational"
                  badgeColor="#1e40af"
                  badgeBg="#dbeafe"
                  isStatic
                />
              </div>

              <div style={{...styles.contextBox, backgroundColor: '#fef2f2', border: '1px solid #fee2e2', marginTop: '30px'}}>
                <Lock size={18} color="#991b1b" />
                <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>
                  Security modifications require a system-wide re-authentication for all active administrative sessions to take effect.
                </p>
              </div>
            </div>
          )}
          {/* D. COMMUNICATIONS & NOTIFICATIONS NODE */}
          {view === "notifications" && (
            <div>
              <DetailHeader 
                title="Communications Hub" 
                subtitle="Notification Gateways Operational" 
                onBack={() => setView("overview")}
                onSync={handleGlobalSync}
              />
              <div style={styles.infraGrid}>
                <InfoCard 
                  icon={<Bell size={18} color="#f59e0b" />}
                  iconBg="#fffbeb"
                  label="Alert Protocol"
                  value={config.emailAlerts ? "Email Alerts Active" : "Alerts Suspended"}
                  subText="System Gateway Status"
                  badge="SMTP Node"
                  badgeColor="#92400e"
                  badgeBg="#fef3c7"
                  onEdit={() => handleChange("emailAlerts", !config.emailAlerts)}
                />
                <InfoCard 
                  icon={<Zap size={18} color="#6366f1" />}
                  iconBg="#e0e7ff"
                  label="Real-time Sync"
                  value="Push Enabled"
                  subText="Socket.io Infrastructure"
                  badge="Low Latency"
                  isStatic
                />
              </div>
            </div>
          )}

          
        </div>
      )}
    </div>
  );

};
/* --- STYLES OBJECT --- */
const styles = {
  container: { padding: "40px", fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "40px" },
  breadcrumb: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px", marginBottom: "4px" },
  title: { margin: 0, fontSize: "32px", fontWeight: "800", color: "#1e293b" },
  statusBadge: { backgroundColor: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', color: '#64748b' },
  pulseDot: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' },
  
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  navCard: { background: "#fff", padding: "30px", borderRadius: "24px", border: "1px solid #f1f5f9", cursor: "pointer", display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  cardIconBox: { marginBottom: '20px', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '17px', fontWeight: '700', margin: '0 0 10px 0', color: '#334155' },
  cardDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0', flex: 1 },
  cardFooter: { fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' },
  
  detailHeaderArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  backBtnStyle: { background: 'none', border: 'none', color: '#10b981', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 },
  detailTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginTop: '12px', marginBottom: '0' },
  detailSubtitle: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  primaryBtn: { background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

  infraGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  borderedCard: { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeaderSmall: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  iconBox: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitleSmall: { fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
  mainValue: { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' },
  subLabel: { fontSize: '11px', color: '#94a3b8', margin: 0 },
  cardFooterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  cardActionBtn: { padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#10b981', cursor: 'pointer' },
  
  contextBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', marginTop: '30px' },
  formContainer: { maxWidth: '500px' },
  settingsCard: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginTop: '20px' },
  formTitle: { fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginBottom: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#64748b' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#fff', width: '400px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid #e2e8f0' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' },
  saveBtn: { background: "#10b981", color: "#fff", padding: "14px", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", width: '100%', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }
};

export default SystemConfig;