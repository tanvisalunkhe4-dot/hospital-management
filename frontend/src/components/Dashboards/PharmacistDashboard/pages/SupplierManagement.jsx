import React from 'react';

const SupplierManagement = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Supplier Directory</h2>
      <button className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">+ Add New Supplier</button>
      <div className="bg-white p-4 rounded shadow text-gray-500 text-center">No suppliers added yet.</div>
    </div>
  );
};

export default SupplierManagement;