import React from 'react';

const TestProcessing = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lab Overview & Processing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 border-l-4 border-blue-500 shadow">
          <h3 className="font-semibold text-blue-700">Pending Tests</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
    </div>
  );
};

export default TestProcessing;