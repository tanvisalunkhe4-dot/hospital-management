import React, { useState } from 'react';
import LabSidebar from '../components/LabSidebar';
import LabHeader from '../components/LabHeader';
import TestRequests from './TestRequests';
// Import other pages as you build them...

const LabDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <LabSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LabHeader />
        <main style={{ padding: '24px', flex: 1 }}>
          {activeTab === 'requests' && <TestRequests />}
          {/* Add other conditional renders here */}
        </main>
      </div>
    </div>
  );
};

export default LabDashboard;