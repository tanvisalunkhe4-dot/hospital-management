import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Fingerprint, 
  ShieldCheck, Edit3, Lock, AlertCircle, Loader2 
} from 'lucide-react';
import axios from 'axios';

// API Configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

 // src/pages/PatientProfile.jsx


 // src/pages/PatientProfile.jsx

useEffect(() => {
  const fetchProfileData = async () => {
    try {
      // ✅ USE THIS EXACT STRING:
      const response = await api.get('/patient/profile'); 
      
      setProfile(response.data);
    } catch (error) {
      console.error("Identity Synchronization Error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchProfileData();
}, []);

  if (loading) {
    return (
      <div style={loaderWrapper}>
        <Loader2 className="animate-spin" size={32} color="#10b981" />
        <p style={loaderText}>Synchronizing with NexHealth Digital Spine...</p>
      </div>
    );
  }

  // Fallback if data fails
  if (!profile) return <div style={container}>Error loading profile.</div>;

  return (
    <div style={container}>
      {/* Page Header */}
      <div style={headerSection}>
        <div>
          <h1 style={title}>Personal Profile</h1>
          <p style={subtitle}>Verified Health Identity: {profile.uhid}</p>
        </div>
        <button style={editBtn}>
          <Edit3 size={18} /> Update Details
        </button>
      </div>
      
      <div style={profileGrid}>
        {/* 1. Personal Details */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox}><User size={20} color="#10b981" /></div>
            <h3 style={cardTitle}>Personal Details</h3>
          </div>
          <div style={infoContent}>
            <DataRow label="Full Name" value={profile.full_name} />
            <DataRow label="Gender" value={profile.gender || 'Not Specified'} />
            <DataRow label="Blood Group" value={profile.blood_group} isCritical />
          </div>
        </div>

        {/* 2. Identity Verification */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{...iconBox, backgroundColor: '#ecfdf5'}}><Fingerprint size={20} color="#059669" /></div>
            <h3 style={cardTitle}>ABDM Linkage</h3>
            {profile.is_verified && <span style={verifiedBadge}><ShieldCheck size={12} /> Verified</span>}
          </div>
          <div style={infoContent}>
            <DataRow label="ABHA Number" value={profile.abha_id || 'Not Linked'} />
            <DataRow label="Health ID" value={profile.abha_address || 'Unassigned'} />
            <DataRow label="Status" value={profile.is_verified ? "Active Profile" : "Pending Verification"} />
          </div>
        </div>

        {/* 3. Communication */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{...iconBox, backgroundColor: '#eff6ff'}}><Mail size={20} color="#3b82f6" /></div>
            <h3 style={cardTitle}>Communication</h3>
          </div>
          <div style={infoContent}>
            <DataRow label="Email Address" value={profile.email} />
            <DataRow label="Emergency Contact" value={profile.emergency_contact || 'No Contact Set'} />
            <DataRow label="Current Residence" value={profile.address || 'Update Required'} />
          </div>
        </div>

        {/* 4. Health Snapshot */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{...iconBox, backgroundColor: '#fff1f2'}}><AlertCircle size={20} color="#e11d48" /></div>
            <h3 style={cardTitle}>Health Snapshot</h3>
          </div>
          <div style={{...infoContent, marginTop: '12px'}}>
            <p style={description}>Active clinical markers in your NexHealth vault.</p>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              <span style={tagRed}>Type: {profile.blood_group}</span>
              <span style={tagBlue}>{profile.is_verified ? "ABDM Verified" : "Verification Pending"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Row Component for Cleanliness
const DataRow = ({ label, value, isCritical }) => (
  <div style={infoRow}>
    <span style={labelStyle}>{label}</span>
    <span style={{...valueStyle, color: isCritical ? '#ef4444' : '#0f172a'}}>{value}</span>
  </div>
);

// ================== ENTERPRISE STYLES ==================

const loaderWrapper = { height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' };
const loaderText = { fontSize: '14px', color: '#64748b', fontWeight: '600' };
const container = { padding: '20px', animation: 'fadeIn 0.5s ease-in-out' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' };
const title = { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' };
const subtitle = { fontSize: '14px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', marginTop: '6px' };
const editBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };
const profileGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' };
const card = { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', position: 'relative' };
const iconBox = { width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 };
const infoContent = { display: 'flex', flexDirection: 'column' };
const infoRow = { display: 'flex', flexDirection: 'column', padding: '12px 0', borderBottom: '1px solid #f8fafc' };
const labelStyle = { color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' };
const valueStyle = { fontWeight: '700', color: '#0f172a', fontSize: '15px' };
const verifiedBadge = { position: 'absolute', right: 0, backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' };
const description = { fontSize: '13px', color: '#64748b', marginBottom: '12px' };
const tagRed = { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' };
const tagBlue = { backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' };

export default PatientProfile;