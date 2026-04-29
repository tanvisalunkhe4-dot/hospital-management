import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar, Clock, User, MessageSquare, 
  CheckCircle, MoreVertical, ExternalLink, XCircle, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../../../theme/theme';

const BookAppointment = ({ hosp_id, appointmentsList, refresh, onBack }) => {
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
// Add these to your State Management section
const [doctors, setDoctors] = useState([]);
const [loadingDoctors, setLoadingDoctors] = useState(false);

// Add this useEffect to fetch the live doctor list
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/doctors/${hosp_id}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data); // Expecting [{ staff_id, full_name, specialization }, ...]
      }
    } catch (err) {
      console.error("Failed to load live doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  if (hosp_id) fetchDoctors();
}, [hosp_id]);
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
// --- FILTERING LOGIC ---
const pendingRequests = useMemo(() => {
  return (appointmentsList || []).filter(appt => 
    appt.status?.toLowerCase() === 'pending'
  );
}, [appointmentsList]);
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

    // 1. ADVANCED SLOT CHECK (20-Minute Consultation Gap)
    const bufferMinutes = 20;
    const newApptTime = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}`);

    const isSlotOccupied = (appointmentsList || []).some(appt => {
      // Only check same doctor and same day
      if (appt.doctor_name.toLowerCase() !== appointmentData.doctor_name.toLowerCase() || 
          appt.appointment_date !== appointmentData.appointment_date) {
        return false;
      }

      const existingTime = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
      const diffInMinutes = Math.abs((newApptTime - existingTime) / (1000 * 60));
      
      return diffInMinutes < bufferMinutes; 
    });

    if (isSlotOccupied) {
      alert(`Scheduling Conflict: Dr. ${appointmentData.doctor_name} requires a 20-minute gap between patients.`);
      return;
    }

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
      } else {
        const errData = await response.json();
        alert(errData.detail || "Booking failed");
      }
    } catch (err) { 
      console.error("Booking failed:", err); 
    } finally { 
      setLoading(false); 
    }
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
    if (query.length > 0) { // Search starts from 1st character
      try {
        const res = await fetch(`http://localhost:8000/api/v1/receptionist/patients/search?query=${query}&hosp_id=${hosp_id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        }
      } catch (err) { console.error("Search failed:", err); }
    } else {
      setSearchResults([]);
    }
  };

  const handleApprove = async (apptId) => {
    try {
      // Ensure hosp_id is passed so the backend can verify the hospital context
      const res = await fetch(`http://localhost:8000/api/v1/receptionist/appointments/${apptId}/approve?hosp_id=${hosp_id}`, {
        method: 'PATCH',
      });
      
      if (res.ok) {
        if (refresh) refresh(); 
      } else {
        const errorData = await res.json();
        alert(`Failed to approve: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Approval failed:", err);
    }
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

  const AppointmentRow = ({ appt }) => {
    // Status lock: Cannot reschedule/cancel if patient is checked in
    const isLocked = appt.status?.toLowerCase().includes('check');

    return (
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
          <span style={{ color: isLocked ? '#10b981' : '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
            {isLocked ? "Consultation in Progress" : "Future Appointment"}
          </span>
        </td>
        <td style={{ ...tdStyle, position: 'relative' }}>
          {!isLocked ? (
            <>
              <MoreVertical size={18} cursor="pointer" onClick={(e) => toggleMenu(e, appt.id)} />
              <AnimatePresence>
                {activeMenuId === appt.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={dropdownMenuStyle}>
                    <button onClick={() => setRescheduleData(appt)} style={menuItemStyle}><Calendar size={14}/> Reschedule</button>
                    <button onClick={() => handleCancel(appt.id)} style={{...menuItemStyle, color: '#ef4444'}}><XCircle size={14}/> Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <CheckCircle size={16} color="#10b981" />
          )}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. BACK NAVIGATION */}
      <button onClick={onBack} style={backBtnStyle}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* SECTION 1: BOOKING FORM */}
      <div style={containerStyle}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.text, margin: 0 }}>Schedule Appointment</h3>
          {isSuccess && <div style={successToast}>✔ Confirmed</div>}
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={searchWrapper}>
            <Search size={18} color="#94a3b8" style={{ marginLeft: '12px' }} />
            <input type="text" placeholder="Search registered patients..." style={searchInput} value={searchQuery} onChange={handleSearch} />
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
            <div style={patientBadge}>Booking for: <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input 
  list="dr-list" 
  type="text" 
  placeholder={loadingDoctors ? "Loading Doctors..." : "Select Doctor"} 
  required 
  style={inputStyle} 
  value={appointmentData.doctor_name} 
  onChange={(e) => setAppointmentData({...appointmentData, doctor_name: e.target.value})}
/>
<datalist id="dr-list">
  {/* 🟢 DYNAMIC LIVE DATA REPLACING MOCK DATA */}
  {doctors.map((dr) => (
    <option 
      key={dr.staff_id} 
      value={`Dr. ${dr.full_name}`} 
    />
  ))}
</datalist>
                <input type="text" placeholder="Reason (e.g. Fever)" style={inputStyle} value={appointmentData.reason} onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input 
                  type="date" 
                  required 
                  style={inputStyle} 
                  min={new Date().toISOString().split("T")[0]} 
                  value={appointmentData.appointment_date} 
                  onChange={(e) => setAppointmentData({...appointmentData, appointment_date: e.target.value})}
                  onInvalid={(e) => e.target.setCustomValidity("Please select a future date.")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
                <input type="time" required style={inputStyle} value={appointmentData.appointment_time} onChange={(e) => setAppointmentData({...appointmentData, appointment_time: e.target.value})}/>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Processing..." : "Create Appointment"}</button>
          </form>
        )}
      </div>

      {/* SECTION 2: SCHEDULE TABLE */}
      {/* --- NEW SECTION: INCOMING PATIENT REQUESTS --- */}
{pendingRequests.length > 0 && (
  <div style={{ ...containerStyle, borderColor: '#fbbf24', backgroundColor: '#fffdfa', borderStyle: 'dashed', borderWidth: '2px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
        <Clock size={18} /> Action Required: New Booking Requests ({pendingRequests.length})
      </h3>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {pendingRequests.map(req => (
        <div key={req.id} style={requestCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{req.patient_name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Requested: {req.appointment_date}</div>
            </div>
            <span style={reqBadgeStyle}>Incoming</span>
          </div>
          
          <div style={{ margin: '12px 0', padding: '8px', background: '#fefce8', borderRadius: '8px', fontSize: '12px', border: '1px solid #fef3c7' }}>
            <div style={{ color: '#854d0e', fontWeight: '700' }}>Reason:</div>
            <div style={{ color: '#92400e' }}>{req.reason || "General Consultation"}</div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleApprove(req.id)} style={confirmBtnSmall}>Approve</button>
            <button onClick={() => setRescheduleData(req)} style={modifyBtnSmall}>Modify</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


      <div style={{ ...containerStyle, overflow: 'visible' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Upcoming Schedule</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid #f1f5f9` }}>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Patient Details</th>
              <th style={thStyle}>Consultant</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Stage</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {upcomingSchedule.length > 0 ? upcomingSchedule.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} />
            )) : (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No appointments scheduled for the next 7 days.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RESCHEDULE MODAL */}
      <AnimatePresence>
        {rescheduleData && (
          <div style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Reschedule</h3>
                <XCircle cursor="pointer" onClick={() => setRescheduleData(null)} color="#94a3b8" />
              </div>
              <form onSubmit={handleConfirmReschedule} style={formGrid}>
                <label style={labelStyle}>New Date</label>
                <input type="date" required style={inputStyle} min={new Date().toISOString().split("T")[0]} value={rescheduleData.appointment_date} onChange={(e) => setRescheduleData({...rescheduleData, appointment_date: e.target.value})}/>
                <label style={labelStyle}>New Time</label>
                <input type="time" required style={inputStyle} value={rescheduleData.appointment_time} onChange={(e) => setRescheduleData({...rescheduleData, appointment_time: e.target.value})}/>
                <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Updating..." : "Update Appointment"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- STYLES --- */
const backBtnStyle = { border: 'none', background: 'none', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'fit-content', padding: '0' };
const containerStyle = { background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid #e2e8f0`, position: 'relative' };
const successToast = { backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' };
const searchWrapper = { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' };
const dropdownStyle = { position: 'absolute', width: '100%', top: '50px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #e2e8f0' };
const resultItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' };
const avatarMini = { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '16px' };
const patientBadge = { padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#166534', fontSize: '13px' };
const inputStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' };
const submitBtn = { padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };
const thStyle = { padding: '12px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#475569' };
const timeBadgeStyle = { fontSize: '11px', color: '#059669', fontWeight: '700', padding: '3px 8px', background: '#ecfdf5', borderRadius: '6px', marginLeft: '6px' };
const dropdownMenuStyle = { position: 'absolute', right: '0', top: '25px', backgroundColor: 'white', minWidth: '140px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', borderRadius: '10px', border: '1px solid #e2e8f0', zIndex: 999, padding: '4px' };
const menuItemStyle = { padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', textAlign: 'left', background: 'none', border: 'none', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' };
const modalContent = { background: 'white', padding: '24px', borderRadius: '20px', width: '350px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '-10px' };
const requestCardStyle = { 
  background: 'white', 
  padding: '16px', 
  borderRadius: '16px', 
  border: '1px solid #fde68a', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
};

const reqBadgeStyle = { 
  fontSize: '10px', 
  background: '#fef3c7', 
  color: '#92400e', 
  padding: '4px 10px', 
  borderRadius: '20px', 
  fontWeight: '800', 
  textTransform: 'uppercase' 
};

const confirmBtnSmall = { 
  flex: 1, 
  padding: '10px', 
  background: '#059669', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  fontWeight: '700', 
  cursor: 'pointer', 
  fontSize: '12px' 
};

const modifyBtnSmall = { 
  flex: 1, 
  padding: '10px', 
  background: '#f8fafc', 
  color: '#475569', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  fontWeight: '700', 
  cursor: 'pointer', 
  fontSize: '12px' 
};
export default BookAppointment;