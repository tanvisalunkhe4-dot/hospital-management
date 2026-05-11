import React from 'react';

const TestResultCard = ({ patientName, testType, date, status }) => {
  const statusColors = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700"
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">{patientName}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1"><strong>Test:</strong> {testType}</p>
      <p className="text-xs text-gray-400">Date: {date}</p>
      <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        View Report
      </button>
    </div>
  );
};

export default TestResultCard;