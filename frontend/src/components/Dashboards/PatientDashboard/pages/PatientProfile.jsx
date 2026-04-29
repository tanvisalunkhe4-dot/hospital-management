import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Fingerprint, 
  ShieldCheck, Edit3, Loader2, AlertCircle,
  Droplet, Calendar, Activity,
  CheckCircle2, Briefcase, ShieldAlert, Scale
} from 'lucide-react';
import axios from 'axios';
import { useUser } from "../../../../UserContext";

// --- PROFESSIONAL COMPONENTS ---

const AnimatedCard = ({ children, delay = 0, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{ ...card, ...style }}
  >
    {children}
  </motion.div>
);

const DataRow = ({ label, value, icon: Icon, isCritical }) => (
  <div style={infoRow}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={iconBox}>
        {Icon && <Icon size={14} color="#64748b" />}
      </div>
      <span style={labelStyle}>{label}</span>
    </div>
    <span style={{ 
      ...valueStyle, 
      color: isCritical ? '#e11d48' : '#0f172a',
      backgroundColor: isCritical ? '#fff1f2' : 'transparent',
      padding: isCritical ? '2px 10px' : '0',
      borderRadius: '6px'
    }}>
      {value || <span style={{ color: '#94a3b8', fontWeight: 400 }}>Not Provided</span>}
    </span>
  </div>
);

const VitalMetric = ({ label, value, unit, icon: Icon, color, delay }) => (
  <motion.div 
    whileHover={{ y: -4, boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)' }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    style={{ ...vitalMiniCard, borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
      <div style={{ ...iconCircle, backgroundColor: `${color}15` }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{...statusBadgeMini, color: color, backgroundColor: `${color}10`}}>Normal</span>
    </div>

    <div style={{ position: 'relative', zIndex: 2 }}>
      <p style={vitalLabelText}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <h4 style={vitalValueText}>{value || '--'}</h4>
        {unit && <span style={vitalUnitText}>{unit}</span>}
      </div>
    </div>

    {/* Professional Trend Visual Placeholder */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40px',
      background: `linear-gradient(180deg, transparent, ${color}10)`,
      maskImage: 'linear-gradient(to right, transparent, black, transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
    }} />
  </motion.div>
);
const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setProfileImage } = useUser(); 

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
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 size={44} color="#10b981" />
      </motion.div>
      <p style={loaderText}>Decrypting Health Records...</p>
    </div>
  );

  if (error) return (
    <div style={errorContainer}>
      <AnimatedCard style={errorCard}>
        <AlertCircle size={48} color="#ef4444" />
        <h3 style={{ margin: '16px 0 8px 0', fontSize: '20px', color: '#1e293b' }}>Sync Error</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={retryBtn}>Reconnect to NexHealth</button>
      </AnimatedCard>
    </div>
  );

  return (
    <div style={container}>
      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={heroSection}
      >
        <div style={heroContent}>
          <div style={avatarCircle}>
            {profile?.first_name || profile?.last_name 
              ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() 
              : 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={title}>
                {profile?.first_name || profile?.last_name 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                  : 'Loading Name...'}
              </h1>
              <div style={statusBadgeActive}>
                <CheckCircle2 size={12} /> Verified Profile
              </div>
            </div>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          style={editBtn}
        >
          <Edit3 size={18} /> Update Medical Records
        </motion.button>
      </motion.div>

      {/* --- RESTRUCTURED STACKED CONTENT --- */}
      <div style={stackedLayout}>
        
        {/* 2. GOVERNMENT DIGITAL ID (Full Width Priority) */}
        <AnimatedCard delay={0.1}>
          <div style={cardHeader}>
            <ShieldCheck size={18} color="#28a745" />
            <h3 style={cardTitle}>Government Digital ID</h3>
          </div>
          <div style={tripleGrid}>
            <DataRow label="ABHA ID" value={profile?.abha_id} />
            <DataRow label="ID Type" value={profile?.id_type} />
            <DataRow label="ID Number" value={profile?.id_number} />
          </div>
        </AnimatedCard>

        {/* 3. CLINICAL BASELINE (Linear 4-Metric Grid) */}
<AnimatedCard delay={0.2} style={{ borderTop: '4px solid #28a745' }}>
  <div style={cardHeader}>
    <Activity size={18} color="#28a745" />
    <h3 style={cardTitle}>Vital Sign's</h3>
  </div>
  
  <div style={vitalsFullWidthGrid}>
    <VitalMetric label="Blood Group" value={profile?.blood_group} unit="" icon={Droplet} color="#f59e0b" delay={0.3} />
    <VitalMetric label="Weight" value={profile?.weight} unit="kg" icon={Scale} color="#ec4899" delay={0.4} />
    <VitalMetric label="Height" value={profile?.height} unit="cm" icon={Activity} color="#06b6d4" delay={0.5} />
    <VitalMetric label="Gender" value={profile?.gender} unit="" icon={User} color="#8b5cf6" delay={0.6} />
  </div>

  <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
     <DataRow label="Date of Birth" value={profile?.date_of_birth} icon={Calendar} />
  </div>
</AnimatedCard>

        {/* 4. CONTACT & LOCATION */}
        <AnimatedCard delay={0.3}>
          <div style={cardHeader}>
            <Phone size={18} color="#28a745" />
            <h3 style={cardTitle}>Contact & Location</h3>
          </div>
          <div style={doubleGrid}>
            <DataRow label="Email" value={profile?.email} icon={Mail} />
            <DataRow label="Phone" value={profile?.phone_number} icon={Phone} />
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <DataRow label="Permanent Address" value={profile?.address} icon={MapPin} />
          </div>
        </AnimatedCard>

        {/* 5. PROFESSIONAL & EMERGENCY (Side by Side) */}
        <div style={doubleGrid}>
          <AnimatedCard delay={0.4} style={{ marginBottom: 0 }}>
            <div style={cardHeader}>
              <Briefcase size={18} color="#28a745" />
              <h3 style={cardTitle}>Professional</h3>
            </div>
            <DataRow label="Occupation" value={profile?.occupation} />
            <DataRow label="Marital Status" value={profile?.marital_status} />
          </AnimatedCard>

          <AnimatedCard delay={0.5} style={{ borderLeft: '4px solid #e11d48', marginBottom: 0 }}>
            <div style={cardHeader}>
              <ShieldAlert size={18} color="#e11d48" />
              <h3 style={cardTitle}>Emergency</h3>
            </div>
            <DataRow label="Primary Contact" value={profile?.emergency_contact} />
            <DataRow label="Relationship" value={profile?.emergency_relation} />
          </AnimatedCard>
        </div>

        {/* ABDM Secure Badge */}
        <AnimatedCard delay={0.6} style={trustCard}>
          <div style={{ flex: 1 }}>
            <p style={trustText}>Identity Secured</p>
            <p style={{fontSize: '11px', color: '#166534', opacity: 0.8}}>Linked via ABDM Health Stack</p>
          </div>
          <ShieldCheck size={28} color="#28a745" />
        </AnimatedCard>

      </div>
    </div>
  );
};

// --- MODERN ENTERPRISE STYLES ---
const container = { maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' };

const heroSection = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  marginBottom: '32px', padding: '32px', borderRadius: '28px',
  backgroundColor: '#ffffff', border: '1px solid #e2e8f0', 
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)'
};

const heroContent = { display: 'flex', alignItems: 'center', gap: '28px' };

const avatarCircle = {
  width: '88px', height: '88px', borderRadius: '24px', 
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '36px', fontWeight: '800', color: '#fff', 
  boxShadow: '0 12px 20px -8px rgba(16, 185, 129, 0.4)'
};

const title = { fontSize: '34px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' };
const subtitle = { fontSize: '15px', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' };

const statusBadgeActive = { 
  display: 'flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#f0fdf4', color: '#166534', 
  padding: '6px 12px', borderRadius: '10px', 
  fontSize: '12px', fontWeight: '700', border: '1px solid #dcfce7'
};



const cardHeader = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' };
const cardTitle = { fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 };

const infoRow = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '14px 0', borderBottom: '1px solid #f8fafc' 
};

const iconBox = {
  width: '28px', height: '28px', borderRadius: '8px', 
  backgroundColor: '#f8fafc', display: 'flex', 
  alignItems: 'center', justifyContent: 'center'
};

const labelStyle = { color: '#94a3b8', fontSize: '12px', fontWeight: '700' };
const valueStyle = { fontWeight: '700', color: '#1e293b', fontSize: '15px' };

const editBtn = { 
  display: 'flex', alignItems: 'center', gap: '10px', 
  padding: '14px 28px', borderRadius: '14px', 
  border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
  color: '#1e293b', fontWeight: '700', cursor: 'pointer',
  transition: 'all 0.2s ease'
};


const iconCircle = {
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const statusBadgeMini = {
  fontSize: '9px',
  fontWeight: '800',
  color: '#10b981',
  backgroundColor: '#f0fdf4',
  padding: '2px 6px',
  borderRadius: '6px',
  textTransform: 'uppercase'
};
const vitalsDashboardGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px', // Increased gap for a more airy feel
  marginTop: '16px'
};


const vitalLabelText = { 
  fontSize: '10px', 
  fontWeight: '800', 
  color: '#94a3b8', 
  margin: '12px 0 4px 0', 
  textTransform: 'uppercase',
  letterSpacing: '0.05em' 
};

const vitalValueText = { 
  fontSize: '18px', 
  fontWeight: '800', 
  color: '#0f172a', 
  margin: 0 
};
// A simple column layout to stack cards
const stackedLayout = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '24px' 
};

// For the ABHA ID section to look clean in one row
const tripleGrid = { 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr 1fr', 
  gap: '32px' 
};

// For the Clinical Baseline section to show all 4 in one row
const vitalsFullWidthGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)', // Forces 4 fields in same line
  gap: '16px',
  marginTop: '16px',
  width: '100%'
};

const vitalMiniCard = {
  backgroundColor: '#ffffff',
  padding: '20px', 
  borderRadius: '16px', // Slightly smoother corners
  border: '1px solid #f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  boxSizing: 'border-box'
};

// Update your card constant to remove bottom margin since stackedLayout handles the gap
const card = { 
  backgroundColor: '#fff', 
  padding: '28px', 
  borderRadius: '24px', 
  border: '1px solid #f1f5f9', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
  width: '100%',
  boxSizing: 'border-box'
};
const vitalUnitText = { fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginLeft: '2px' };
const vitalsGrid = { display: 'flex', flexDirection: 'column' };
const doubleGrid = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '24px',
  width: '100%' 
};
const trustCard = { 
  display: 'flex', alignItems: 'center', gap: '16px',
  padding: '24px', borderRadius: '20px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7'
};

const trustText = { fontSize: '15px', fontWeight: '800', color: '#166534', margin: 0 };
const mainLayout = { 
  display: 'flex', 
  flexDirection: 'column', 
  width: '100%' 
};
const sideCol = { display: 'flex', flexDirection: 'column' };
const contentCol = { display: 'flex', flexDirection: 'column' };

const loaderWrapper = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' };
const loaderText = { fontSize: '16px', color: '#64748b', fontWeight: '700', letterSpacing: '0.02em' };

const errorContainer = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const errorCard = { textAlign: 'center', padding: '48px', maxWidth: '440px' };
const retryBtn = { marginTop: '24px', padding: '14px 32px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer' };

export default PatientProfile;