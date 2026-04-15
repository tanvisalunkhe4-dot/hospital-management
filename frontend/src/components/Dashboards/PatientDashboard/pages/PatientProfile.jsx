import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Fingerprint, 
  ShieldCheck, Edit3, Loader2, AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // 1. Grab the token from storage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
    
        // 2. Perform the GET request with the Authorization header
        const response = await axios.get('http://localhost:8000/api/v1/patient/profile', {
          headers: {
            // Ensure "Bearer " (with a space) is prefixed to the token
            'Authorization': `Bearer ${token}`
          }
        });
    
        setProfile(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Session expired or invalid token. Redirecting to login...");
          // Optional: navigate('/login');
        }
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

  if (error) {
    return (
      <div style={container}>
        <div style={{ ...card, borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <AlertCircle color="#ef4444" />
          <p style={{ color: '#b91c1c', fontWeight: '600' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
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
            <DataRow label="Gender" value={profile.gender} />
            {/* Using the blood_group field from your database */}
            <DataRow label="Blood Group" value={profile.blood_group} isCritical />
          </div>
        </div>

        {/* 2. ABDM Linkage (ABHA) */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{...iconBox, backgroundColor: '#ecfdf5'}}><Fingerprint size={20} color="#059669" /></div>
            <h3 style={cardTitle}>ABDM Linkage</h3>
            {profile.abha_number && <span style={verifiedBadge}><ShieldCheck size={12} /> Verified</span>}
          </div>
          <div style={infoContent}>
            {/* Mapping abha_number from your patient.py schema */}
            <DataRow label="ABHA Number" value={profile.abha_number} />
            <DataRow label="Health ID" value={profile.abha_address || 'Not Linked'} />
            <DataRow label="Status" value={profile.abha_number ? "Active Profile" : "Pending"} />
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
            <DataRow label="Mobile Number" value={profile.phone} />
            <DataRow label="Current Residence" value={profile.address} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Keep your existing enterprise styles here) ---
const loaderWrapper = { height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' };
const loaderText = { fontSize: '14px', color: '#64748b', fontWeight: '600' };
const container = { padding: '20px' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' };
const title = { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 };
const subtitle = { fontSize: '14px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', marginTop: '6px' };
const editBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontWeight: '700', cursor: 'pointer' };
const profileGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' };
const card = { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', position: 'relative' };
const iconBox = { width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 };
const infoContent = { display: 'flex', flexDirection: 'column' };
const infoRow = { display: 'flex', flexDirection: 'column', padding: '12px 0', borderBottom: '1px solid #f8fafc' };
const labelStyle = { color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' };
const valueStyle = { fontWeight: '700', color: '#0f172a', fontSize: '15px' };
const verifiedBadge = { position: 'absolute', right: 0, backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' };
const description = { fontSize: '13px', color: '#64748b', marginBottom: '12px' };
const tagRed = { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' };
const tagBlue = { backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' };

export default PatientProfile;

