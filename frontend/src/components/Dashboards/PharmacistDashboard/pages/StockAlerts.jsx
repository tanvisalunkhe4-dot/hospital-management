import React from 'react';

const StockAlerts = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Low Stock Alerts</h2>
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <p className="text-red-700"><strong>Attention:</strong> Insulin vials and Vitamin C tablets are below threshold.</p>
      </div>
    </div>
  );
};

export default StockAlerts;