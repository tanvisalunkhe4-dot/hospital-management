import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Pill,
  CheckCircle,
  Loader2
} from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/nurse"
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const TreatmentSupport = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);

  const fetchTreatments = async () => {
    try {
      const res = await api.get("/active-treatments");
      setTreatments(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const administer = async (id) => {
    await api.post("/record-medication", {
      prescription_id: id
    });

    setSuccess(id);

    setTimeout(() => setSuccess(null), 2000);
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  if (loading)
    return <Loader2 className="animate-spin" size={30} />;

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Active Treatment Support
      </h2>

      <div style={{
        display: "grid",
        gap: "16px"
      }}>
        {treatments.map((t) => (
          <div
            key={t.prescription_id}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <div>
                <h3>{t.medicine}</h3>
                <p>{t.dosage}</p>
                <p>{t.frequency}</p>
                <p>{t.duration}</p>
              </div>

              <button
                onClick={() => administer(t.prescription_id)}
                style={{
                  background: success === t.prescription_id ? "#22c55e" : "#059669",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                {success === t.prescription_id ? (
                  <>
                    <CheckCircle size={16}/> Recorded
                  </>
                ) : (
                  <>
                    <Pill size={16}/> Give Medication
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentSupport;