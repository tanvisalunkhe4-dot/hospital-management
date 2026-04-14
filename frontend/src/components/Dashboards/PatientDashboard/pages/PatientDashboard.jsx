import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Feature Page Imports - Keeping everything in /pages for consistency
import Overview from "./Overview";
import PatientProfile from "./PatientProfile";
import AppointmentManagement from "./AppointmentManagement";
import BillingPayments from "./BillingPayments";
import MedicalRecords from "./MedicalRecords";
import Notifications from "./Notifications";

const PatientDashboard = () => {
  return (
    <div style={dashboardLayout}>
      {/* Sidebar handles navigation via NavLinks */}
      <div style={{ width: '260px', flexShrink: 0 }}>
    <Sidebar />
  </div>
      
      <div style={mainContent}>
        
        <div style={pageWrapper}>
          <Routes>
            {/* Default to Overview when landing on /patient-dashboard */}
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

// Layout Styles (Matching Admin Aesthetic)
const dashboardLayout = { 
  display: 'flex', 
  minHeight: '100vh', 
  backgroundColor: '#f8fafc',
  fontFamily: "'Inter', sans-serif" 
};

const mainContent = { 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column',
  minWidth: 0,
  borderLeft: '1px solid #e2e8f0' // 🔥 clean professional divider
};

const pageWrapper = { 
  padding: '40px',              // keep spacing
  backgroundColor: '#f8fafc',
  width: '100%',                // full width
  margin: 0                     // remove centering
};
export default PatientDashboard;