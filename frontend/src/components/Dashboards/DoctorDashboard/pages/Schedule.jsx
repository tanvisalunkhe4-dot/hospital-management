import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { Clock, Loader2, Calendar as CalendarIcon, User, ChevronRight, Play, Users, Stethoscope, Briefcase } from 'lucide-react';
const DoctorSchedule = () => {
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [appointmentDates, setAppointmentDates] = useState(new Set());
   
   
    
    const fetchDashboardData = async () => {
      const rawUserData = sessionStorage.getItem('user_data');
      const token = sessionStorage.getItem('token');
    
      if (!rawUserData || !token) {
        console.warn("User session missing. Skipping data fetch.");
        setLoading(false);
        return;
      }
    
      try {
        const userData = JSON.parse(rawUserData);
        const formattedDate = date.toISOString().split('T')[0];
    
        // 1. Await the results of all requests
        const results = await Promise.allSettled([
          axios.get(`http://localhost:8000/api/v1/doctor/doctor-schedule`, {
            params: { staff_id: userData?.staff_id, date: formattedDate },
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8000/api/v1/doctor/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
    
        const [scheduleRes, statsRes] = results;
    
        // 2. Handle Schedule Data
        if (scheduleRes.status === 'fulfilled') {
          const data = scheduleRes.value.data;
          setAppointments(data);
          // Create a Set of date strings from the appointment list
          const dates = new Set(data.map(appt => appt.appointment_date));
          setAppointmentDates(dates);
        } else {
          console.error("Schedule fetch failed:", scheduleRes.reason);
          setAppointments([]); // Reset if fetch fails
        }
    
        // 3. Handle Stats Data
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        } else {
          console.error("Stats fetch failed:", statsRes.reason);
          // Keep existing stats or set to null/0 to prevent "0" flickering
        }
    
      } catch (error) {
        console.error("Critical error in fetchDashboardData:", error);
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    setLoading(true);
    
    // Initial fetch
    fetchDashboardData().finally(() => setLoading(false));

    // Polling setup: Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Cleanup: Clear interval when date changes or component unmounts
    return () => clearInterval(interval);
  }, [date]); 

  const handleStartConsultation = (apptId) => {
    window.location.href = `/consultation/${apptId}`;
  };


  const calendarStyles = `
  /* Container & Layout */
  .react-calendar { 
    border: none !important; 
    width: 100% !important; 
    background: transparent !important; 
    font-family: inherit !important;
  }

  /* Navigation Bar (Month/Year) */
  .react-calendar__navigation { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    margin-bottom: 12px; 
  }
  .react-calendar__navigation button { 
    font-size: 15px; 
    font-weight: 700; 
    color: #0f172a; 
    padding: 8px; 
    border-radius: 8px; 
    transition: all 0.2s;
  }
  .react-calendar__navigation button:hover { background: #f1f5f9; }

  /* Weekday Header Labels (Mon, Tue, etc.) */
  .react-calendar__month-view__weekdays { 
    text-transform: uppercase; 
    font-size: 11px; 
    font-weight: 700; 
    color: #94a3b8 !important; 
    margin-bottom: 8px;
    text-decoration: none !important;
  }
  .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; }

  /* Day Tiles */
  .react-calendar__tile { 
    height: 45px; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    font-weight: 500; 
    font-size: 14px; 
    border-radius: 8px; 
    transition: all 0.2s;
    color: #334155;
  }
  
  /* Selected Day */
  .react-calendar__tile--active { 
    background: #059669 !important; 
    color: #ffffff !important; 
  }
  
  /* Hover effect for non-selected days */
  .react-calendar__tile:hover:not(.react-calendar__tile--active) { 
    background: #f0fdf4 !important; 
    color: #059669 !important; 
  }

  /* Remove default border on navigation buttons */
  .react-calendar__navigation button:disabled { background-color: transparent !important; }
`;

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
  {[
    { title: 'Total Patients', value: stats?.total_patients || '0', icon: Users, color: '#3b82f6' },
    { title: 'Today Patients', value: stats?.today_patients || '0', icon: Stethoscope, color: '#059669' },
    { title: 'Today Appointments', value: stats?.today_appointments || '0', icon: Briefcase, color: '#8b5cf6' }
  ].map((stat, i) => (
    <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ background: `${stat.color}15`, padding: '16px', borderRadius: '12px', color: stat.color }}><stat.icon size={24} /></div>
      <div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.title}</div>
        <div style={{ fontSize: '22px', fontWeight: '800' }}>{stat.value}</div>
      </div>
    </div>
  ))}
</div>
      <style>{calendarStyles}</style>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Doctor's Schedule</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Manage daily consultations and patient flow efficiently.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Calendar Sidebar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <CalendarIcon size={20} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Select Date</h3>
          </div>
          <Calendar 
  onChange={setDate} 
  value={date}
  tileContent={({ date, view }) => {
    const dateString = date.toISOString().split('T')[0];
    
    // 2. Render a green dot if this date is in our appointmentDates Set
    return view === 'month' && appointmentDates.has(dateString) ? (
      <div style={{ 
        height: '6px', 
        width: '6px', 
        backgroundColor: '#059669', 
        borderRadius: '50%', 
        margin: '2px auto' 
      }} />
    ) : null;
  }}
/>        </div>

        {/* Agenda Card */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px' }}>
              {appointments.length} Consultations
            </span>
          </div>
          
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#059669" /></div>
          ) : appointments.length > 0 ? (
            appointments.map((appt) => (
              <div key={appt.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                // Professional Border-Left based on priority
                borderLeft: `5px solid ${appt.priority === 'High' ? '#ef4444' : appt.priority === 'Medium' ? '#f59e0b' : '#10b981'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                      {appt.patient_name}
                      {appt.abdm_verified && <span style={{ marginLeft: '10px', fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>ABDM Verified</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Clock size={13} /> {appt.time} • {appt.appointment_type}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '12px', background: appt.status === 'Confirmed' ? '#dcfce7' : '#fef3c7', color: appt.status === 'Confirmed' ? '#166534' : '#92400e' }}>
                    {appt.status}
                  </span>
                  <button 
                    onClick={() => handleStartConsultation(appt.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                    <Play size={12} fill="white" /> Start
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontWeight: '500' }}>No consultations scheduled for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;