import React from 'react';

const InventoryTable = () => {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Medicine Name</th>
            <th className="px-6 py-3">Batch</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3">Expiry</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 font-medium">Paracetamol 500mg</td>
            <td className="px-6 py-4">B-9920</td>
            <td className="px-6 py-4 text-green-600 font-bold">450</td>
            <td className="px-6 py-4">12/2027</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;