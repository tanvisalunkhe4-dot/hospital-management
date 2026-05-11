import React from 'react';

const BillingForm = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4">Generate Bill</h3>
      <div className="space-y-4">
        <input type="text" placeholder="Patient Name" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Medicine" className="p-2 border rounded-lg" />
          <input type="number" placeholder="Qty" className="p-2 border rounded-lg" />
        </div>
        <div className="border-t pt-4">
          <p className="flex justify-between font-bold">Total: <span>₹0.00</span></p>
        </div>
        <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">Print Invoice</button>
      </div>
    </div>
  );
};

export default BillingForm;