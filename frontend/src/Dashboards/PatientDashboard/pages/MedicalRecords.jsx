import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

const MedicalRecords = () => {
  const records = [
    { id: 1, date: '2026-03-15', type: 'Prescription', doctor: 'Dr. Rahul Sharma', status: 'Released' },
    { id: 2, date: '2026-03-10', type: 'Lab Report', doctor: 'Pathology Lab', status: 'Released' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Medical Vault</h2>
      <p style={styles.subtitle}>Access your digital prescriptions and clinical reports.</p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            {/* ✅ Fixed: headerRow is now defined below and accessed via styles.headerRow */}
            <tr style={styles.headerRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Issued By</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} style={styles.row}>
                <td style={styles.td}>{record.date}</td>
                <td style={styles.td}>
                  <div style={styles.typeLabel}><FileText size={14} /> {record.type}</div>
                </td>
                <td style={styles.td}>{record.doctor}</td>
                <td style={styles.td}><span style={styles.statusBadge}>{record.status}</span></td>
                <td style={styles.td}>
                  <button style={styles.actionBtn}><Eye size={16} /></button>
                  <button style={styles.actionBtn}><Download size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ================== STYLES ==================
const styles = {
  container: { padding: '40px 24px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
  subtitle: { color: '#64748b', marginBottom: '32px' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { backgroundColor: '#f8fafc' }, // 👈 Added this missing definition
  th: { textAlign: 'left', padding: '16px 12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '20px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },
  row: { transition: 'background-color 0.2s' },
  typeLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#0f172a' },
  statusBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' },
  actionBtn: { background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '8px', marginRight: '8px', transition: 'all 0.2s' }
};

export default MedicalRecords;