import React from "react";
// 1. Change this line to import the new file
import AdminHeader from "../../AdminDashboard/components/Header";
const NurseHeader = ({ userData, onProfileUpdated }) => {
  return (
    // 2. Change the component name here as well
    <AdminHeader userData={userData} onProfileUpdated={onProfileUpdated} />
  );
};

export default NurseHeader;