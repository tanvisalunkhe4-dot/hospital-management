import React from 'react';
import { FlaskConical } from 'lucide-react';

const SampleCollection = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FlaskConical color="#10b981" />
        <h2 style={{ margin: 0 }}>Sample Collection Queue</h2>
      </div>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
        No samples currently pending collection.
      </div>
    </div>
  );
};
export default SampleCollection;