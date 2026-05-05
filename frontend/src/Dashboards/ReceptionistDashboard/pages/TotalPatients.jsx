import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Calendar, MoreVertical, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../theme/theme';

const TotalPatients = ({ hosp_id }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/receptionist/patients/all?hosp_id=${hosp_id}`);
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [hosp_id]);

  // Filter logic for search bar
  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone_number.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Patient Directory</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage and view all registered patients</p>
        </div>
        <button style={downloadBtn}>
          <Download size={18} /> Export List
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by name or contact..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={iconBtn}><Filter size={18} /></button>
      </div>

      {/* PATIENT TABLE */}
      <div style={tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading directory...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={thRow}>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Age/Gender</th>
                <th style={thStyle}>Last Visit</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={avatarStyle}>{p.first_name[0]}</div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{p.first_name} {p.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>PID: #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#059669" /> {p.phone_number}
                    </div>
                  </td>
                  <td style={tdStyle}>{p.age} Y / {p.gender}</td>
                  <td style={tdStyle}>{p.last_visit || 'No visits yet'}</td>
                  <td style={tdStyle}>
                    <button style={iconBtn}><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredPatients.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            No patients found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

/* --- STYLES --- */
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const tableContainer = { background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const filterBar = { display: 'flex', gap: '12px' };
const searchWrapper = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { width: '100%', padding: '12px 0', border: 'none', outline: 'none', fontSize: '14px' };
const iconBtn = { padding: '10px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b' };
const downloadBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const thRow = { textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#1e293b' };
const avatarStyle = { width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' };

export default TotalPatients;