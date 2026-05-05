
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, LayoutGrid, ShieldCheck, Search,
  UserPlus, PlusCircle, FileText, ArrowRight 
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- SUB-COMPONENTS ---

const LogEntry = ({ time, type, message }) => (
  <div style={logEntryStyle}>
    <span style={logTimeStyle}>{time}</span>
    <span style={logBadgeStyle(type)}>{type}</span>
    <span style={logMessageStyle}>{message}</span>
  </div>
);

// UPDATED: StatCard now accepts an onClick handler for navigation
const StatCard = ({ label, value, isStable, icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ ...statCardStyle, borderLeft: `4px solid ${color}`, cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={statLabelStyle}>{label}</div>
        <div style={statValueStyle}>{value}</div>
      </div>
      <div style={{ ...iconContainer, backgroundColor: `${color}10`, color: color }}>
        {icon}
      </div>
    </div>
    {isStable && <div style={stableBadgeStyle}>● SYSTEM ONLINE</div>}
  </motion.div>
);

const QuickAction = ({ label, icon, onClick, color }) => (
  <button 
    style={actionBtnStyle} 
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#f8fafc";
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#ffffff";
      e.currentTarget.style.borderColor = "#e2e8f0";
    }}
  >
    <div style={{ ...actionIconStyle, backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
    <span style={actionLabelStyle}>{label}</span>
    <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
  </button>
);

// --- MAIN COMPONENT ---

const DashboardView = ({ staff = [], depts = [], logs = [], onNavigate }) => {
  const [deptSearch, setDeptSearch] = useState("");
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const roleCounts = staff.reduce((acc, s) => {
    const roleName = s.role || 'Unassigned';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {});

  // MAPS DATA TO CHART: Automatically handles 4, 5, or more roles
  const roleData = Object.keys(roleCounts).map((role, index) => {
    const nexHealthColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    return {
      name: role,
      value: roleCounts[role],
      color: nexHealthColors[index % nexHealthColors.length]
    };
  });
  const chartData = roleData.length > 0 ? roleData : [{ name: 'Empty', value: 1, color: '#f1f5f9' }];

  const filteredDepts = depts.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      
      {/* HEADER SECTION */}
      <div style={headerSection}>
        <div>
          <h1 style={mainTitle}>Administrative Dashboard</h1>
          <p style={subTitle}>Welcome back, Admin. Today is {today}.</p>
        </div>
        <div style={statusPill}>
          <div style={onlineDot}></div>
          Live Server: NEX-IND-01
        </div>
      </div>

      {/* TIER 1: WORKING STATS */}
      <div style={statsRow}>
        <StatCard 
          label="Total Personnel" 
          value={staff.length} 
          isStable 
          icon={<Users size={20}/>} 
          color="#3b82f6" 
          onClick={() => onNavigate("Staff")} // Links to Staff Registry
        />
        <StatCard 
          label="Active Departments" 
          value={depts.length} 
          icon={<LayoutGrid size={20}/>} 
          color="#10b981" 
          onClick={() => onNavigate("Depts")} // Links to Department Nodes
        />
        <StatCard 
          label="Database Sync" 
          value="Verified" 
          icon={<ShieldCheck size={20}/>} 
          color="#6366f1" 
          onClick={() => onNavigate("Security")} // Links to Security/Logs
        />
      </div>

      <div style={dashboardGrid}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={tableCard}>
            <div style={tableHeader}>
              <div>
                <h3 style={chartTitle}>Departmental Nodes</h3>
                <span style={liveBadge}>LIVE INFRASTRUCTURE</span>
              </div>
              <div style={searchWrapper}>
                <Search size={14} style={{ color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Filter nodes..." 
                  style={searchInput}
                  onChange={(e) => setDeptSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={deptGridStyle}>
              <AnimatePresence>
                {filteredDepts.length > 0 ? (
                  filteredDepts.map((d) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={d.id} 
                      style={deptCardStyle}
                    >
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{d.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{d.location || "General Wing"}</div>
                    </motion.div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>No matching nodes detected.</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={tableCard}>
            <div style={tableHeader}><h3 style={chartTitle}>Personnel Breakdown</h3></div>
            <div style={{ height: '240px', padding: '20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
  <div style={{ width: '50%', height: '100%', position: 'relative' }}>
    {/* CENTER OVERLAY: Shows live total in the middle of the donut */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      textAlign: 'center', pointerEvents: 'none'
    }}>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{staff.length}</div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total</div>
    </div>
    
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={chartData} 
          innerRadius={65} 
          outerRadius={85} 
          paddingAngle={4} // Reduced slightly for more slices
          dataKey="value" 
          stroke="none"
        >
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
        </Pie>
        <Tooltip cornerRadius={8} />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* DYNAMIC LEGEND: Grows automatically based on how many roles you have */}
  <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>    {roleData.map(r => (
      <div key={r.name} style={legendItem}>
        <span style={{ height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: r.color }}></span>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
        <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#1e293b' }}>{r.value}</span>
      </div>
    ))}
  </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={tableCard}>
            <div style={tableHeader}><h3 style={chartTitle}>Quick Management</h3></div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <QuickAction label="Register Staff" icon={<UserPlus size={18}/>} color="#3b82f6" onClick={() => onNavigate("Staff")} />
               <QuickAction label="Add Dept Node" icon={<PlusCircle size={18}/>} color="#10b981" onClick={() => onNavigate("Depts")} />
               <QuickAction label="System Logs" icon={<FileText size={18}/>} color="#6366f1" onClick={() => onNavigate("Security")} />
            </div>
          </div>

          <div style={tableCard}>
  <div style={tableHeader}><h3 style={chartTitle}>Local Node Feed</h3></div>
  <div style={{ padding: '8px 0' }}>
    {logs.length > 0 ? (
      logs.slice(0, 5).map((log, index) => (
        <LogEntry 
          key={log.id || index} 
          time={log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00"} 
          type={log.log_type || "INFO"} 
          message={log.message} 
        />
      ))
    ) : (
      /* Fallback if no logs are in the DB yet */
      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
        Waiting for system activity...
      </div>
    )}
  </div>
</div>

        </div>
      </div>
    </motion.div>
  );
};

// --- UPDATED STYLES ---

const headerSection = { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' };
const mainTitle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' };
const subTitle = { fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' };
const statusPill = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' };
const onlineDot = { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' };

const statsRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "32px" };
const dashboardGrid = { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" };
const tableCard = { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" };
const tableHeader = { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
const chartTitle = { fontSize: "12px", fontWeight: "800", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" };
const liveBadge = { fontSize: '9px', fontWeight: '900', color: '#10b981', marginTop: '4px', display: 'block' };

const searchWrapper = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '600', color: '#1e293b', width: '150px' };

const deptGridStyle = { padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const deptCardStyle = { padding: "18px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" };

const logEntryStyle = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", borderBottom: "1px solid #f8fafc" };
const logTimeStyle = { fontSize: "11px", fontWeight: "700", color: "#94a3b8" };
const logMessageStyle = { fontSize: "13px", fontWeight: "600", color: "#334155" };
const logBadgeStyle = (type) => ({ fontSize: "9px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px", background: type === "AUTH" ? "#ecfdf5" : "#eff6ff", color: type === "AUTH" ? "#059669" : "#2563eb" });

const statCardStyle = { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" };
const iconContainer = { padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statLabelStyle = { fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px", textTransform: 'uppercase' };
const statValueStyle = { fontSize: "26px", fontWeight: "800", color: "#0f172a" };
const stableBadgeStyle = { fontSize: "10px", color: "#10b981", fontWeight: "800", marginTop: "12px" };

const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', width: '100%', transition: 'all 0.2s' };
const actionIconStyle = { padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const actionLabelStyle = { fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const legendItem = { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc' };

export default DashboardView;