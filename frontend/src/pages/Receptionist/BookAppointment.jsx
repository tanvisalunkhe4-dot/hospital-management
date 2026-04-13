import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Clock, User, MessageSquare, 
  CheckCircle, MoreVertical, ExternalLink, XCircle, LogIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../theme/theme';

const BookAppointment = ({ hosp_id, appointmentsList, refresh }) => {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [rescheduleData, setRescheduleData] = useState(null); 
  const [appointmentData, setAppointmentData] = useState({
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });

  // --- DATE FILTERING LOGIC ---
  const getMidnight = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const tomorrowTms = getMidnight(new Date().setDate(new Date().getDate() + 1));
  const sevenDaysLaterTms = getMidnight(new Date().setDate(new Date().getDate() + 7));

  const upcomingSchedule = (appointmentsList || []).filter(appt => {
    const apptTms = getMidnight(appt.appointment_date);
    return apptTms >= tomorrowTms && apptTms <= sevenDaysLaterTms;
  }).sort((a, b) => getMidnight(a.appointment_date) - getMidnight(b.appointment_date));

  // --- EFFECTS ---
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  // --- API HANDLERS ---
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleData) return;
    setLoading(true);

    try {
      const url = `http://localhost:8000/api/v1/receptionist/appointments/${rescheduleData.id}?hosp_id=${hosp_id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appointment_date: rescheduleData.appointment_date, 
          appointment_time: rescheduleData.appointment_time 
        })
      });

      if (res.ok) {
        setRescheduleData(null);
        setActiveMenuId(null);
        if (refresh) refresh(); else window.location.reload(); 
      } else {
        const errorData = await res.json();
        const detail = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
        alert(`Update Failed: ${detail}`);
      }
    } catch (err) { 
      console.error("Reschedule failed:", err);
    } finally { setLoading(false); }
  };

  const handleCancel = async (apptId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${apptId}?hosp_id=${hosp_id}`, {
          method: 'DELETE'
        });
        if (res.ok) if (refresh) refresh(); else window.location.reload();
      } catch (err) { console.error("Cancellation failed:", err); }
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/receptionist/patients/search?query=${query}&hosp_id=${hosp_id}`);
        setSearchResults(await res.json());
      } catch (err) { console.error("Search failed:", err); }
    } else setSearchResults([]);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/receptionist/book-appointment?hosp_id=${hosp_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...appointmentData, patient_id: selectedPatient.id, hospital_id: hosp_id })
      });
      if (response.ok) {
        setIsSuccess(true);
        // Clear Form Data
        setSearchQuery("");
        setSelectedPatient(null);
        setAppointmentData({ doctor_name: "", appointment_date: "", appointment_time: "", reason: "" });
        
        // Refresh data and hide success after delay
        if (refresh) refresh();
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) { 
      console.error("Booking failed:", err); 
    } finally { setLoading(false); }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SECTION 1: BOOKING FORM */}
      <div style={containerStyle}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.text, margin: 0 }}>Schedule New Appointment</h3>
          <AnimatePresence>
            {isSuccess && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={successToast}>
                <CheckCircle size={16} /> Appointment Scheduled!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div style={searchWrapper}>
            <Search size={18} color={theme.colors.subtitle} style={{ marginLeft: '12px' }} />
            <input type="text" placeholder="Search patient by name or phone..." style={searchInput} value={searchQuery} onChange={handleSearch} />
          </div>
          {searchResults.length > 0 && (
            <div style={dropdownStyle}>
              {searchResults.map(p => (
                <div key={p.id} onClick={() => { setSelectedPatient(p); setSearchResults([]); setSearchQuery(`${p.first_name} ${p.last_name}`); }} style={resultItem}>
                  <div style={avatarMini}>{p.first_name[0]}</div>
                  <div><strong>{p.first_name} {p.last_name}</strong><br/><small>{p.phone_number}</small></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleBook} style={formGrid}>
            <div style={patientBadge}><CheckCircle size={16} /> Selected: {selectedPatient.first_name} {selectedPatient.last_name}</div>
            <div style={inputGroup}>
              <label style={labelStyle}>Consultant Name</label>
              <input type="text" required style={inputStyle} value={appointmentData.doctor_name} onChange={(e) => setAppointmentData({...appointmentData, doctor_name: e.target.value})}/>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Reason for Visit</label>
              <input type="text" style={inputStyle} value={appointmentData.reason} onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input type="date" required style={inputStyle} value={appointmentData.appointment_date} onChange={(e) => setAppointmentData({...appointmentData, appointment_date: e.target.value})}/>
              <input type="time" required style={inputStyle} value={appointmentData.appointment_time} onChange={(e) => setAppointmentData({...appointmentData, appointment_time: e.target.value})}/>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Processing..." : "Confirm Booking"}</button>
          </motion.form>
        )}
      </div>

      {/* SECTION 2: UPCOMING APPOINTMENTS */}
      <div style={{ ...containerStyle, overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Manage Upcoming Appointments</h3>
          <span style={pillLabel}>Next 7 Days (from tomorrow)</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Patient ID</th>
              <th style={thStyle}>Doctor</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {upcomingSchedule.map((appt) => (
              <tr key={appt.id} style={{ borderBottom: `1px solid #f8fafc` }}>
                <td style={tdStyle}>
                  <strong>{new Date(appt.appointment_date).toLocaleDateString()}</strong> 
                  <span style={timeBadgeStyle}>{appt.appointment_time}</span>
                </td>
                <td style={tdStyle}>#{appt.patient_id}</td>
                <td style={tdStyle}>{appt.doctor_name}</td>
                <td style={tdStyle}>{appt.reason || 'N/A'}</td>
                <td style={tdStyle}>
                  <span style={statusBadgeBlue}>{appt.status || 'Scheduled'}</span>
                </td>
                <td style={{ ...tdStyle, position: 'relative' }}>
                  <div onClick={(e) => toggleMenu(e, appt.id)} style={{ cursor: 'pointer', padding: '4px' }}>
                    <MoreVertical size={18} color="#64748b" />
                  </div>

                  <AnimatePresence>
                    {activeMenuId === appt.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={dropdownMenuStyle}>
                        <button onClick={() => setRescheduleData(appt)} style={menuItemStyle}>
                          <Calendar size={14} /> Reschedule
                        </button>
                        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                        <button onClick={() => handleCancel(appt.id)} style={{ ...menuItemStyle, color: '#ef4444' }}>
                          <XCircle size={14} /> Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
            {upcomingSchedule.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  No upcoming appointments found for the next 7 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RESCHEDULE MODAL */}
      <AnimatePresence>
        {rescheduleData && (
          <div style={modalOverlay}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Reschedule</h3>
                <XCircle cursor="pointer" onClick={() => setRescheduleData(null)} />
              </div>
              <form onSubmit={handleConfirmReschedule} style={formGrid}>
                <div style={inputGroup}>
                  <label style={labelStyle}>New Date</label>
                  <input type="date" required style={inputStyle} value={rescheduleData.appointment_date} onChange={(e) => setRescheduleData({...rescheduleData, appointment_date: e.target.value})}/>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>New Time</label>
                  <input type="time" required style={inputStyle} value={rescheduleData.appointment_time} onChange={(e) => setRescheduleData({...rescheduleData, appointment_time: e.target.value})}/>
                </div>
                <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Updating..." : "Update Schedule"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- STYLES --- */
const containerStyle = { background: 'white', padding: '32px', borderRadius: '24px', border: `1px solid #e2e8f0`, position: 'relative' };
const successToast = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#059669', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', border: '1px solid #10b981' };
const pillLabel = { fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: '#ecfdf5', color: '#059669' };
const searchWrapper = { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { width: '100%', padding: '14px', border: 'none', background: 'transparent', outline: 'none' };
const dropdownStyle = { position: 'absolute', width: '100%', top: '55px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 100 };
const resultItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' };
const avatarMini = { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '20px' };
const patientBadge = { padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '12px', color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#64748b' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const submitBtn = { padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const thStyle = { padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const timeBadgeStyle = { fontSize: '12px', color: '#059669', fontWeight: '700', padding: '4px 10px', background: '#ecfdf5', borderRadius: '8px', marginLeft: '8px' };
const statusBadgeBlue = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#eff6ff', color: '#1e40af' };
const dropdownMenuStyle = { position: 'absolute', right: '0', top: '30px', backgroundColor: 'white', minWidth: '170px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid #e2e8f0', zIndex: 9999, padding: '6px', display: 'flex', flexDirection: 'column' };
const menuItemStyle = { padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#475569', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 };
const modalContent = { background: 'white', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' };

export default BookAppointment;