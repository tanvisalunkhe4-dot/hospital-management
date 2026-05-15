import React, { useState } from 'react';
import LabSidebar from '../components/LabSidebar';
import LabHeader from '../components/LabHeader';
import TestRequests from './TestRequests';
import SampleCollection from './SampleCollection';
import TestProcessing from './TestProcessing'; // 1. Import the new component

const LabDashboard = () => {
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
                LIS / {
                  activeTab === 'requests' ? 'Test Requests' : 
                  activeTab === 'samples' ? 'Sample Collection' : 
                  'Test Processing'
                }
              </p>
            </div>

            <div className="animate-in fade-in duration-500">
              {activeTab === 'requests' && <TestRequests setActiveTab={setActiveTab} />}              
              {activeTab === 'samples' && <SampleCollection />}
              
              {/* 2. Replace the placeholder with the actual module */}
              {activeTab === 'processing' && <TestProcessing />}

              {activeTab === 'reports' && (
                <div className="p-10 bg-white rounded-xl border border-slate-100 text-center text-slate-400">
                  Reports module coming soon...
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