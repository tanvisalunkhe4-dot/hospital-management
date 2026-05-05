import React from 'react';
import NurseSidebar from '../components/NurseSidebar';
import NurseHeader from '../components/NurseHeader';

import PatientMonitoring from './PatientMonitoring';

import { Outlet } from 'react-router-dom'; 

const NurseDashboard = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      <NurseSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NurseHeader />
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* This renders NurseOverview, WardManagement, etc. */}
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;