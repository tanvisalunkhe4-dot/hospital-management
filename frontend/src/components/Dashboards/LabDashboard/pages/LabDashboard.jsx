import React, { useState } from 'react';
import LabSidebar from '../components/LabSidebar';
import LabHeader from '../components/LabHeader';
import TestRequests from './TestRequests';
import SampleCollection from './SampleCollection';
import TestProcessing from './TestProcessing'; 
import ReportManager from './ReportManager';

const LabDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Helper to map tab IDs to display labels
  const getTabLabel = (tab) => {
    switch(tab) {
      case 'requests': return 'Test Requests';
      case 'samples': return 'Sample Collection';
      case 'processing': return 'Test Processing';
      case 'reports': return 'Laboratory Reports';
      case 'history': return 'Lab Records';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar - Fixed width 280px */}
      <LabSidebar setActiveTab={setActiveTab} />
      
      {/* Content Area - Uses flex-1 and ml-[280px] to respect sidebar space */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden ml-[280px]">        
        <LabHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="w-full h-full"> 
            
            {/* Breadcrumb / Section Identifier */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-100">
                LIS / {getTabLabel(activeTab)}
              </p>
            </div>
            
            {/* Active Module Container */}
            <div className="animate-in fade-in duration-500">
              {activeTab === 'requests' && <TestRequests setActiveTab={setActiveTab} />}              
              {activeTab === 'samples' && <SampleCollection />}
              {activeTab === 'processing' && <TestProcessing />}
              {activeTab === 'reports' && <ReportManager />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabDashboard;