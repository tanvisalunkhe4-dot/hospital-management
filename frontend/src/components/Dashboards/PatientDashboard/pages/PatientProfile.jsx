import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Fingerprint, 
  ShieldCheck, Edit3, Loader2, AlertCircle,
  Droplet, Calendar, Activity,
  CheckCircle2, Briefcase, ShieldAlert, Scale, FileText, Upload, Trash2, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useUser } from "../../../../UserContext";

// --- CLEAN ENTERPRISE COMPONENTS (No Animations) ---

const StaticCard = ({ children, style = {} }) => (
  <div style={{ ...cardStyle, ...style }}>
    {children}
  </div>
);

const DataRow = ({ label, value, icon: Icon, isCritical }) => (
  <div style={infoRowStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={iconBoxStyle}>
        {Icon && <Icon size={14} color="#64748b" />}
      </div>
      <span style={labelTextStyle}>{label}</span>
    </div>
    <span style={{ 
      ...valueTextStyle, 
      color: isCritical ? '#e11d48' : '#0f172a',
      backgroundColor: isCritical ? '#fff1f2' : 'transparent',
      padding: isCritical ? '2px 8px' : '0',
      borderRadius: '4px'
    }}>
      {value || "Not Provided"}
    </span>
  </div>
);

const VitalMetric = ({ label, value, unit, icon: Icon, color }) => (
  <div style={{ ...vitalCardStyle, borderLeft: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ ...iconCircleStyle, backgroundColor: `${color}10` }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{...statusBadgeMiniStyle, color: color, backgroundColor: `${color}08`}}>Recorded</span>
    </div>
    <div style={{ marginTop: '12px' }}>
      <p style={vitalLabelTextStyle}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <h4 style={vitalValueTextStyle}>{value || '--'}</h4>
        {unit && <span style={vitalUnitTextStyle}>{unit}</span>}
      </div>
    </div>
  </div>
);

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Authentication token not found.");
        const headers = { 'Authorization': `Bearer ${token}` };

        const [profileRes, docsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/patient/profile', { headers }),
          axios.get('http://localhost:8000/api/v1/patient/medical-records', { headers })
        ]);

        setProfile(profileRes.data);
        setDocuments(docsRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteDocument = async (recordId) => {
    if (!recordId) return;
    if (!window.confirm("Confirm deletion of this medical record?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/patient/medical-records/${recordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDocuments(prev => prev.filter(doc => doc.id !== recordId));
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/v1/patient/upload-document', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data) {
        setDocuments(prevDocs => [response.data, ...prevDocs]);
      }
    } catch (err) {
      alert("Upload failed. Ensure file is PDF/JPG under 5MB.");
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  if (loading) return (
    <div style={loaderWrapperStyle}>
      <Loader2 size={32} style={{animation: 'spin 1s linear infinite'}} color="#059669" />
      <p>Accessing Secure Health Records...</p>
    </div>
  );

  if (error) return (
    <div style={errorContainerStyle}>
      <StaticCard style={{textAlign: 'center', maxWidth: '400px'}}>
        <AlertCircle size={40} color="#ef4444" style={{marginBottom: '16px'}} />
        <h3 style={{margin: '0 0 8px 0'}}>Connection Error</h3>
        <p style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>{error}</p>
        <button onClick={() => window.location.reload()} style={retryButtonStyle}>Retry Connection</button>
      </StaticCard>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* HEADER SECTION */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={avatarStyle}>
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={nameTitleStyle}>{profile?.first_name} {profile?.last_name}</h1>
              <div style={badgeStyle}><CheckCircle2 size={14} /> Verified Patient</div>
            </div>
            <p style={patientIdStyle}>NexHealth UID: {profile?.id || '---'}</p>
          </div>
        </div>
        <button style={outlineButtonStyle}><Edit3 size={16} /> Manage Records</button>
      </div>

      <div style={contentGridStyle}>
        {/* IDENTIFICATION BLOCK */}
        <StaticCard>
          <div style={cardHeaderStyle}>
            <ShieldCheck size={18} color="#059669" />
            <h3 style={sectionTitleStyle}>Government Identification</h3>
          </div>
          <div style={dataGrid3Style}>
            <DataRow label="ABHA ID" value={profile?.abha_id} icon={Fingerprint} />
            <DataRow label="ID Type" value={profile?.id_type} icon={ShieldCheck} />
            <DataRow label="ID Number" value={profile?.id_number} icon={ShieldCheck} />
          </div>
        </StaticCard>

        {/* VITALS BLOCK */}
        <StaticCard style={{ borderTop: '4px solid #059669' }}>
          <div style={cardHeaderStyle}>
            <Activity size={18} color="#059669" />
            <h3 style={sectionTitleStyle}>Clinical Parameters</h3>
          </div>
          <div style={dataGrid4Style}>
            <VitalMetric label="Blood Group" value={profile?.blood_group} icon={Droplet} color="#dc2626" />
            <VitalMetric label="Weight" value={profile?.weight} unit="kg" icon={Scale} color="#2563eb" />
            <VitalMetric label="Height" value={profile?.height} unit="cm" icon={Activity} color="#0d9488" />
            <VitalMetric label="Gender" value={profile?.gender} icon={User} color="#7c3aed" />
          </div>
          <div style={{marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9'}}>
            <DataRow label="Date of Birth" value={profile?.date_of_birth} icon={Calendar} />
          </div>
        </StaticCard>

        {/* VAULT BLOCK */}
        <StaticCard>
          <div style={cardHeaderStyle}>
            <FileText size={18} color="#059669" />
            <h3 style={sectionTitleStyle}>Medical Records Vault</h3>
          </div>
          <div style={vaultLayoutStyle}>
            <div style={dropzoneStyle}>
              {isUploading ? <Loader2 size={24} style={{animation: 'spin 1s linear infinite'}} /> : <Upload size={24} color="#64748b" />}
              <p style={uploadTextStyle}>Upload Clinical Records</p>
              <p style={uploadSubTextStyle}>PDF or Image (Max 5MB)</p>
              <input type="file" id="patient-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
              <label htmlFor="patient-upload" style={uploadButtonStyle}>Select File</label>
            </div>

            <div style={fileListStyle}>
              <p style={smallHeaderStyle}>Recent Documents</p>
              <div style={scrollContainerStyle}>
                {documents.length > 0 ? documents.map(doc => (
                  <div key={doc.id} style={fileRowStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={fileIconBgStyle}><FileText size={16} color="#059669" /></div>
                      <div>
                        <p style={fileNameStyle}>{doc.description?.split(': ')[1] || "Record"}</p>
                        <p style={fileDateStyle}>{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={`http://localhost:8000/${doc.file_url}`} target="_blank" rel="noreferrer" style={actionIconStyle}><ExternalLink size={14} /></a>
                      <button onClick={() => handleDeleteDocument(doc.id)} style={actionIconRedStyle}><Trash2 size={14} /></button>
                    </div>
                  </div>
                )) : <p style={emptyTextStyle}>No documents currently in vault.</p>}
              </div>
            </div>
          </div>
        </StaticCard>

        {/* CONTACT & EMERGENCY GRID */}
        <div style={dataGrid2Style}>
          <StaticCard>
            <div style={cardHeaderStyle}>
              <Phone size={18} color="#059669" />
              <h3 style={sectionTitleStyle}>Contact Details</h3>
            </div>
            <DataRow label="Email Address" value={profile?.email} icon={Mail} />
            <DataRow label="Primary Phone" value={profile?.phone_number} icon={Phone} />
            <DataRow label="Permanent Address" value={profile?.address} icon={MapPin} />
          </StaticCard>

          <StaticCard style={{ borderLeft: '4px solid #e11d48' }}>
            <div style={cardHeaderStyle}>
              <ShieldAlert size={18} color="#e11d48" />
              <h3 style={sectionTitleStyle}>Emergency Response</h3>
            </div>
            <DataRow label="Emergency Contact" value={profile?.emergency_contact} icon={ShieldAlert} />
            <DataRow label="Relationship" value={profile?.emergency_relation} />
            <DataRow label="Occupation" value={profile?.occupation} icon={Briefcase} />
          </StaticCard>
        </div>
      </div>
    </div>
  );
};

// --- STYLING OBJECTS ---

const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Inter", sans-serif' };
const headerSectionStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '24px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const avatarStyle = { width: '64px', height: '64px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' };
const nameTitleStyle = { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 };
const patientIdStyle = { fontSize: '13px', color: '#64748b', marginTop: '4px' };
const badgeStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' };

const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' };
const cardHeaderStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };
const sectionTitleStyle = { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 };

const contentGridStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const dataGrid3Style = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' };
const dataGrid4Style = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' };
const dataGrid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

const infoRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const labelTextStyle = { fontSize: '13px', color: '#64748b', fontWeight: '500' };
const valueTextStyle = { fontSize: '14px', color: '#0f172a', fontWeight: '600' };
const iconBoxStyle = { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const vitalCardStyle = { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const vitalLabelTextStyle = { fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' };
const vitalValueTextStyle = { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 };
const vitalUnitTextStyle = { fontSize: '12px', color: '#64748b', fontWeight: '500' };
const iconCircleStyle = { width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statusBadgeMiniStyle = { fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' };

const vaultLayoutStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' };
const dropzoneStyle = { border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const uploadTextStyle = { fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '12px 0 4px 0' };
const uploadSubTextStyle = { fontSize: '11px', color: '#94a3b8', margin: 0 };
const uploadButtonStyle = { marginTop: '16px', padding: '8px 20px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };

const fileListStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const scrollContainerStyle = { maxHeight: '240px', overflowY: 'auto', paddingRight: '8px' };
const fileRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '8px' };
const fileIconBgStyle = { padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '6px' };
const fileNameStyle = { fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: 0 };
const fileDateStyle = { fontSize: '11px', color: '#94a3b8', margin: 0 };
const smallHeaderStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' };

const outlineButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' };
const retryButtonStyle = { padding: '10px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const actionIconStyle = { padding: '6px', color: '#64748b', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#f1f5f9' };
const actionIconRedStyle = { ...actionIconStyle, color: '#ef4444' };
const emptyTextStyle = { fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '40px' };
const loaderWrapperStyle = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#64748b', fontSize: '14px' };
const errorContainerStyle = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default PatientProfile;