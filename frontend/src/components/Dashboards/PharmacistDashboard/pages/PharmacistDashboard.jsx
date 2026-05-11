import React from 'react';
import { Outlet } from 'react-router-dom';
import PharmacistSidebar from "../components/PharmacistSidebar";
import PharmacistHeader from "../components/PharmacistHeader";

const PharmacistDashboard = () => {
  return (
    <div style={dashboardLayout}>
      {/* Fixed Sidebar */}
      <PharmacistSidebar />

      <div style={mainContent}>
        {/* Fixed Header */}
        <PharmacistHeader />

        {/* Dynamic Page Content */}
        <main style={scrollableArea}>
          <div style={contentWrapper}>
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Dashboard Layout Styles ---
const dashboardLayout = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  backgroundColor: '#f8fafc' // Subtle gray background for the whole dashboard
};

const mainContent = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden'
};

const scrollableArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  // Smooth scrolling for a premium feel
  scrollBehavior: 'smooth'
};

const contentWrapper = {
  maxWidth: '1600px', // Prevents content from becoming too wide on ultrawide monitors
  margin: '0 auto',
  width: '100%'
};

export default PharmacistDashboard;