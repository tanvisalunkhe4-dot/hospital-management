import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

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
      <Sidebar /> 
      
      <div style={mainContent}>
        <Header />
        
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
  marginLeft: '300px',
  minWidth:0
};

const pageWrapper = { 
  padding: '40px', 
 
  overflowY: 'auto',
  backgroundColor: '#f8fafc', 
  maxWidth: '1400px'
};

export default PatientDashboard;