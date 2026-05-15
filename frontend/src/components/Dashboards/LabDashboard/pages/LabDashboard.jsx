import React, { useState } from 'react';
import LabSidebar from '../components/LabSidebar';
import LabHeader from '../components/LabHeader';
import TestRequests from './TestRequests';
import SampleCollection from './SampleCollection'; // 1. Import the new component

const LabDashboard = () => {
  // 2. Ensure your Sidebar is sending 'samples' as the key when clicked
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      
      <LabSidebar setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        <LabHeader />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="mb-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded">
                LIS / {activeTab === 'requests' ? 'Test Requests' : 'Sample Collection'}
              </p>
            </div>

            <div className="animate-in fade-in duration-500">
              {/* 3. Conditional Rendering Logic */}
              {activeTab === 'requests' && <TestRequests setActiveTab={setActiveTab} />}              
              {activeTab === 'samples' && <SampleCollection />}

              {/* Placeholder for future modules */}
              {activeTab === 'processing' && (
                <div className="p-10 bg-white rounded-xl border border-slate-100 text-center text-slate-400">
                  Test Processing module coming soon...
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