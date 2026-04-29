import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, MessageSquare, 
  Send, XCircle, CheckCircle2, AlertCircle, 
  Filter, Plus, Search, Loader2
} from 'lucide-react';
import axios from 'axios';

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': { bg: '#fff7ed', color: '#c2410c', icon: Clock, label: 'Awaiting Approval' },
    'Scheduled': { bg: '#f0fdf4', color: '#166534', icon: CheckCircle2, label: 'Confirmed' }, // "Confirmed" UI for "Scheduled" DB status
    'Cancelled': { bg: '#fef2f2', color: '#991b1b', icon: XCircle, label: 'Cancelled' },
    'Rescheduled': { bg: '#eff6ff', color: '#1e40af', icon: Clock, label: 'Rescheduled' }
  };

  const config = styles[status] || styles.PENDING;
  const Icon = config.icon;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', 
      padding: '6px 12px', borderRadius: '20px', 
      backgroundColor: config.bg, color: config.color,
      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
    }}>
      <Icon size={12} /> {config.label}
    </div>
  );
};

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // 🟢 Live Doctor Data
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); 
  
  const [formData, setFormData] = useState({
    doctor_id: '',
    reason: '',
    preferred_date: '',
    preferred_time: '',
    urgency: 'Normal'
  });

  // 🟢 Load all data from API on component mount
  // --- Updated Frontend Fetching Logic ---

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Replace with your actual hospital ID logic 
      // (e.g., from your auth context or localStorage)
      const hospId = localStorage.getItem('hospital_id') || 1;
      if (!token) return;

      const [doctorRes, apptRes] = await Promise.all([
        // 🟢 FIX: Change this URL to match your @router.get("/doctors/{hosp_id}")
        axios.get(`http://localhost:8000/api/v1/receptionist/doctors/${hospId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/v1/patient/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDoctors(doctorRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
const handleBooking = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    
    // 🟢 FIX 1: Map your form data to match the backend Schema keys
    const payload = {
      hospital_id: 1, // Ensure this is dynamic if needed
      doctor_name: doctors.find(d => d.staff_id == formData.doctor_id)?.full_name || "",
      appointment_date: formData.preferred_date,
      appointment_time: formData.preferred_time,
      reason: formData.reason
    };

    // 🟢 FIX 2: Change URL to match your backend router path
    await axios.post('http://localhost:8000/api/v1/patient/request-appointment', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("Request sent to Receptionist!");
    setView('list');

    // 🟢 FIX 3: Correct refresh URL
    const apptRes = await axios.get('http://localhost:8000/api/v1/patient/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAppointments(apptRes.data);
  } catch (err) {
    console.error("Booking failed:", err.response?.data || err.message);
    alert("Error sending request. Check console for details.");
  }
};

const handleCancel = async (apptId) => {
  if (window.confirm("Do you want to withdraw this request?")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/patient/appointments/${apptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list
      setAppointments(prev => prev.filter(a => a.id !== apptId));
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  }
};


  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <Loader2 className="animate-spin" size={40} color="#10b981" />
      <p style={{ color: '#64748b', fontWeight: '600' }}>Syncing with Hospital Registry...</p>
    </div>
  );

  return (
    <div style={container}>
      {/* HEADER SECTION */}
      <div style={headerSection}>
        <div>
          <h2 style={pageTitle}>Appointment Management</h2>
          <p style={pageSubtitle}>Request, view, and manage your clinical visits.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView(view === 'list' ? 'book' : 'list')}
          style={view === 'list' ? primaryBtn : secondaryBtn}
        >
          {view === 'list' ? <><Plus size={18} /> Book New Request</> : 'Back to My List'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={toolbar}>
              <div style={searchBox}>
                <Search size={16} color="#94a3b8" />
                <input type="text" placeholder="Search appointments..." style={searchInput} />
              </div>
              <button style={filterBtn}><Filter size={16} /> Filter Status</button>
            </div>

            <div style={appointmentGrid}>
              {appointments.length > 0 ? appointments.map((appt) => (
                <motion.div key={appt.id} style={appointmentCard} whileHover={{ y: -4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={doctorInfo}>
                      <div style={doctorAvatar}>{appt.doctor_name?.[0] || 'D'}</div>
                      <div>
                        <h4 style={docName}>Dr. {appt.doctor_name}</h4>
                        <p style={reasonLabel}><MessageSquare size={12} /> {appt.reason}</p>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div style={dateTimeBar}>
                    <div style={dataItem}><Calendar size={14} /> {appt.date}</div>
                    <div style={dataItem}><Clock size={14} /> {appt.time}</div>
                  </div>

                  <div style={cardFooter}>
                    <button style={textBtn}>View Details</button>
                    {appt.status === 'PENDING' && <button style={cancelLink}>Cancel Request</button>}
                  </div><div style={dateTimeBar}>
  {/* 🟢 Updated to match your AppointmentResponse schema */}
  <div style={dataItem}><Calendar size={14} /> {appt.appointment_date}</div>
  <div style={dataItem}><Clock size={14} /> {appt.appointment_time}</div>
</div>

<div style={cardFooter}>
  <button style={textBtn}>View Details</button>
  {/* 🟢 Change 'PENDING' to 'Pending' */}
  {appt.status === 'Pending' && <button style={cancelLink}>Cancel Request</button>}
</div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#64748b' }}>
                    No appointments found. Start by booking a new request.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="book"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={formCard}
          >
            <h3 style={formTitle}>New Appointment Request</h3>
            <form onSubmit={handleBooking} style={bookingForm}>
              <div style={inputGroup}>
                <label style={label}>Select Specialist</label>
                <select 
  style={selectInput}
  value={formData.doctor_id}
  onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
  required
>
  <option value="">Choose a Doctor</option>
  {doctors.map(d => (
    // 🟢 FIX: Use staff_id and full_name to match your backend response
    <option key={d.staff_id} value={d.staff_id}>
      {d.full_name} ({d.specialization})
    </option>
  ))}
</select>
              </div>

              <div style={inputGroup}>
                <label style={label}>Reason for Visit</label>
                <textarea 
                  placeholder="Describe your symptoms or purpose..."
                  style={textArea}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>

              <div style={row}>
                <div style={inputGroup}>
                  <label style={label}>Preferred Date</label>
                  <input 
                    type="date" 
                    style={selectInput}
                    min={new Date().toISOString().split('T')[0]} // Prevents past dates
                    onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                    required 
                  />
                </div>
                <div style={inputGroup}>
                  <label style={label}>Preferred Time</label>
                  <input 
                    type="time" 
                    style={selectInput}
                    onChange={(e) => setFormData({...formData, preferred_time: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div style={noticeBox}>
                <AlertCircle size={18} color="#0891b2" />
                <p style={noticeText}>
                  Our receptionist will review doctor's availability and confirm or propose a new time within 2 hours via this dashboard.
                </p>
              </div>

              <button type="submit" style={submitBtn}>Send Booking Request</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- STYLES (Kept for Layout Integrity) ---
const container = { maxWidth: '1200px', margin: '0 auto' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const pageTitle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 };
const pageSubtitle = { color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' };
const primaryBtn = { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryBtn = { backgroundColor: '#fff', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const toolbar = { display: 'flex', gap: '16px', marginBottom: '24px' };
const searchBox = { flex: 1, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px' };
const searchInput = { border: 'none', padding: '12px', outline: 'none', width: '100%', fontSize: '14px' };
const filterBtn = { backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' };
const appointmentGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' };
const appointmentCard = { backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
const doctorInfo = { display: 'flex', alignItems: 'center', gap: '16px' };
const doctorAvatar = { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: '800' };
const docName = { margin: 0, fontSize: '16px', color: '#1e293b' };
const reasonLabel = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' };
const dateTimeBar = { display: 'flex', gap: '16px', margin: '20px 0', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' };
const dataItem = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' };
const textBtn = { border: 'none', background: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const cancelLink = { border: 'none', background: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const formCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' };
const formTitle = { margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' };
const inputGroup = { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' };
const label = { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const selectInput = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' };
const textArea = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', minHeight: '100px', resize: 'vertical' };
const row = { display: 'flex', gap: '20px' };
const noticeBox = { display: 'flex', gap: '12px', backgroundColor: '#ecfeff', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #cffafe' };
const noticeText = { margin: 0, fontSize: '13px', color: '#0891b2', lineHeight: '1.5' };
const submitBtn = { width: '100%', padding: '16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' };
const bookingForm = { display: 'flex', flexDirection: 'column' };

export default AppointmentManagement;