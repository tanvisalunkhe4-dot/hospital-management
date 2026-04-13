import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

const MedicalRecords = () => {
  // Mock data for your dashboard
  const records = [
    { id: 1, date: '2026-03-15', type: 'Prescription', doctor: 'Dr. Rahul Sharma', status: 'Released' },
    { id: 2, date: '2026-03-10', type: 'Lab Report', doctor: 'Pathology Lab', status: 'Released' },
  ];

  return (
    <div style={container}>
      <h2 style={title}>Medical Vault</h2>
      <p style={subtitle}>Access your digital prescriptions and clinical reports.</p>

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>Date</th>
              <th style={th}>Type</th>
              <th style={th}>Issued By</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} style={row}>
                <td style={td}>{record.date}</td>
                <td style={td}>
                  <div style={typeLabel}><FileText size={14} /> {record.type}</div>
                </td>
                <td style={td}>{record.doctor}</td>
                <td style={td}><span style={statusBadge}>{record.status}</span></td>
                <td style={td}>
                  <button style={actionBtn}><Eye size={16} /></button>
                  <button style={actionBtn}><Download size={16} /></button>
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
const container = { padding: '10px' };
const title = { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' };
const subtitle = { color: '#64748b', marginBottom: '24px' };
const tableContainer = { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' };
const td = { padding: '16px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' };
const typeLabel = { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const statusBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginRight: '10px' };

// ✅ THE MISSING LINE:
export default MedicalRecords;