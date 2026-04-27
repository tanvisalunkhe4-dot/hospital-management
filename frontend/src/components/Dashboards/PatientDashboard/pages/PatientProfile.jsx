import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Fingerprint, 
  ShieldCheck, Edit3, Loader2, AlertCircle,
  Droplet, Calendar, ExternalLink, Activity,
  CheckCircle2, ShieldAlert
} from 'lucide-react';
import axios from 'axios';
import { useUser } from "../components/UserContext";

const DataRow = ({ label, value, icon: Icon, isCritical }) => (
  <div style={infoRow}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {Icon && <Icon size={14} color="#94a3b8" />}
      <span style={labelStyle}>{label}</span>
    </div>
    <span style={{ 
      ...valueStyle, 
      color: isCritical ? '#e11d48' : '#0f172a',
      backgroundColor: isCritical ? '#fff1f2' : 'transparent',
      padding: isCritical ? '2px 8px' : '0',
      borderRadius: '6px'
    }}>
      {value || '---'}
    </span>
  </div>
);

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { profileImage, setProfileImage } = useUser(); // Get setter

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file)); // Updates global state
  };
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Authentication token not found.");

        const response = await axios.get('http://localhost:8000/api/v1/patient/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return (
    <div style={loaderWrapper}>
      <Loader2 className="animate-spin" size={40} color="#10b981" />
      <p style={loaderText}>Authenticating with NexHealth Identity Provider...</p>
    </div>
  );

  if (error) return (
    <div style={errorContainer}>
      <div style={errorCard}>
        <AlertCircle size={40} color="#ef4444" />
        <h3 style={{ margin: '12px 0 4px 0' }}>Synchronization Failed</h3>
        <p style={{ color: '#64748b' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={retryBtn}>Retry Connection</button>
      </div>
    </div>
  );

  return (
    <div style={container}>
    {/* 1. HERO HEADER - Professional & Clean */}
    <div style={heroSection}>
      <div style={heroContent}>
        <div style={avatarCircle}>
          {profile.full_name?.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={title}>{profile.full_name}</h1>
            {/* Conditional Badge based on live active status */}
            <span style={profile.is_active ? statusBadgeActive : statusBadgeInactive}>
              {profile.is_active ? 'Verified Account' : 'Pending Verification'}
            </span>
          </div>
          <p style={subtitle}>
            <Fingerprint size={14} /> UHID: <span style={{color: '#0f172a'}}>{profile.uhid}</span>
          </p>
        </div>
      </div>
      <button style={editBtn}>
        <Edit3 size={18} /> Update Records
      </button>
    </div>

    <div style={mainLayout}>
      {/* 2. CLINICAL CORE (Left Column) */}
      <div style={sideCol}>
        <div style={clinicalCard}>
          <div style={cardHeader}>
            <Activity size={18} color="#28a745" />
            <h3 style={cardTitle}>Medical Baseline</h3>
          </div>
          <div style={vitalsGrid}>
            {/* USE LIVE DATA HERE */}
            <DataRow label="Blood Group" value={profile.blood_group} icon={Droplet} isCritical />
            <DataRow label="Gender" value={profile.gender} icon={User} />
            <DataRow label="Date of Birth" value={profile.dob} icon={Calendar} />
          </div>
        </div>

          <div style={trustCard}>
            <div>
              <p style={trustText}>Identity Verified</p>
              <p style={{fontSize: '11px', color: '#166534', margin: 0}}>Via ABDM Health Stack</p>
            </div>
            <CheckCircle2 size={24} color="#28a745" />
          </div>
        </div>

        {/* 3. RIGHT COLUMN: ADMINISTRATIVE DATA */}
        <div style={contentCol}>
          <div style={card}>
            <div style={cardHeader}>
              <ShieldCheck size={18} color="#28a745" />
              <h3 style={cardTitle}>Government Digital Health ID</h3>
            </div>
            <div style={doubleGrid}>
              <DataRow label="ABHA Number" value={profile.abha_number} />
              <DataRow label="ABHA Address" value={profile.abha_address} />
            </div>
          </div>

          <div style={card}>
            <div style={cardHeader}>
              <Phone size={18} color="#28a745" />
              <h3 style={cardTitle}>Contact Details</h3>
            </div>
            <div style={doubleGrid}>
              <DataRow label="Email Address" value={profile.email} icon={Mail} />
              <DataRow label="Phone Number" value={profile.phone_number} icon={Phone} />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <DataRow label="Permanent Address" value={profile.address} icon={MapPin} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- ENTERPRISE STYLES ---
const container = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' };
const statusBadgeActive = { 
  backgroundColor: '#e6f4ea', 
  color: '#1e7e34', 
  padding: '6px 14px', 
  borderRadius: '8px', 
  fontSize: '11px', 
  fontWeight: '700',
  border: '1px solid #c3e6cb'
};

const statusBadgeInactive = { 
  backgroundColor: '#fff3cd', 
  color: '#856404', 
  padding: '6px 14px', 
  borderRadius: '8px', 
  fontSize: '11px', 
  fontWeight: '700' 
};

const editBtn = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  padding: '12px 24px', 
  borderRadius: '12px', 
  border: '1px solid #e2e8f0', 
  backgroundColor: '#ffffff', 
  color: '#0f172a', 
  fontWeight: '700', 
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const clinicalCard = { 
  backgroundColor: '#fff', 
  padding: '24px', 
  borderRadius: '20px', 
  border: '1px solid #e2e8f0', 
  borderTop: '4px solid #28a745' // NexHealth Primary Green
};
const heroSection = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  marginBottom: '40px', padding: '32px', borderRadius: '24px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
};

const heroContent = { display: 'flex', alignItems: 'center', gap: '24px' };

const avatarCircle = {
  width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#10b981',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '32px', fontWeight: '800', color: '#fff', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
};

const title = { fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' };
const subtitle = { fontSize: '14px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' };

const statusBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' };


const card = { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' };
const cardTitle = { fontSize: '14px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, flex: 1 };

const vitalsGrid = { display: 'flex', flexDirection: 'column', gap: '8px' };

const doubleGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };

const infoRow = { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderBottom: '1px solid #f8fafc' };
const labelStyle = { color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' };
const valueStyle = { fontWeight: '700', color: '#0f172a', fontSize: '15px' };

const trustCard = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '20px', borderRadius: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0'
};
const trustText = { fontSize: '13px', fontWeight: '700', color: '#166534', margin: 0 };

const linkBtn = { fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' };


// Add these three to your existing style constants:

const mainLayout = { 
  display: 'grid', 
  gridTemplateColumns: '320px 1fr', 
  gap: '32px',
  marginTop: '24px'
};

const sideCol = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '24px' 
};

const contentCol = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '24px' 
};
const loaderWrapper = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' };
const loaderText = { fontSize: '14px', color: '#64748b', fontWeight: '700' };

const errorContainer = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const errorCard = { textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #fee2e2', maxWidth: '400px' };
const retryBtn = { marginTop: '20px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer' };

export default PatientProfile;