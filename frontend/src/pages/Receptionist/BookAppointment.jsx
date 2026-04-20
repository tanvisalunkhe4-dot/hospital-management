import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar, Clock, User, MessageSquare, 
  CheckCircle, MoreVertical, ExternalLink, XCircle, LogIn, RefreshCw 
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

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  // --- FILTERING LOGIC ---
  const getMidnight = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // 1. Filter for Today's Appointments
  const todaySchedule = useMemo(() => {
    const todayTms = getMidnight(new Date());
    return (appointmentsList || [])
      .filter(appt => getMidnight(appt.appointment_date) === todayTms)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }, [appointmentsList]);

  // 2. Filter for Upcoming (Tomorrow + 7 Days)
  const upcomingSchedule = useMemo(() => {
    const tomorrowTms = getMidnight(new Date().setDate(new Date().getDate() + 1));
    const sevenDaysLaterTms = getMidnight(new Date().setDate(new Date().getDate() + 7));

    return (appointmentsList || [])
      .filter(appt => {
        const apptTms = getMidnight(appt.appointment_date);
        return apptTms >= tomorrowTms && apptTms <= sevenDaysLaterTms;
      })
      .sort((a, b) => getMidnight(a.appointment_date) - getMidnight(b.appointment_date));
  }, [appointmentsList]);

  // --- API HANDLERS ---
  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/receptionist/book-appointment?hosp_id=${hosp_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...appointmentData, 
            patient_id: selectedPatient.id, 
            hospital_id: parseInt(hosp_id) 
        })
      });
      if (response.ok) {
        setIsSuccess(true);
        setSearchQuery("");
        setSelectedPatient(null);
        setAppointmentData({ doctor_name: "", appointment_date: "", appointment_time: "", reason: "" });
        if (refresh) refresh();
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) { console.error("Booking failed:", err); } 
    finally { setLoading(false); }
  };

  const updateStatus = async (apptId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${apptId}/status?hosp_id=${hosp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) refresh();
    } catch (err) { console.error("Status update failed", err); }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${rescheduleData.id}?hosp_id=${hosp_id}`, {
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
        if (refresh) refresh();
      }
    } catch (err) { console.error("Reschedule failed:", err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (apptId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${apptId}?hosp_id=${hosp_id}`, { method: 'DELETE' });
        if (res.ok) refresh();
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

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Checked-in': { bg: '#dcfce7', text: '#166534' },
      'Waiting': { bg: '#fef9c3', text: '#854d0e' },
      'Scheduled': { bg: '#eff6ff', text: '#1e40af' },
      'default': { bg: '#f1f5f9', text: '#475569' }
    };
    const s = styles[status] || styles['default'];
    return { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: s.bg, color: s.text };
  };

  // Reusable Component for Table Rows to ensure consistency
  const AppointmentRow = ({ appt, showCheckIn }) => (
    <tr style={{ borderBottom: `1px solid #f8fafc` }}>
      <td style={tdStyle}>
        <strong>{new Date(appt.appointment_date).toLocaleDateString()}</strong> 
        <span style={timeBadgeStyle}>{appt.appointment_time}</span>
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '700', color: '#1e293b' }}>{appt.patient_name || "N/A"}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>PID: #{appt.patient_id}</span>
        </div>
      </td>
      <td style={tdStyle}>{appt.doctor_name}</td>
      <td style={tdStyle}><span style={getStatusBadge(appt.status)}>{appt.status || 'Scheduled'}</span></td>
      <td style={tdStyle}>
        {showCheckIn ? (
           appt.status !== 'Checked-in' ? (
            <button onClick={() => updateStatus(appt.id, 'Checked-in')} style={checkInBtn}>Check In</button>
           ) : <span style={{ color: '#059669', fontSize: '12px', fontWeight: '700' }}>Completed</span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Available on Date</span>
        )}
      </td>
      <td style={{ ...tdStyle, position: 'relative' }}>
        <MoreVertical size={18} cursor="pointer" onClick={(e) => toggleMenu(e, appt.id)} />
        <AnimatePresence>
          {activeMenuId === appt.id && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={dropdownMenuStyle}>
              <button onClick={() => setRescheduleData(appt)} style={menuItemStyle}><Calendar size={14}/> Reschedule</button>
              <button onClick={() => handleCancel(appt.id)} style={{...menuItemStyle, color: '#ef4444'}}><XCircle size={14}/> Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SECTION 1: BOOKING FORM */}
      <div style={containerStyle}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.text, margin: 0 }}>Schedule New Appointment</h3>
          {isSuccess && <div style={successToast}>✔ Appointment Scheduled!</div>}
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
          <form onSubmit={handleBook} style={formGrid}>
            <div style={patientBadge}>Selected: {selectedPatient.first_name} {selectedPatient.last_name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" placeholder="Consultant Name" required style={inputStyle} value={appointmentData.doctor_name} onChange={(e) => setAppointmentData({...appointmentData, doctor_name: e.target.value})}/>
                <input type="text" placeholder="Reason for visit" style={inputStyle} value={appointmentData.reason} onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="date" required style={inputStyle} value={appointmentData.appointment_date} onChange={(e) => setAppointmentData({...appointmentData, appointment_date: e.target.value})}/>
                <input type="time" required style={inputStyle} value={appointmentData.appointment_time} onChange={(e) => setAppointmentData({...appointmentData, appointment_time: e.target.value})}/>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Saving..." : "Confirm Booking"}</button>
          </form>
        )}
      </div>

     
      {/* SECTION 3: UPCOMING SCHEDULE */}
      <div style={{ ...containerStyle, overflow: 'visible' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Upcoming Schedule (Next 7 Days)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Patient Name & PID</th>
              <th style={thStyle}>Doctor</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {upcomingSchedule.length > 0 ? upcomingSchedule.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} showCheckIn={false} />
            )) : (
              <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No upcoming appointments found.</td></tr>
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
                <h3 style={{ margin: 0, fontWeight: '800' }}>Reschedule Appointment</h3>
                <XCircle cursor="pointer" onClick={() => setRescheduleData(null)} />
              </div>
              <form onSubmit={handleConfirmReschedule} style={formGrid}>
                <input type="date" required style={inputStyle} value={rescheduleData.appointment_date} onChange={(e) => setRescheduleData({...rescheduleData, appointment_date: e.target.value})}/>
                <input type="time" required style={inputStyle} value={rescheduleData.appointment_time} onChange={(e) => setRescheduleData({...rescheduleData, appointment_time: e.target.value})}/>
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
const successToast = { backgroundColor: '#ecfdf5', color: '#059669', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' };
const searchWrapper = { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { width: '100%', padding: '14px', border: 'none', background: 'transparent', outline: 'none' };
const dropdownStyle = { position: 'absolute', width: '100%', top: '55px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 100 };
const resultItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' };
const avatarMini = { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '20px' };
const patientBadge = { padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '12px', color: '#166534', fontSize: '14px' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const submitBtn = { padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const checkInBtn = { padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const thStyle = { padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#475569' };
const timeBadgeStyle = { fontSize: '12px', color: '#059669', fontWeight: '700', padding: '4px 10px', background: '#ecfdf5', borderRadius: '8px', marginLeft: '8px' };
const dropdownMenuStyle = { position: 'absolute', right: '0', top: '30px', backgroundColor: 'white', minWidth: '150px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid #e2e8f0', zIndex: 999, padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' };
const menuItemStyle = { padding: '10px', fontSize: '13px', fontWeight: '600', color: '#475569', textAlign: 'left', background: 'none', border: 'none', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 };
const modalContent = { background: 'white', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' };

export default BookAppointment;