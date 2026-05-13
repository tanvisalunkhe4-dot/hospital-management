import React, { useState } from 'react';
import LabSidebar from '../components/LabSidebar';
import LabHeader from '../components/LabHeader';
import TestRequests from './TestRequests';

const LabDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    /* 1. Ensure the parent container fills the screen and hides overflow */
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      
      {/* 2. Sidebar - It will stay fixed because the parent has overflow-hidden */}
      <LabSidebar setActiveTab={setActiveTab} />
      
      {/* 3. Content Wrapper - This must be a flex column that also fits the screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        <LabHeader />
        
        {/* 4. Scrollable Workspace - ONLY this part moves */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Dynamic Label */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded">
                LIS / {activeTab}
              </p>
            </div>

            {/* Injected Content */}
            <div className="animate-in fade-in duration-500">
              {activeTab === 'requests' && <TestRequests />}
              
              {/* Add other views here */}
              {activeTab === 'samples' && (
                <div className="p-10 bg-white rounded-xl border border-slate-100 text-center text-slate-400">
                  Sample Collection module coming soon...
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabDashboard;