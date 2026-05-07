import React, { useState, useEffect } from 'react';
import axios from 'axios';


import { ArrowLeft } from 'lucide-react';
import theme from "../../../../theme/theme";
const PatientRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'Male',
    address: '',
    abha_id: '',
    visit_type: 'New Patient',
    doctor_name: 'TBD'
  });

  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: '', type: '' });

    // Grab hospital_id from the logged-in user session
    const userData = JSON.parse(sessionStorage.getItem('user_data'));
    const currentHospitalId = userData?.hospital_id || 1; 

    const payload = {
      ...formData,
      hospital_id: currentHospitalId, 
    };

    try {
      await axios.post('http://localhost:8000/api/v1/receptionist/register-patient', payload);
      
      setStatus({ 
        loading: false, 
        msg: 'Registration successful! An invitation link will be sent to the patient.', 
        type: 'success' 
      });

      // Reset form fields
      setFormData({ 
        first_name: '', last_name: '', email: '', phone_number: '', 
        date_of_birth: '', gender: 'Male', address: '', abha_id: '',
        visit_type: 'New Patient', doctor_name: 'TBD' 
      });
      
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      let errorMsg = 'Registration failed. Please check your connection.';

      if (Array.isArray(errorDetail)) {
        errorMsg = `${errorDetail[0].loc[1]}: ${errorDetail[0].msg}`;
      } else if (typeof errorDetail === 'string') {
        errorMsg = errorDetail;
      }

      setStatus({ loading: false, msg: errorMsg, type: 'error' });
    }
  };
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const hospId = sessionStorage.getItem('hospital_id') || 1;
        
        const res = await axios.get(`http://localhost:8000/api/v1/receptionist/doctors/${hospId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to load doctors for registration:", err);
      }
    };
  
    fetchDoctors();
  }, []);
  // --- STYLES ---
  const backBtnStyle = { 
    border: 'none', 
    background: 'none', 
    color: '#059669', 
    fontWeight: '700', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    cursor: 'pointer', 
    width: 'fit-content',
    padding: '0',
    marginBottom: '24px'
  };

  const inputStyle = {
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc' // Subtle background to match other forms
  };

  const labelStyle = {
    fontSize: '11px',
    color: theme.colors.subtitle,
    fontWeight: 700,
    marginBottom: '4px',
    textTransform: 'uppercase'
  };

  return (
    <div style={{ background: theme.colors.background, padding: '10px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 1. BACK NAVIGATION */}
        <button onClick={onBack} style={backBtnStyle}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{
          backgroundColor: theme.colors.cardWhite,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.boxShadow.card,
          border: `1px solid #e2e8f0`
        }}>
          <h2 style={{ 
            color: theme.colors.text, 
            fontSize: theme.typography.fontSize.xl, 
            fontWeight: theme.typography.weight.bold,
            marginBottom: theme.spacing.lg,
            borderBottom: `2px solid #f1f5f9`,
            paddingBottom: theme.spacing.sm
          }}>
            Patient Registration
          </h2>

          {status.msg && (
            <div style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fee2e2',
              color: status.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 600,
              border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
            }}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>First Name</label>
               <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={inputStyle} placeholder="First Name" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Last Name</label>
               <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={inputStyle} placeholder="Last Name" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Email Address</label>
               <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="patient@example.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Phone Number</label>
               <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required style={inputStyle} placeholder="10-digit mobile" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Date of Birth</label>
               <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Gender</label>
               <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
               </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>Visit Type</label>
               <select name="visit_type" value={formData.visit_type} onChange={handleChange} style={inputStyle}>
                  <option value="New Patient">New Patient</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Routine Checkup">Routine Checkup</option>
               </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
   <label style={labelStyle}>Assign Consultant</label>
   <select 
      name="doctor_name" 
      value={formData.doctor_name} 
      onChange={handleChange} 
      style={inputStyle}
      required
   >
      <option value="TBD">Assign Later (TBD)</option>
      {/* 🟢 DYNAMIC LIVE DATA MAP */}
      {doctors.map((doc) => (
         <option key={doc.staff_id} value={doc.full_name}>
            Dr. {doc.full_name} ({doc.specialization})
         </option>
      ))}
   </select>
</div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={labelStyle}>ABHA ID (Optional)</label>
               <input type="text" name="abha_id" value={formData.abha_id} onChange={handleChange} style={inputStyle} placeholder="14-digit ABHA Number" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
               <label style={labelStyle}>Residential Address</label>
               <textarea name="address" value={formData.address} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Full residential details..."></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status.loading}
              style={{
                gridColumn: 'span 2',
                background: theme.colors.buttonGradient,
                color: 'white',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                fontWeight: theme.typography.weight.bold,
                cursor: status.loading ? 'not-allowed' : 'pointer',
                border: 'none',
                marginTop: theme.spacing.sm,
                boxShadow: theme.boxShadow.sm,
                transition: theme.transitions.default
              }}
            >
              {status.loading ? 'Processing...' : 'REGISTER PATIENT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;