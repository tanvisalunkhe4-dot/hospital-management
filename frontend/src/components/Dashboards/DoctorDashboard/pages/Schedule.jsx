import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { Clock, Loader2, Calendar as CalendarIcon, User, ChevronRight } from 'lucide-react';

const DoctorSchedule = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(sessionStorage.getItem('user_data'));
        const formattedDate = date.toISOString().split('T')[0];
        
        const response = await axios.get(`http://localhost:8000/api/v1/doctor/doctor-schedule`, {
          params: { staff_id: userData?.staff_id, date: formattedDate },
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [date]);

  const calendarStyles = `
    .react-calendar { border: none !important; width: 100% !important; font-family: 'Inter', sans-serif; }
    .react-calendar__navigation { margin-bottom: 0.5rem; }
    .react-calendar__navigation button { color: #334155; font-weight: 700; font-size: 15px; }
    .react-calendar__month-view__weekdays__weekday { text-decoration: none !important; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px 0; }
    .react-calendar__tile { padding: 16px 0 !important; font-size: 14px; font-weight: 500; }
    .react-calendar__tile--active { background: #059669 !important; color: white !important; border-radius: 12px; }
    .react-calendar__tile:hover { background: #f0fdf4 !important; border-radius: 12px; color: #059669; }
    .react-calendar__tile--now { color: #059669; font-weight: 700; }
  `;

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <style>{calendarStyles}</style>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Doctor's Schedule</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Manage your daily consultations and patient flow efficiently.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT: Calendar Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <CalendarIcon size={20} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Select Date</h3>
          </div>
          <Calendar onChange={setDate} value={date} />
        </div>

        {/* RIGHT: Agenda Card */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px' }}>
              {appointments.length} Appointments
            </span>
          </div>
          
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#059669" /></div>
          ) : appointments.length > 0 ? (
            appointments.map((appt) => (
              <div key={appt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <User size={20} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{appt.patient_name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={13} /> {appt.time} • {appt.appointment_type}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '12px', background: appt.status === 'Confirmed' ? '#dcfce7' : '#fef3c7', color: appt.status === 'Confirmed' ? '#166534' : '#92400e' }}>
                    {appt.status}
                  </span>
                  <ChevronRight size={20} color="#cbd5e1" />
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📅</div>
              <p style={{ color: '#64748b', fontWeight: '500' }}>No appointments scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;