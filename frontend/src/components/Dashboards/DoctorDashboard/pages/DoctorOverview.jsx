import React from 'react';
import { Users, FileCheck, Clock, AlertTriangle, TrendingUp, } from 'lucide-react';


const DoctorOverview = () => {
  const stats = [
    { title: "Today's Patients", value: "12", icon: <Users color="#10b981" />, trend: "+2 from yesterday" },
    { title: "Pending Reports", value: "04", icon: <FileCheck color="#7c3aed" />, trend: "2 Urgent" },
    { title: "Avg. Consult Time", value: "18m", icon: <Clock color="#3b82f6" />, trend: "-2m from avg" },
    { title: "Critical Cases", value: "02", icon: <AlertTriangle color="#ef4444" />, trend: "Stable" },
  ];

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    statTitle: { fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '600' },
    statValue: { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0' },
    trend: { fontSize: '12px', marginTop: '8px', color: '#10b981', fontWeight: '600' },
    sectionTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }
  };

  return (
    <div>
      {/* Stat Cards Row */}
      <div style={styles.grid}>
        {stats.map((s, i) => (
          <div key={i} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>{s.icon}</div>
              <TrendingUp size={16} color="#cbd5e1" />
            </div>
            <p style={styles.statTitle}>{s.title}</p>
            <h2 style={styles.statValue}>{s.value}</h2>
            <p style={{ ...styles.trend, color: s.title === "Critical Cases" ? '#ef4444' : '#10b981' }}>{s.trend}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Consultation Volume Chart */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Consultation Volume</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
             {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
               <div key={i} style={{ flex: 1, backgroundColor: i === 3 ? '#10b981' : '#e2e8f0', height: `${h}%`, borderRadius: '4px' }}></div>
             ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Right: Urgent Alerts */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Urgent Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', borderLeft: '4px solid #ef4444', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Lab Result: Janavi Patil</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>High Glucose Level detected</p>
            </div>
            <div style={{ padding: '12px', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>System Update</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#b45309' }}>New Prescription modules active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;