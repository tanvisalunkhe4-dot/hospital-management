import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
// Feature Page Imports
import Overview from "./Overview";
import PatientProfile from "./PatientProfile";
import AppointmentManagement from "./AppointmentManagement";
import BillingPayments from "./BillingPayments";
import MedicalRecords from "./MedicalRecords";
import Notifications from "./Notifications";

const PatientDashboard = () => {
  const deriveDisplayName = (data = {}) => {
    const fromFullName = data.full_name?.trim();
    if (fromFullName) return fromFullName;

    const fromFirstLast = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    if (fromFirstLast) return fromFirstLast;

    const fromEmail = data.email?.split('@')?.[0]?.trim();
    if (fromEmail) return fromEmail;

    const fromIdentifier = data.identifier?.trim();
    if (fromIdentifier) return fromIdentifier;

    return null;
  };

  const getInitialPatientInfo = () => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem('user_data') || '{}');
      return {
        full_name: deriveDisplayName(storedUser) || 'Patient Name',
        id: storedUser.id || '---',
        uhid: storedUser.uhid || null,
        is_2fa_enabled: Boolean(storedUser.is_2fa_enabled),
      };
    } catch {
      return { full_name: 'Patient Name', id: '---', uhid: null, is_2fa_enabled: false };
    }
  };

  const [patientInfo, setPatientInfo] = useState(getInitialPatientInfo);

  const handleProfileUpdated = (updates) => {
    setPatientInfo((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  useEffect(() => {
    const fetchPatientHeaderData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        
        // Safety check: if no token, don't even try the request
        if (!token) {
          console.warn("No token found, redirecting...");
          window.location.href = '/login';
          return;
        }

        const response = await axios.get('http://localhost:8000/api/v1/patient/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPatientInfo((prev) => ({
          ...prev,
          ...response.data,
          full_name: deriveDisplayName(response.data) || prev.full_name || 'Patient Name',
          id: response.data.id || prev.id,
          uhid: response.data.uhid || prev.uhid,
          is_2fa_enabled: response.data.is_2fa_enabled ?? prev.is_2fa_enabled,
        }));

      } catch (err) {
        console.error("Failed to load header data", err);
        // Handle 401 Unauthorized specifically
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token'); // Clear invalid token
          window.location.href = '/login';
        }
      }
    };

    fetchPatientHeaderData();
  }, []);

  return (
    <div style={dashboardLayout}>
      {/* Sidebar remains fixed on the left */}
      <div style={{ width: '280px', minWidth: '280px', flexShrink: 0 }}>        
        <Sidebar userData={{ full_name: patientInfo.full_name }} />
      </div>
      
      <div style={mainContent}>
        {/* 🟢 FIXED: Adding the Header at the top of the content area */}
        <Header
          userData={{
            full_name: patientInfo.full_name,
            id: patientInfo.uhid || patientInfo.id,
            is_2fa_enabled: patientInfo.is_2fa_enabled,
          }}
          onProfileUpdated={handleProfileUpdated}
        />
        
        <div style={pageWrapper}>
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="appointments" element={<AppointmentManagement />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="billing" element={<BillingPayments />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};


// ================== LAYOUT STYLES ==================
// ================== UPDATED LAYOUT STYLES ==================

const dashboardLayout = { 
  display: 'flex', 
  height: '100vh',         
  width: '100vw',
  overflow: 'hidden',      
  backgroundColor: '#f8fafc',
};

const mainContent = { 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden', 
};

const pageWrapper = { 
  flex: 1,            
  overflowY: 'auto',  
  padding: '24px 32px', // Balanced padding
  backgroundColor: '#f8fafc',
  width: '100%',        // Use full available width
  maxWidth: 'none',     // 🟢 REMOVE the 1400px limit
  margin: '0',          // 🟢 REMOVE '0 auto' to snap it to the left
  boxSizing: 'border-box' 
};
export default PatientDashboard;