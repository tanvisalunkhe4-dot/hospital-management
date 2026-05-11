import React from 'react';

const LabHistory = () => {
  const historyData = [
    { id: 1, patient: "Janavi Patil", test: "Blood Count", date: "2026-05-01", result: "Normal" },
    { id: 2, patient: "Tanvi", test: "Lipid Profile", date: "2026-04-28", result: "High" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Laboratory History</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Patient</th>
              <th className="p-4 font-semibold text-gray-700">Test Type</th>
              <th className="p-4 font-semibold text-gray-700">Date</th>
              <th className="p-4 font-semibold text-gray-700">Result</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{item.patient}</td>
                <td className="p-4">{item.test}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4 font-medium">{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabHistory;