import React from 'react';
import { Bell, Calendar, FileText, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    { id: 1, title: 'Appointment Confirmed', desc: 'Your visit with Dr. Rahul is set for tomorrow at 10:00 AM.', icon: Calendar, color: '#10b981' },
    { id: 2, title: 'New Lab Report', desc: 'Your Blood Test results have been uploaded to the Medical Vault.', icon: FileText, color: '#3b82f6' },
    { id: 3, title: 'Medicine Reminder', desc: 'Time for your afternoon dose of Multivitamins.', icon: CheckCircle, color: '#f59e0b' },
  ];

  return (
    <div style={container}>
      <h2 style={title}>Notifications</h2>
      <div style={list}>
        {notifications.map((note) => (
          <div key={note.id} style={noteCard}>
            <div style={{ ...iconCircle, backgroundColor: `${note.color}15` }}>
              <note.icon size={20} color={note.color} />
            </div>
            <div style={content}>
              <h4 style={noteTitle}>{note.title}</h4>
              <p style={noteDesc}>{note.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================== STYLES ==================
const container = { padding: '10px' };
const title = { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' };
const list = { display: 'flex', flexDirection: 'column', gap: '16px' };
const noteCard = { display: 'flex', gap: '16px', padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const iconCircle = { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const content = { flex: 1 };
const noteTitle = { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' };
const noteDesc = { margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' };

// ✅ THE FINAL EXPORT
export default Notifications;