import React from 'react';

const PrescriptionCard = ({ id, doctor, medicines }) => {
  return (
    <div className="bg-white border-l-4 border-blue-500 p-4 rounded shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-800">Order #{id}</span>
        <span className="text-sm text-gray-500">Dr. {doctor}</span>
      </div>
      <ul className="text-sm text-gray-600 list-disc pl-4">
        {medicines.map((med, idx) => <li key={idx}>{med}</li>)}
      </ul>
      <button className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Dispense Medicine →</button>
    </div>
  );
};

export default PrescriptionCard;