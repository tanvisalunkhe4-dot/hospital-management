import React from 'react';
import PrescriptionCard from '../components/PrescriptionCard';

const MedicineDispensing = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dispensing Counter</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-semibold text-gray-500 mb-3">Pending Orders</h3>
          <PrescriptionCard id="1042" doctor="Shinde" medicines={["Amoxicillin", "Cough Syrup"]} />
        </div>
      </div>
    </div>
  );
};

export default MedicineDispensing;