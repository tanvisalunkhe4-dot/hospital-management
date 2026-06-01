import React, { useState } from "react";
import { Bed, Users } from "lucide-react";

const initialBeds = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  occupied: Math.random() > 0.5
}));

const WardManagement = () => {
  const [beds, setBeds] = useState(initialBeds);

  const toggleBed = (id) => {
    setBeds(
      beds.map((bed) =>
        bed.id === id
          ? { ...bed, occupied: !bed.occupied }
          : bed
      )
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "24px" }}>
        Ward Bed Management
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px"
      }}>
        {beds.map((bed) => (
          <div
            key={bed.id}
            onClick={() => toggleBed(bed.id)}
            style={{
              cursor: "pointer",
              padding: "24px",
              borderRadius: "12px",
              background: bed.occupied ? "#fee2e2" : "#dcfce7",
              border: "1px solid #e2e8f0",
              textAlign: "center"
            }}
          >
            <Bed size={32} />
            <h3>Bed {bed.id}</h3>
            <p>
              {bed.occupied ? "Occupied" : "Available"}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "24px",
        display: "flex",
        gap: "20px"
      }}>
        <div>
          <Users /> Occupied: {beds.filter(b => b.occupied).length}
        </div>
        <div>
          <Bed /> Available: {beds.filter(b => !b.occupied).length}
        </div>
      </div>
    </div>
  );
};

export default WardManagement;