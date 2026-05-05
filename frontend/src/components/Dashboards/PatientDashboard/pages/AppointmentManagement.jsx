import React, { useState, useEffect, useCallback } from 'react';
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
    'Rescheduled': { bg: '#eff6ff', color: '#1e40af', icon: Clock, label: 'Rescheduled' },
    'Cancellation Requested': { bg: '#fff1f2', color: '#be123c', icon: AlertCircle, label: 'Cancellation Pending' }
  };

  const config = styles[status] || styles.PENDING;
  const Icon = config.icon;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', 
      padding: '6px 14px', borderRadius: '20px', 
      backgroundColor: config.bg, color: config.color,
      fontSize: '10px', fontWeight: '800', 
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap', // Prevents text wrapping
      border: `1px solid ${config.color}20` // Adds a subtle border
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
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);  
  const [contactInfo, setContactInfo] = useState({ name: "Hospital", phone: "" });
  const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    doctor_id: '',
    reason: '',
    preferred_date: '',
    preferred_time: '',
    urgency: 'Normal'
  });

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const hospId = localStorage.getItem('hospital_id') || 1;
      
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const [doctorRes, apptRes, hospRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/receptionist/doctors/${hospId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/v1/patient/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/v1/patient/hospital-contact/${hospId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setDoctors(doctorRes.data);
      setAppointments(apptRes.data);
      
      // Fix applied here: changed contactRes to hospRes
      if (hospRes.data) {
        setContactInfo({
          name: hospRes.data.hospital_name,
          phone: hospRes.data.phone_number
        });
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds to keep status updated
    const interval = setInterval(loadData, 10000); 
    return () => clearInterval(interval);
  }, [loadData]);
  


  const handleCancel = async (apptId) => {
    if (window.confirm("Send cancellation request to the receptionist?")) {
      try {
        const token = localStorage.getItem('token');
        // We use PATCH to change the status to 'Cancellation Requested'
        await axios.patch(`http://localhost:8000/api/v1/patient/appointments/${apptId}/request-cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Cancellation request sent.");
        loadData(); // Refresh to show new status
      } catch (err) {
        console.error("Cancel request failed:", err);
        alert("Failed to send cancellation request.");
      }
    }
  };

const [isRescheduling, setIsRescheduling] = useState(false);
const openReschedule = (appt) => {
  setSelectedAppt(appt);
  setFormData({
    ...formData,
    doctor_id: appt.doctor_id, // Match the existing doctor
    reason: appt.reason,
    preferred_date: appt.appointment_date?.split('T')[0],
    preferred_time: appt.appointment_time
  });
  setIsRescheduling(true);
  setView('book'); // Reuse the booking form
};

const handleBooking = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const payload = {
      hospital_id: 1,
      doctor_name: doctors.find(d => d.staff_id == formData.doctor_id)?.full_name || selectedAppt?.doctor_name,
      appointment_date: formData.preferred_date,
      appointment_time: formData.preferred_time,
      reason: formData.reason
    };

    if (isRescheduling && selectedAppt) {
      await axios.patch(`http://localhost:8000/api/v1/patient/appointments/${selectedAppt.id}/reschedule`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Reschedule request sent!");
    } else {
      await axios.post('http://localhost:8000/api/v1/patient/request-appointment', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("New request sent to Receptionist!");
    }

    setIsRescheduling(false);
    setSelectedAppt(null);
    setView('list');
    loadData(); // Re-fetch all data
  } catch (err) {
    console.error("Operation failed:", err);
    alert("Error processing request.");
  }
};
  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <Loader2 className="animate-spin" size={40} color="#10b981" />
      <p style={{ color: '#64748b', fontWeight: '600' }}>Syncing with Hospital Registry...</p>
    </div>
  );
  const hospitalName = doctors.length > 0 ? doctors[0].hospital_name : "NexHealth Medical Center";
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  // Add this logic before the return statement
const filteredAppointments = appointments.filter((appt) => {
  const matchesSearch = appt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        appt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesStatus = filterStatus === 'All' || appt.status === filterStatus;

  return matchesSearch && matchesStatus;
});
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
        {/* 🟢 VIEW 1: LIST VIEW */}
        {view === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={toolbar}>
            <div style={searchBox}>
  <Search size={16} color="#94a3b8" />
  <input 
    type="text" 
    placeholder="Search by doctor or reason..." 
    style={searchInput}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)} // Makes search work
  />
</div>
<div style={filterWrapper}>
  <Filter size={16} style={filterIcon} />
  <select 
    style={styledSelect}
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="All">All Statuses</option>
    <option value="Scheduled">Confirmed</option>
    <option value="Pending">Pending</option>
    <option value="Rescheduled">Rescheduled</option>
    <option value="Cancelled">Cancelled</option>
  </select>
  {/* Custom arrow replaces the default browser look */}
  <div style={customArrow}>▾</div>
</div>
            </div>

            <div style={appointmentGrid}>
  {filteredAppointments.length > 0 ? filteredAppointments.map((appt) => (
    <motion.div 
  key={appt.id} 
  style={appointmentCard} 
  whileHover={{ 
    y: -5, 
    borderColor: '#10b981', // Highlights the border on hover
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
  }}
>
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
                    <div style={dataItem}>
                      <Calendar size={14} /> 
                      {appt.appointment_date ? appt.appointment_date.split('T')[0] : "No Date"}
                    </div>
                    <div style={dataItem}>
                      <Clock size={14} /> 
                      {appt.appointment_time && appt.appointment_time !== "00:00:00" 
                        ? appt.appointment_time?.substring(0, 5) 
                        : "Time Pending"} 
                    </div>
                  </div>

                  <div style={cardFooter}>
                    <button style={textBtn} onClick={() => { setSelectedAppt(appt); setView('details'); }}>View Details</button>

                    {/* 🟢 Action Logic: Hide buttons if already requesting cancellation */}
                    {(appt.status === 'Pending' || appt.status === 'Scheduled' || appt.status === 'Rescheduled') && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => openReschedule(appt)} style={{ ...textBtn, color: '#2563eb' }}>Reschedule</button>
                        <button onClick={() => handleCancel(appt.id)} style={cancelLink}>Cancel</button>
                      </div>
                    )}
                    {appt.status === 'Cancellation Requested' && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Pending Review</span>
                    )}
                  </div>
                </motion.div>
              )
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '60px', color: '#64748b' }}>
                <Search size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  No appointments found matching "<strong>{searchTerm}</strong>"
                </p>
                {searchTerm !== '' && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    style={{ ...textBtn, marginTop: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear Search and Filters
                  </button>
                )}
              </div>
            )}
          </div>
            
          </motion.div>
        )}

        {/* 🟢 VIEW 2: BOOKING FORM */}
        {view === 'book' && (
  <motion.div 
    key="book"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    style={formCard}
  >
    {/* 🟢 Dynamic Title based on mode */}
    <h3 style={formTitle}>
      {isRescheduling ? `Reschedule Appointment #${selectedAppt?.id}` : 'New Appointment Request'}
    </h3>

    {/* 🟢 NEW: Same-Day Booking Alert */}
    {isToday(formData.preferred_date) && (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        style={contactAlertBox}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertCircle color="#9a3412" size={20} />
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#9a3412' }}>
              Urgent: Same-Day Appointment
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#c2410c' }}>
              Online requests for today might not be processed immediately. 
              Please call <strong>{contactInfo.name}</strong> at: 
              <a href={`tel:${contactInfo.phone}`} style={{ marginLeft: '5px', fontWeight: '800', color: '#9a3412', textDecoration: 'underline' }}>
                {contactInfo.phone}
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    )}

    <form onSubmit={handleBooking} style={bookingForm}>
      <div style={inputGroup}>
        <label style={label}>Select Specialist</label>
        <select 
          style={isRescheduling ? { ...selectInput, backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : selectInput}
          value={formData.doctor_id}
          onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
          required
          disabled={isRescheduling} // 🟢 Prevent changing doctor during reschedule to maintain consistency
        >
          <option value="">Choose a Doctor</option>
          {doctors.map(d => (
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
            value={formData.preferred_date} // 🟢 Controlled component
            min={new Date().toISOString().split('T')[0]} 
            onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
            required 
          />
        </div>
        <div style={inputGroup}>
          <label style={label}>Preferred Time</label>
          <input 
            type="time" 
            style={selectInput}
            value={formData.preferred_time} // 🟢 Controlled component
            onChange={(e) => setFormData({...formData, preferred_time: e.target.value})}
            required 
          />
        </div>
      </div>

      <div style={noticeBox}>
        <AlertCircle size={18} color="#0891b2" />
        <p style={noticeText}>
          {isRescheduling 
            ? "Rescheduling will reset your status to 'Pending' for receptionist re-approval." 
            : "Our receptionist will review doctor's availability and confirm or propose a new time within 2 hours."}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button type="submit" style={submitBtn}>
          {isRescheduling ? 'Confirm Reschedule' : 'Send Booking Request'}
        </button>

        {/* 🟢 Cancel/Back Button for Reschedule mode */}
        {isRescheduling && (
          <button 
            type="button" 
            onClick={() => {
              setIsRescheduling(false);
              setView('list');
            }}
            style={secondaryBtn}
          >
            Discard Changes
          </button>
        )}
      </div>
    </form>
  </motion.div>
)}

        {/* 🟢 VIEW 3: APPOINTMENT DETAILS */}
        {view === 'details' && selectedAppt && (
  <motion.div 
    key="details"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    style={formCard}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <div>
        <h3 style={formTitle}>Appointment Itinerary</h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
          Reference ID: <span style={{ fontWeight: '600', color: '#64748b' }}>#{selectedAppt.id}</span>
        </p>
      </div>
      <StatusBadge status={selectedAppt.status} />
    </div>

    {/* Main Info Section */}
    <div style={detailBox}>
      <div style={detailRow}>
        <span style={label}>Practitioner</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ ...doctorAvatar, backgroundColor: '#10b981', color: '#fff' }}>
             {/* Fixed initial display */}
            {selectedAppt.doctor_name ? selectedAppt.doctor_name[0].toUpperCase() : 'D'}
          </div>
          <div>
            <p style={{ ...detailText, fontSize: '18px' }}>Dr. {selectedAppt.doctor_name}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Primary Care Specialist</p>
          </div>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

      <div style={row}>
        <div style={inputGroup}>
          <span style={label}>Scheduled Date</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Calendar size={16} color="#10b981" />
            <p style={detailText}>{selectedAppt.appointment_date?.split('T')[0]}</p>
          </div>
        </div>
        <div style={inputGroup}>
          <span style={label}>Arrival Time</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Clock size={16} color="#10b981" />
            <p style={detailText}>
              {selectedAppt.appointment_time && selectedAppt.appointment_time !== "00:00:00" 
                ? selectedAppt.appointment_time.substring(0, 5) 
                : "TBD"}
            </p>
          </div>
        </div>
      </div>

      <div style={detailRow}>
        <span style={label}>Reason for Visit</span>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <MessageSquare size={16} color="#64748b" style={{ marginTop: '4px' }} />
          <p style={{ ...detailText, fontWeight: '400', fontSize: '15px', color: '#475569' }}>
            {selectedAppt.reason}
          </p>
        </div>
      </div>
    </div>

    {/* Instructions Section */}
    <div style={instructionSection}>
      <h4 style={subHeading}>Clinical Instructions</h4>
      <ul style={instructionList}>
        <li>Arrive **15 mins early** for registration and vitals.</li>
        <li>Ensure you have your **Insurance Card** and ID handy.</li>
        <li>Fasting is **not required** for this specific consultation.</li>
      </ul>
    </div>

    {/* Location Box with "Map" Link */}
    <div style={locationBox}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={iconCircle}><AlertCircle size={18} /></div>
          <div>
        {/* 🟢 LIVE DATA USED HERE */}
        <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
          {hospitalName}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          {selectedAppt.room_location || "Floor 2, Wing B • Room 204"}
        </p>
      </div>
        </div>
        <button style={{ ...textBtn, color: '#2563eb', fontSize: '12px' }}>Get Directions</button>
      </div>
    </div>

    {/* Action Buttons */}
    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
      <button 
        onClick={() => setView('list')} 
        style={{ ...secondaryBtn, flex: 1, padding: '14px', height: 'auto' }}
      >
        Back to Overview
      </button>
      <button 
        onClick={() => window.print()} 
        style={{ ...primaryBtn, flex: 1, padding: '14px', justifyContent: 'center', height: 'auto' }}
      >
        Download Receipt (PDF)
      </button>
    </div>
  </motion.div>
)}
      </AnimatePresence>
    </div>
  );
};   
// --- STYLES (Kept for Layout Integrity) ---
const container = { 
  width: '100%',        
  maxWidth: '1200px',     // Centered "profile" feel
  margin: '0 auto',       // Center the content
  padding: '24px 40px',   // Match the internal padding of the profile view
  minHeight: '100vh',
  backgroundColor: '#f8fafc' // Subtle background to make white cards pop
};
const appointmentCard = { 
  backgroundColor: '#fff', 
  borderRadius: '20px', 
  padding: '24px', 
  border: '1px solid #f1f5f9', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
  minHeight: '220px',   
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const pageTitle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 };
const pageSubtitle = { color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' };
const primaryBtn = { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryBtn = { backgroundColor: '#fff', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const searchInput = { border: 'none', padding: '12px', outline: 'none', width: '100%', fontSize: '14px' };
const filterBtn = { backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' };
const appointmentGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' };
const doctorInfo = { display: 'flex', alignItems: 'center', gap: '16px' };
const doctorAvatar = { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: '800' };
const docName = { margin: 0, fontSize: '16px', color: '#1e293b' };
const reasonLabel = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' };
const dateTimeBar = { display: 'flex', gap: '16px', margin: '20px 0', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' };
const dataItem = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' };
const textBtn = { border: 'none', background: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const cardFooter = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', // Align buttons vertically
  borderTop: '1px solid #f1f5f9', 
  paddingTop: '16px',
  marginTop: 'auto' // Pushes footer to the bottom of the card
};

// Add this new style for a more "button-like" feel
const actionBtn = {
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '1px solid transparent'
};
const toolbar = { 
  display: 'flex', 
  gap: '12px', 
  marginBottom: '24px', 
  alignItems: 'stretch' 
};

const searchBox = { 
  flex: 1, 
  backgroundColor: '#fff', 
  border: '1px solid #e2e8f0', 
  borderRadius: '10px', // Matches card radius slightly more closely
  display: 'flex', 
  alignItems: 'center', 
  padding: '0 14px' 
};
const filterWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  minWidth: '180px', // Matches the width seen in your screenshots
  cursor: 'pointer'
};

const filterIcon = {
  position: 'absolute',
  left: '14px',
  color: '#64748b',
  pointerEvents: 'none'
};

const styledSelect = {
  width: '100%',
  padding: '12px 35px 12px 40px',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  cursor: 'pointer',
  appearance: 'none', // Critical: Removes default browser arrow
  zIndex: 1
};

const customArrow = {
  position: 'absolute',
  right: '14px',
  color: '#94a3b8',
  fontSize: '12px',
  pointerEvents: 'none'
};
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
const detailBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  border: '1px solid #e2e8f0'
};

const detailRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const detailText = {
  margin: 0,
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b'
};
const instructionSection = {
  marginTop: '24px',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  borderLeft: '4px solid #10b981'
};

const subHeading = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  fontWeight: '700',
  color: '#1e293b'
};

const instructionList = {
  margin: 0,
  paddingLeft: '20px',
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.6'
};

const locationBox = {
  marginTop: '16px',
  padding: '16px',
  borderRadius: '12px',
  border: '1px dashed #e2e8f0',
  display: 'flex',
  alignItems: 'center'
};
const contactAlertBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fdba74',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '20px',
  overflow: 'hidden'
};
const iconCircle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#f0f9ff',
  color: '#0ea5e9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
export default AppointmentManagement;