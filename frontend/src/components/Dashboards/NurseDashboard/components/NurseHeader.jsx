import React from 'react';
import DashboardHeader from '../../../common/DashboardHeader';

const NurseHeader = () => (
  <DashboardHeader
    title="Nurse Dashboard"
    subtitle="Patient monitoring, ward coverage and shift updates"
    fallbackRole="Nurse"
  />
);

export default NurseHeader;