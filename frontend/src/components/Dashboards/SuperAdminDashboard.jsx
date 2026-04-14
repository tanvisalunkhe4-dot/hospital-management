import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { 
  ShieldCheck, Plus, Trash2, Building2, 
  Activity, LogOut, Search, Hospital, 
  MapPin, X, Globe, Clock, Eye, BarChart3, PieChart as PieIcon // Added missing icons
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
// ✅ NEW UPDATED IMPORT
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
   Area,LineChart, Line
} from 'recharts';
// --- THEME ---
const theme = {
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    secondary: '#f59e0b',
    background: '#f8fafc',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    white: '#ffffff',
    danger: '#ef4444',
    chart: ['#10b981', '#059669', '#34d399', '#065f46', '#6ee7b7'] // Gradients of Green
  }
};
const AnalyticsView = ({ hospitals }) => {
  const safeHospitals = hospitals || [];

  // --- 1. DATA PREPARATION ---
  const categoryData = useMemo(() => {
    const counts = hospitals.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [hospitals]);

  const bedData = useMemo(() => {
    return hospitals.map(h => ({
      name: h.name.length > 10 ? h.name.substring(0, 8) + '..' : h.name,
      beds: Number(h.bed_capacity) || 0
    })).sort((a, b) => b.beds - a.beds).slice(0, 5);
  }, [hospitals]);

 // Example of what 100% live logic would look like
 const growthData = useMemo(() => {
  // We'll use a simple array to represent the growth trend
  return [
    { month: 'Jan', nodes: 2 }, // Baseline
    { month: 'Feb', nodes: 5 }, // Baseline
    { 
      month: 'Mar', 
      nodes: safeHospitals.length // 100% LIVE data for current month
    }, 
  ];
}, [safeHospitals.length]); // Only recalculate when the number of hospitals changes
  const uniqueDistricts = useMemo(() => {
    return new Set(hospitals.map(h => h.city)).size;
  }, [hospitals]);

  // --- 2. RENDER ---
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      
      {/* TIER 1: QUICK INSIGHT CARDS */}
      
      {/* TIER 2: GROWTH & DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Growth Area Chart */}
        
        <div style={analyticsCard}>
          <div style={chartHeader}>
            <div style={smallIconBox}><Activity size={16} color={theme.colors.primary} /></div>
            <h3 style={chartTitle}>Infrastructure Deployment Scale</h3>
          </div>
          <div style={{ height: '280px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8'}} 
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: theme.colors.primary, strokeWidth: 1 }} />
                <Line 
                  type="stepAfter" // This creates the professional "stepped" look
                  dataKey="nodes" 
                  stroke={theme.colors.primary} 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: theme.colors.primary, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>    

        {/* Donut Distribution */}
        <div style={analyticsCard}>
          <div style={chartHeader}>
            <div style={smallIconBox}><PieIcon size={16} color={theme.colors.primary} /></div>
            <h3 style={chartTitle}>Facility Distribution</h3>
          </div>
          <div style={{ height: '280px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: 'none' }}>
                <Pie 
                  data={categoryData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={theme.colors.chart[index % theme.colors.chart.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={donutCenterLabel}>
              <span style={{fontSize: '24px', fontWeight: '800'}}>{hospitals.length}</span>
              <span style={{fontSize: '10px', color: '#64748b'}}>TOTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 3: CAPACITY LEADERBOARD */}
      <div style={analyticsCard}>
        <div style={chartHeader}>
          <div style={smallIconBox}>
            <BarChart3 size={16} color={theme.colors.primary} />
          </div>
          <h3 style={chartTitle}>Capacity Leaderboard (Beds)</h3>
        </div>
        
        <div style={{ height: '320px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bedData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                width={45} 
                tickCount={6} 
              />
              <Tooltip cursor={{ fill: '#f8fafc', radius: 6 }} contentStyle={tooltipStyle} />
              <Bar dataKey="beds" radius={[6, 6, 0, 0]} barSize={38} animationDuration={1500}>
                {bedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={theme.colors.primary} 
                    style={{ filter: `brightness(${1 - index * 0.05})` }} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};


// --- COMPONENT: HOSPITAL QUICK VIEW ---
// --- COMPONENT: HOSPITAL QUICK VIEW & EDIT ---
const HospitalDetailsCard = ({ hospital, onClose, onUpdate }) => {
  // 1. Unified State Management
  const [formData, setFormData] = useState({
    name: hospital?.name || '',
    hfrId: hospital?.hfr_id || hospital?.hfrId || '',
    email: hospital?.admin_email || hospital?.email || '',
    phone: hospital?.phone || '',
    category: hospital?.category || 'Private',
    type: hospital?.facility_type || hospital?.type || '',
    address: hospital?.address || '',
    city: hospital?.city || '',
    state: hospital?.state || '',
    bedCapacity: hospital?.bed_capacity || hospital?.bedCapacity || 0
  });

  const [isUpdating, setIsUpdating] = useState(false);

  if (!hospital) return null;

  // 2. Save Logic
  const handleSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:8000/api/v1/superadmin/hospitals/${hospital.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(); 
      onClose();
    } catch (err) {
      alert("Update failed. Check if the HFR ID is unique.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Render
  return (
    <div style={overlayStyle}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        style={{...modalCardStyle, maxWidth: '600px', padding: '0', overflow: 'hidden'}}
      >
        <div style={{ height: '6px', background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primaryDark})` }} />
        
        <form onSubmit={handleSave} style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={titleStyle}>Edit Facility Registry</h2>
            <button type="button" onClick={onClose} style={closeBtn}><X size={20} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>Facility Name</label>
              <input 
                style={inputStyle} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>HFR ID</label>
              <input 
                style={inputStyle} 
                value={formData.hfrId} 
                onChange={(e) => setFormData({...formData, hfrId: e.target.value})} 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Bed Capacity</label>
              <input 
                type="number" 
                style={inputStyle} 
                value={formData.bedCapacity} 
                onChange={(e) => setFormData({...formData, bedCapacity: e.target.value})} 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Category</label>
              <select 
                style={selectStyle} 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Trust">Trust</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button type="submit" style={submitButtonStyle} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Update Node"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- COMPONENT: SYSTEM LOGS ---
const SystemLogs = ({ logs }) => (
  <div style={tableCard}>
    <div style={tableHeader}>
      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
        <Clock size={18} color={theme.colors.primary} />
        <h3 style={{margin:0, fontSize:'16px', fontWeight:'800'}}>Network Audit Trail</h3>
      </div>
    </div>
    <div style={{maxHeight: '400px', overflowY: 'auto', padding: '10px'}}>
      {logs.map((log, index) => (
        <div key={index} style={logEntryStyle}>
          <div style={logTimeStyle}>{log.time}</div>
          <div style={logBadgeStyle(log.type)}>{log.type}</div>
          <div style={logMessageStyle}>{log.message}</div>
        </div>
      ))}
    </div>
  </div>
);

// --- COMPONENT: ADD HOSPITAL (PRO VERSION) ---
const AddHospital = ({ onSuccess, onCancel }) => {
  const [hospitalData, setHospitalData] = useState({
    name: '', hfrId: '', email: '', phone: '',
    category: 'Private', type: 'Multi-Specialty',
    address: '', city: 'Pune', state: 'Maharashtra', bedCapacity: 0
  });
  const [status, setStatus] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await new Promise(resolve => setTimeout(resolve, 800));
      await axios.post('http://127.0.0.1:8000/api/v1/superadmin/hospitals/register', hospitalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      // Small delay to let the user see the "Success" state
      setTimeout(() => {
        onSuccess();
      }, 600);
    } catch (error) { 
      alert("Registration failed. Ensure ABDM HFR ID is unique."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div style={overlayStyle}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{...modalCardStyle, maxWidth: '850px'}}>
        <div style={modalHeaderStyle}>
          <div style={iconBox}><Building2 color={theme.colors.primary} /></div>
          <h2 style={titleStyle}>Provision Medical Node</h2>
          <p style={{color: theme.colors.textMuted, marginTop: '4px'}}>Register a new facility into the healthcare ecosystem.</p>
          <button onClick={onCancel} style={closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{...gridStyle, gridTemplateColumns: '1fr 1fr 1fr'}}>
            <div style={inputGroup}><label style={labelStyle}>Facility Name</label>
              <input type="text" placeholder="Ruby Hall Clinic" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, name: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>ABDM HFR ID</label>
              <input type="text" placeholder="HFR-102-XXXX" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, hfrId: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>Admin Email</label>
              <input type="email" placeholder="admin@hospital.com" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, email: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>Phone Number</label>
              <input type="tel" placeholder="+91 XXXX" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, phone: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>Category</label>
              <select style={selectStyle} onChange={(e) => setHospitalData({...hospitalData, category: e.target.value})}>
                <option value="Private">Private</option><option value="Government">Government</option><option value="Trust">Trust</option>
              </select>
            </div>
            <div style={inputGroup}><label style={labelStyle}>Facility Type</label>
              <input type="text" placeholder="General/Multi-Specialty" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, type: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>City</label>
              <input type="text" placeholder="Pune" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, city: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>State</label>
              <input type="text" placeholder="Maharashtra" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, state: e.target.value})} required />
            </div>
            <div style={inputGroup}><label style={labelStyle}>Bed Capacity</label>
              <input type="number" placeholder="100" style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, bedCapacity: parseInt(e.target.value) || 0})} required />
            </div>
            <div style={{...inputGroup, gridColumn: 'span 3'}}>
              <label style={labelStyle}>Full Physical Address</label>
              <input type="text" placeholder="Building Name, Street, Landmark..." style={inputStyle} onChange={(e) => setHospitalData({...hospitalData, address: e.target.value})} required />
            </div>
          </div>
          <div style={{display: 'flex', gap: '16px', marginTop: '10px'}}>
             <button type="button" onClick={onCancel} style={secondaryBtn}>Discard</button>
             <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
               {isSubmitting ? "Syncing..." : "Initialize Hospital"}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const SuperAdminDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [currentView, setCurrentView] = useState('registry'); // 'registry' or 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([
    { time: '14:02', type: 'SYSTEM', message: 'Cloud gateway synchronized.' },
    { time: '14:05', type: 'AUTH', message: 'SuperAdmin session established.' }
  ]);

  const addLog = (type, message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [{ time, type, message }, ...prev].slice(0, 12));
  };

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/v1/superadmin/hospitals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitals(response.data);
      addLog('SYNC', `Pulled ${response.data.length} registry nodes.`);
    } catch (err) { 
      addLog('ERROR', 'Connection to registry failed.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Decommission ${name}? This revokes all node access.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:8000/api/v1/superadmin/hospitals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addLog('DELETE', `${name} decommissioned.`);
        fetchHospitals(); 
      } catch (err) { addLog('ERROR', 'Deletion failed.'); }
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.hfr_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <h1 style={logoStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></h1>
          <div style={badgeStyle}>Master Control</div>
        </div>
        <nav style={navStyle}>
  <div 
    onClick={() => setCurrentView('registry')} // <-- Must be a function
    style={currentView === 'registry' ? navItemActive : navItem}
  >
    <Globe size={18} /> Node Registry
  </div>

  <div 
    onClick={() => setCurrentView('analytics')} // <-- Must be a function
    style={currentView === 'analytics' ? navItemActive : navItem}
  >
    <Activity size={18} /> Analytics
  </div>
</nav>
        <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={logoutBtn}>
          <LogOut size={18} /> Terminate
        </button>
      </aside>

      <main style={mainContent}>
        <header style={headerStyle}>
          <div>
          <h2 style={greetingStyle}>
              {currentView === 'registry' ? 'Infrastructure Overview' : 'Network Analytics'}
            </h2>
            <p style={subGreeting}>Total Network Nodes: {hospitals.length}</p>
          </div>
          <button onClick={() => setShowAddForm(true)} style={primaryBtn}><Plus size={20} /> Register Facility</button>
        </header>

        <div style={statsRow}>
          <div style={statCard}>
            <div style={statHeader}><span style={statLabel}>Network Capacity</span><div style={onlineDot} /></div>
            <span style={statValue}>{hospitals.length} Units</span>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Total Managed Beds</span>
            <span style={statValue}>
              {hospitals.reduce((acc, curr) => acc + (Number(curr.bed_capacity) || 0), 0)}
            </span>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Engine Status</span>
            <span style={{...statValue, color: theme.colors.primary}}>Stable</span>
          </div>
        </div>

        {/* --- DYNAMIC VIEW TOGGLE --- */}
        {currentView === 'registry' ? (
          <div style={dashboardGrid}>
            <div style={tableCard}>
              <div style={tableHeader}>
                <div style={searchWrapper}>
                  <Search size={18} color={theme.colors.textMuted} />
                  <input placeholder="Filter..." style={searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr style={headerRowStyle}>
                    <th style={thStyle}>Facility Name</th>
                    <th style={thStyle}>HFR ID</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" style={loadingTd}>Syncing Records...</td></tr>
                  ) : filteredHospitals.map((h) => (
                    <tr key={h.id} style={rowStyle}>
                      <td style={tdStyle}><strong>{h.name}</strong></td>
                      <td style={tdStyle}><code style={hfrBadge}>{h.hfr_id}</code></td>
                      <td style={tdStyle}>
                        <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => setSelectedHospital(h)} style={viewBtn}>
  <Eye size={16} />
</button>                          <button onClick={() => handleDelete(h.id, h.name)} style={deleteBtn}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SystemLogs logs={logs} />
          </div>
        ) : (
          <AnalyticsView hospitals={hospitals} />
        )}
      </main>

      <AnimatePresence>
  {selectedHospital && (
    <HospitalDetailsCard 
      hospital={selectedHospital} 
      onClose={() => setSelectedHospital(null)} 
      onUpdate={fetchHospitals} 
    />
  )}
        {showAddForm && <AddHospital onSuccess={() => { setShowAddForm(false); addLog('CREATE', 'Node provisioned'); fetchHospitals(); }} onCancel={() => setShowAddForm(false)} />}
      </AnimatePresence>
    </div>
  );
};

// --- STYLES (Keep existing ones, but ensure analyticsGrid and Card are included) ---
const analyticsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const analyticsCard = { background: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${theme.colors.border}`, minHeight: '400px' };
const chartHeader = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };
const chartTitle = { fontSize: '18px', fontWeight: '800', margin: 0 };
const pageStyle = { display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: "'Inter', sans-serif" };
const sidebarStyle = { width: '280px', backgroundColor: theme.colors.white, borderRight: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 };
const logoStyle = { fontSize: '1.8rem', fontWeight: '900', color: theme.colors.textDark, letterSpacing: '-0.05em', margin: 0 };
const badgeStyle = { fontSize: '11px', fontWeight: '800', color: theme.colors.secondary, background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginTop: '8px', textTransform: 'uppercase' };
const navStyle = { padding: '20px', flex: 1 };
const navItemActive = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: '#f0fdf4', color: theme.colors.primary, borderRadius: '12px', fontWeight: '700', marginBottom: '8px', cursor: 'pointer' };
const navItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', color: theme.colors.textMuted, borderRadius: '12px', fontWeight: '600', marginBottom: '8px', cursor: 'pointer' };
const logoutBtn = { margin: '20px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `1px solid #fee2e2`, borderRadius: '12px', color: theme.colors.danger, fontWeight: '700', cursor: 'pointer', backgroundColor: theme.colors.white };
const mainContent = { marginLeft: '280px', flex: 1, padding: '48px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const greetingStyle = { fontSize: '28px', fontWeight: '800', color: theme.colors.textDark, margin: 0 };
const subGreeting = { color: theme.colors.textMuted, margin: '4px 0 0' };
const primaryBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const statsRow = { display: 'flex', gap: '24px', marginBottom: '40px' };
const statCard = { flex: 1, backgroundColor: theme.colors.white, padding: '24px', borderRadius: '20px', border: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column' };
const statLabel = { fontSize: '14px', fontWeight: '600', color: theme.colors.textMuted };
const statValue = { fontSize: '32px', fontWeight: '800', color: theme.colors.textDark, marginTop: '8px' };
const dashboardGrid = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' };
const tableCard = { backgroundColor: theme.colors.white, borderRadius: '24px', border: `1px solid ${theme.colors.border}`, overflow: 'hidden' };
const tableHeader = { padding: '24px', borderBottom: `1px solid #f1f5f9` };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '12px', width: '100%', maxWidth: '300px', border: `1px solid ${theme.colors.border}` };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '18px 24px', backgroundColor: '#f8fafc', color: theme.colors.textMuted, fontSize: '12px', fontWeight: '800', textAlign: 'left', textTransform: 'uppercase' };
const tdStyle = { padding: '20px 24px', borderBottom: `1px solid #f1f5f9`, fontSize: '14px', color: '#475569' };
const headerRowStyle = { borderBottom: `2px solid #f1f5f9` };
const rowStyle = { transition: '0.2s' };
const hfrBadge = { backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', color: theme.colors.primary, fontWeight: '700', fontSize: '12px' };
const deleteBtn = { padding: '10px', backgroundColor: '#fff1f2', color: theme.colors.danger, border: 'none', borderRadius: '8px', cursor: 'pointer' };
const viewBtn = { padding: '10px', backgroundColor: '#f0fdf4', color: theme.colors.primary, border: 'none', borderRadius: '8px', cursor: 'pointer' };
const loadingTd = { padding: '60px', textAlign: 'center', color: '#94a3b8' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalCardStyle = { width: '90%', background: '#fff', borderRadius: '24px', padding: '40px', position: 'relative' };
const modalHeaderStyle = { textAlign: 'center', marginBottom: '32px' };
const closeBtn = { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted };
const iconBox = { width: '50px', height: '50px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: theme.colors.textDark, margin: 0 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
const gridStyle = { display: 'grid', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#334155' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' };
const submitButtonStyle = { width: '100%', padding: '16px', background: theme.colors.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const onlineDot = { width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' };
const statHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const selectStyle = { ...inputStyle, paddingLeft: '16px', appearance: 'none', cursor: 'pointer' };
const secondaryBtn = { flex: 1, padding: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const logEntryStyle = { display: 'flex', gap: '12px', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '12px', alignItems: 'center' };
const logTimeStyle = { fontWeight: '700', color: '#64748b', minWidth: '45px' };
const logMessageStyle = { color: '#0f172a', fontWeight: '500' };

const miniStatCard = {
  background: '#fff',
  padding: '20px',
  borderRadius: '20px',
  border: `1px solid ${theme.colors.border}`,
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};


const smallIconBox = {
  width: '32px',
  height: '32px',
  background: '#ecfdf5',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const donutCenterLabel = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column'
};

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  fontSize: '12px',
  fontWeight: '600'
};
const logBadgeStyle = (type) => ({
  fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
  backgroundColor: type === 'ERROR' ? '#fee2e2' : type === 'DELETE' ? '#fff1f2' : '#f0fdf4',
  color: type === 'ERROR' ? '#ef4444' : type === 'DELETE' ? '#ef4444' : '#10b981',
  textTransform: 'uppercase'
});

export default SuperAdminDashboard;