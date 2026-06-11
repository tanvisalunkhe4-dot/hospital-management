import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, CheckCircle2, LayoutGrid, 
  Activity, ShieldAlert, FlaskConical, Search, Database, Terminal, ShieldCheck 
} from 'lucide-react';

const DemoModal = ({ isOpen, onClose }) => {
  const [demoStep, setDemoStep] = useState(1);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'code'

  if (!isOpen) return null;

  // Comprehensive list of platform steps mimicking your project modules
  const stepsData = [
    {
      step: 1,
      title: "12-Bed Smart Ward Grid",
      module: "WardManagement.jsx",
      desc: "Queries the FastAPI cache to dynamically monitor floor configurations. Green slots symbolize available beds, red identifies active occupants, and pulsing rings indicate real-time state changes.",
      code: `// WardManagement.jsx snippet
const fetchWardGrid = async () => {
  const token = sessionStorage.getItem('token');
  const res = await axios.get('http://localhost:8000/api/v1/nurse/ward-matrix', {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  setBeds(res.data);
};`,
      component: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxWidth: '440px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
            <div key={idx} style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: idx === 3 || idx === 6 ? '#fee2e2' : '#dcfce7', border: idx === 3 || idx === 6 ? '1px solid #fca5a5' : '1px solid #86efac', position: 'relative' }}>
              {idx === 3 && <span style={pulsingDot} />}
              <span style={{ fontSize: '12px', fontWeight: '800', color: idx === 3 || idx === 6 ? '#991b1b' : '#14532d' }}>Bed 0{idx}</span>
              <div style={{ fontSize: '10px', opacity: 0.7, color: idx === 3 || idx === 6 ? '#b91c1c' : '#166534' }}>{idx === 3 || idx === 6 ? "Occupied" : "Available"}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      step: 2,
      title: "Structured Vitals Entry",
      module: "VitalsManagement.jsx",
      desc: "Captures nurse metric points (BP, Pulse, Temp, SpO2) through input arrays. Once validated, it fires an authenticated Axios context block down to regional persistence layers.",
      code: `// VitalsManagement.jsx snippet
const handleVitalsSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  await axios.post(\`\${API_BASE}/vitals-history/\${patientId}\`, vitals, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  navigate('/dashboard/monitoring');
};`,
      component: (
        <div style={{ maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={vitalRowStyle}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Systolic/Diastolic BP</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>120 / 80 mmHg</span>
          </div>
          <div style={vitalRowStyle}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Pulse Rate</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>72 BPM</span>
          </div>
          <div style={vitalRowStyle}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Oxygen Saturation (SpO2)</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>98 %</span>
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: "Real-time Monitoring & Flags",
      module: "PatientMonitoring.jsx",
      desc: "Orders global patient check-ins by cross-checking the timestamps. When incoming numbers cross physical safety ceilings, the code runtime forces an instant conditional visual alert.",
      code: `// PatientMonitoring.jsx snippet
rawData.sort((a, b) => {
  const getTimeValue = (vitals) => {
    const val = vitals?.last_update;
    if (!val || val === 'Never') return 0;
    return new Date(\`\${today} \${val}\`).getTime();
  };
  return getTimeValue(b.vitals) - getTimeValue(a.vitals);
});`,
      component: (
        <div style={alertBoxStyle}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>Hyperpyrexia Condition Tag Triggered</div>
            <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px' }}>Patient Profile #223062 logged Core Body Temp at 103.4 °F</div>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: "Bidirectional Lab Lifecycles",
      module: "LabReports.jsx",
      desc: "Traces dynamic diagnostic workflows across medical departments. Tracks status parameters asynchronously from order configurations down to finalized server logs.",
      code: `// LabReports.jsx snippet
const updateLabStatus = async (labId, status) => {
  await axios.patch(\`http://localhost:8000/api/v1/doctor/lab-orders/\${labId}\`, { status }, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
};`,
      component: (
        <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '10px' }}>
            <span style={{ fontWeight: '800', color: '#475569' }}>CBC & Serum Electrolytes</span>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', fontSize: '10px' }}>Processing</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Ordered by Dr. Patil — Linked to central lab nodes.</span>
          </div>
        </div>
      )
    },
    {
      step: 5,
      title: "FastAPI Dependency Guards",
      module: "auth_bearer.py",
      desc: "Verifies signature integrity on incoming requests. Isolates queries to ensure that users can only manipulate records registered within their authorized clinical role.",
      code: `# auth_bearer.py snippet
def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload if payload["role"] in ALLOWED_ROLES else None
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")`,
      component: (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 20px', borderRadius: '12px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#065f46', fontFamily: 'monospace' }}>JWT Token Injection Validated</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>Role Context Passed: Nurse Desk Endpoint Node Access</div>
        </div>
      )
    },
    {
      step: 6,
      title: "Global Relational Archive",
      module: "models.py (PostgreSQL)",
      desc: "Commits clinical metrics to relational database tables using SQLAlchemy models. Enforces relational schema targets to avoid synchronization drops.",
      code: `# models.py relational mapping
class PatientVital(Base):
    __tablename__ = "patient_vitals"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.enrollment_id"))
    blood_pressure = Column(String, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)`,
      component: (
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ color: '#34d399', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '6px', fontWeight: 'bold' }}>postgres@nexhealth_db_logs:</div>
          <div>[INFO] 2026-06-11 15:54:12 - INSERT INTO patient_vitals (patient_id, blood_pressure)</div>
          <div style={{ color: '#fbbf24' }}>[SUCCESS] Commit complete. 1 row added [UHID Ref: 22306142].</div>
        </div>
      )
    }
  ];

  const currentData = stepsData[demoStep - 1];

  return (
    <div style={modalOverlayStyle}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={modalContentStyle}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              NexHealth Platform Blueprint Simulator
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Deep dive architecture simulation of connected core components
            </p>
          </div>
          <button onClick={() => { onClose(); setDemoStep(1); }} style={closeModalBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress Scrubber */}
        <div style={scrubberTrackStyle}>
          {stepsData.map(s => (
            <div 
              key={s.step} 
              onClick={() => setDemoStep(s.step)}
              style={{ 
                ...scrubberItemStyle, 
                background: demoStep === s.step ? '#10b981' : demoStep > s.step ? '#34d399' : '#e2e8f0',
              }}
              title={s.title}
            />
          ))}
        </div>

        {/* Info Box */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Step 0{currentData.step}: {currentData.title}
            </span>
            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontFamily: 'monospace' }}>
              {currentData.module}
            </span>
          </div>
          <p style={stepDescriptionStyle}>{currentData.desc}</p>
        </div>

        {/* Viewport Control Tab Bar */}
        <div style={tabBarStyle}>
          <button 
            onClick={() => setActiveTab('preview')} 
            style={{ ...tabBtnStyle, color: activeTab === 'preview' ? '#10b981' : '#64748b', borderBottomColor: activeTab === 'preview' ? '#10b981' : 'transparent' }}
          >
            <LayoutGrid size={14} style={{ marginRight: '6px' }} /> Interactive UI Preview
          </button>
          <button 
            onClick={() => setActiveTab('code')} 
            style={{ ...tabBtnStyle, color: activeTab === 'code' ? '#10b981' : '#64748b', borderBottomColor: activeTab === 'code' ? '#10b981' : 'transparent' }}
          >
            <Terminal size={14} style={{ marginRight: '6px' }} /> Embedded Code Logic
          </button>
        </div>

        {/* Main Display Simulation Viewport */}
        <div style={viewportStyle}>
          <AnimatePresence mode="wait">
            {activeTab === 'preview' ? (
              <motion.div key="preview" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} style={{ width: '100%' }}>
                {currentData.component}
              </motion.div>
            ) : (
              <motion.div key="code" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} style={codeWrapperStyle}>
                <pre style={{ margin: 0, overflowX: 'auto' }}>{currentData.code}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls Panel Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', alignItems: 'center' }}>
          <button 
            disabled={demoStep === 1}
            onClick={() => { setDemoStep(p => p - 1); setActiveTab('preview'); }}
            style={{ ...btnSecondary, opacity: demoStep === 1 ? 0.4 : 1, cursor: demoStep === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous Module
          </button>
          
          {demoStep < 6 ? (
            <button onClick={() => { setDemoStep(p => p + 1); setActiveTab('preview'); }} style={btnPrimary}>
              Next Blueprint <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={() => { onClose(); setDemoStep(1); setActiveTab('preview'); }} style={btnFinish}>
              Finish Simulation Walkthrough <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Inline Component Isolated Style Specifications
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle = { background: '#ffffff', width: '100%', maxWidth: '720px', borderRadius: '28px', padding: '36px', boxShadow: '0 40px 80px -15px rgba(15,23,42,0.3)', position: 'relative', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' };
const closeModalBtn = { background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' };

const scrubberTrackStyle = { display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '24px' };
const scrubberItemStyle = { flex: 1, height: '6px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' };

const stepDescriptionStyle = { margin: '4px 0 0 0', fontSize: '14px', color: '#475569', lineHeight: 1.6 };
const tabBarStyle = { display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '16px', marginBottom: '16px' };
const tabBtnStyle = { background: 'none', border: 'none', padding: '8px 4px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', borderBottom: '2px solid transparent', transition: 'all 0.2s' };

const viewportStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };
const vitalRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const alertBoxStyle = { background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '440px', margin: '0 auto' };
const codeWrapperStyle = { width: '100%', background: '#0f172a', color: '#e2e8f0', padding: '20px', borderRadius: '14px', fontFamily: '"Fira Code", monospace', fontSize: '12px', lineHeight: 1.5, overflowX: 'auto', textAlign: 'left' };

const pulsingDot = { position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(239,68,68,0.4)' };

const btnSecondary = { padding: '12px 24px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' };
const btnPrimary = { padding: '12px 26px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' };
const btnFinish = { padding: '12px 26px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' };

export default DemoModal;