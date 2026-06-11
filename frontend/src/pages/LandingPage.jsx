import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme/theme';
import logo from '../assets/logo.png';
import DemoModal from '../components/DemoModal';
import { 
  Stethoscope, 
  FlaskConical, 
  ShieldCheck, 
  Activity, 
  Heart, 
  LayoutGrid, 
  FileSearch, 
  ClipboardCheck, 
  Database,
  X,
  Play,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const LandingPage = ({ onNavigate, onGetStarted, onLoginClick }) => { 
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  
  // Real project features mapped from your frontend modules
  const features = [
    { 
      name: "ABDM Sync Core", 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V12C3 17.5 7 21 12 23C17 21 21 17.5 21 12V7L12 2Z" fill="#10b981"/>
          <path d="M12 6V18M8 10H16M8 14H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      desc: "Architectural tracking using Unique Health Identifiers (UHID) tied directly to active check-ins." 
    },
    { 
      name: "Global Patient Lookup", 
      icon: <FileSearch size={32} color="#10b981" />, 
      desc: "Instantly fetch and reconstruct past records from the central patient archive matrix." 
    },
    { 
      name: "Multi-Tab Clinical Desk", 
      icon: <Stethoscope size={32} color="#10b981" />, 
      desc: "Interactive panel bridging demographics, prescriptions, and diagnostics on one viewport." 
    },
    { 
      name: "Vitals Telemetry Flowsheets", 
      icon: <Activity size={32} color="#10b981" />, 
      desc: "Structured entry logs for Pulse Rate, SpO2, Temperature, and Blood Pressure." 
    },
    { 
      name: "Vitals Priority Flags", 
      icon: <Heart size={32} color="#10b981" />, 
      desc: "Automated alert tags tracking and highlighting out-of-bounds clinical metrics." 
    },
    { 
      name: "12-Bed Smart Ward Matrix", 
      icon: <LayoutGrid size={32} color="#10b981" />, 
      desc: "Responsive grid mapping active patient check-ins and vacancy rates across floor boards." 
    },
    { 
      name: "Diagnostic Lab Lifecycles", 
      icon: <FlaskConical size={32} color="#10b981" />, 
      desc: "Bidirectional processing tracking lab requests from order placement to finalization logs." 
    },
    { 
      name: "Medication Execution Desk", 
      icon: <ClipboardCheck size={32} color="#10b981" />, 
      desc: "Real-time verification workspace tracking treatment states and drug dispatch actions." 
    },
  ];

  const doubledFeatures = [...features, ...features];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* 1. Enhanced Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={navbarStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={logoStyle}>Nex<span style={{ color: theme.colors.primary || '#10b981' }}>Health</span></span>
        </div>

        <div style={linkContainer}>
          <span style={navLink} onClick={() => onNavigate('about')}>About</span>
          <span style={navLink} onClick={() => onNavigate('features')}>Features</span>
          <span style={navLink} onClick={() => onNavigate('solutions')}>Solutions</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onLoginClick} style={loginBtnStyle}>Login</button>
          <button onClick={() => setShowDemoModal(true)} style={getStartedBtnStyle}>Launch Live Demo</button>
        </div>
      </motion.nav>

      {/* 2. Professional Hero Section */}
      <section style={heroContainerStyle}>
        <div style={bgBlurLayer} />
        <div style={gridLayer}>
          <motion.div animate={{ y: [0, -80] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', inset: 0, backgroundImage: 'inherit', backgroundSize: 'inherit' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={heroH1}>
            The Digital Spine of <br />
            <span style={heroGradientText}>Clinical Operations.</span>
          </h1>
          <p style={heroSub}>
            A robust, high-fidelity clinical manager featuring multi-tenant database protection, 
            real-time telemetry tracking, and integrated diagnostic tracking loops.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            {/* UPDATED: Launches Interactive Simulation UI instead of direct signups */}
            <motion.button 
              whileHover={{ y: -4 }} 
              onClick={() => setShowDemoModal(true)} 
              style={primaryBtn}
            >
              <Play size={18} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'text-top' }} /> 
              Launch Live Demo
            </motion.button>
            <motion.button whileHover={{ background: '#f1f5f9' }} onClick={() => onNavigate('features')} style={secondaryBtn}>Explore Features</motion.button>
          </div>

          {/* Core Dashboard UI Architecture Mockup */}
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={mockupOuter}>
            <div style={mockupInner}>
              <div style={mockSidebar}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ ...mockLine, width: i === 1 ? '100%' : '75%', background: i === 1 ? '#10b98133' : '#e2e8f0' }} />
                ))}
              </div>
              <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={mockMetricCard}>
                    <div style={{ width: '40%', height: '12px', background: '#10b981', borderRadius: '4px', margin: '12px' }} />
                    <div style={{ width: '25%', height: '20px', background: '#047857', borderRadius: '4px', margin: '0 12px' }} />
                  </div>
                  <div style={mockMetricCardLight}>
                    <div style={{ width: '50%', height: '12px', background: '#94a3b8', borderRadius: '4px', margin: '12px' }} />
                    <div style={{ width: '30%', height: '20px', background: '#475569', borderRadius: '4px', margin: '0 12px' }} />
                  </div>
                </div>
                
                <div style={mockChartArea}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '15px' }}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} style={{ height: '50px', borderRadius: '8px', border: '1px solid #e2e8f0', background: index % 3 === 0 ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: index % 3 === 0 ? '#ef4444' : '#10b981' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Feature Cards Flow - Infinite Marquee */}
      <section style={{ padding: '100px 0', background: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>
           High-Fidelity Feature Matrix
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '60px', fontSize: '1.1rem' }}>Fully synced frontend interfaces interacting directly with FastAPI database layers.</p>
        <div style={marqueeWrapper}>
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }} 
            style={{ display: 'flex', gap: '30px', width: 'max-content' }}
          >
            {doubledFeatures.map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10, borderColor: '#10b981' }} 
                onClick={() => onNavigate('features')} 
                style={featureCardStyle}
              >
                <div style={featureIconWrapper}>{f.icon}</div>
                <h4 style={featureTitle}>{f.name}</h4>
                <p style={featureDesc}>{f.desc}</p>
                <span style={featureLink}>Review Module Code ›</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    
      {/* 4. The "Unified Practice" Section */}
      <section style={{ padding: '120px 80px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '100px', alignItems: 'center' }}>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px' }}>
                Secure Backend Architecture
              </div>
              <h2 style={{ fontSize: '3.2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, marginBottom: '30px', letterSpacing: '-1.5px' }}>
                Engineered for isolation, <br /> built for <span style={{ color: '#10b981' }}>clinical trust.</span>
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.6, marginBottom: '40px' }}>
                NexHealth coordinates mission-critical flows securely. Data operations are isolated under token-verified checks, preventing unauthorized cross-tenant queries.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {['Multi-Tenant Isolation', 'Role-Based RBAC Guards', 'Event-Driven Vitals Flags', 'SQLAlchemy Data Mapping'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#1e293b' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    {item}
                  </div>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDemoModal(true)}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '18px 40px', borderRadius: '12px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.2)' }}
              >
                Simulate System Core
              </motion.button>
            </motion.div>

            {/* Right Side: Vitals Priority Condition Visualizer */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} style={{ position: 'relative' }}>
              <div style={{ background: '#ffffff', borderRadius: '32px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 40px 80px -15px rgba(0,0,0,0.08)' }}>
                <div style={{ background: '#fff', borderRadius: '20px', height: '380px', width: '100%', overflow: 'hidden', border: '1px solid #f1f5f9', position: 'relative', padding: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: '800', color: '#1e293b' }}>Live Patient Monitoring Engine</span>
                      <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>API Live Status</span>
                   </div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', background: '#f8fafc', marginBottom: '10px', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Patient Profile #223061</div>
                       <div style={{ fontSize: '11px', color: '#64748b' }}>Bed Space 04 — Active Checked In</div>
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>98.4 °F</span>
                       <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>72 BPM</span>
                     </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fee2e2', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontWeight: '700', fontSize: '14px', color: '#991b1b' }}>Patient Profile #223062</div>
                       <div style={{ fontSize: '11px', color: '#b91c1c' }}>Bed Space 09 — Priority Emergency</div>
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>103.1 °F</span>
                       <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>118 BPM</span>
                     </div>
                   </div>
                </div>
                
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: '#0f172a', padding: '16px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', width: '280px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Database size={20} color="#fff" />
                  </div>
                  <div>
                     <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#fff' }}>RBAC Token Injection</div>
                     <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>Bearer Dependency Verified</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Execution Pipeline Roadmap */}
      <section style={{ padding: '100px 80px', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>Platform Data Verification <span style={{ color: '#10b981' }}>Pipeline</span></h2>
          <p style={{ color: '#64748b', marginTop: '10px' }}>How medical operations map securely to backend persistence objects.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '40px', left: '15%', right: '15%', height: '2px', zIndex: 0, borderTop: '2px dashed #e2e8f0' }} />

          {[
            { step: "01", title: "Endpoint Request Authorization", desc: "Frontends inject session storage cryptographic strings into outgoing Axios dependencies." },
            { step: "02", title: "FastAPI Dependency Router", desc: "Backend decodes credentials and matches patient query contexts to strict structural tables." },
            { step: "03", title: "State Update Cascade", desc: "Refreshed matrices push status shifts dynamically out to the ward maps and monitoring screens." }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '900', margin: '0 auto 25px', boxShadow: '0 10px 20px rgba(16,185,129,0.15)' }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. System Deployment / Contact */}
      <section style={{ padding: '100px 80px', textAlign: 'center', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <h2 style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Ready to review NexHealth?</h2>
          <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px' }}>Experience a secure ecosystem built for the modern digital health grid.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowDemoModal(true)}
            style={{ padding: '18px 50px', background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            Launch Interactive Demo Window
          </motion.button>
      </section>
      
      {/* 7. Full-Width Specialized Green Footer */}
      <footer style={{ width: '100%', backgroundColor: '#021205', backgroundImage: 'radial-gradient(circle at 50% -20%, #064e3b 0%, transparent 80%)', color: '#ffffff', padding: '100px 0 60px 0', borderTop: `1px solid rgba(16, 185, 129, 0.2)`, position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 40px', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '60px', marginBottom: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
                  Nex<span style={{ color: '#10b981' }}>Health</span>
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '280px' }}>
                A secure frontend clinical ecosystem running on a containerized FastAPI backend. Fully decoupled architecture.
              </p>
            </div>

            <div>
              <h4 style={footerHeadingStyle}>Frontend Interfaces</h4>
              <ul style={footerListStyle}>
                {['WardManagement', 'PatientMonitoring', 'LabReports', 'VitalsManagement', 'RecordsAccess'].map(item => (
                  <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={footerHeadingStyle}>FastAPI Backend</h4>
              <ul style={footerListStyle}>
                {['Authentication Guard', 'Nurse Operations Router', 'Doctor Prescription API', 'SQLAlchemy Session Pipeline'].map(item => (
                  <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={footerHeadingStyle}>Specifications</h4>
              <ul style={footerListStyle}>
                {['JSON Web Tokens', 'PostgreSQL Layer', 'Uvicorn Engine', 'Lucide Vector Assets'].map(item => (
                  <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h4 style={footerHeadingStyle}>Local Routing Node</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                Server Instance Up
              </div>
              <div style={{ marginTop: '20px', opacity: 0.5, fontSize: '0.75rem', lineHeight: 1.5 }}>
                Localhost Engine (Active)<br />
                Asynchronous Network Mode
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', opacity: 0.4 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #fff', padding: '2px 6px', borderRadius: '4px' }}>UHID VALIDATED</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #fff', padding: '2px 6px', borderRadius: '4px' }}>RBAC PROTECTED</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: 'auto' }}>
              © 2026 NexHealth. Full Stack Architectural Blueprint.
            </div>
          </div>
        </div>
      </footer>

    {/* --- BRAND NEW INTERACTIVE PLATFORM DEMO SIMULATOR MODAL --- */}
    <AnimatePresence>
        {showDemoModal && (
          <DemoModal 
            isOpen={showDemoModal} 
            onClose={() => { setShowDemoModal(false); setDemoStep(1); }}
            currentStep={demoStep}
            setStep={setDemoStep}
          />
        )}
      </AnimatePresence>      

    </div>
  );
};

// Layout Styles Summary
const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px', height: '80px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid rgba(16, 185, 129, 0.1)' };
const logoStyle = { fontWeight: '800', fontSize: '1.6rem', letterSpacing: '-0.03em', color: '#0f172a' };
const linkContainer = { display: 'flex', gap: '32px' };
const navLink = { fontSize: '15px', fontWeight: '500', color: '#475569', cursor: 'pointer' };

const heroContainerStyle = { padding: '160px 0 100px', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const bgBlurLayer = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(120px)', opacity: 0.05, zIndex: 0 };
const gridLayer = { position: 'absolute', inset: 0, zIndex: 1, backgroundSize: '80px 80px', backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.06) 1px, transparent 1px)', maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)' };

const heroH1 = { fontSize: '4.5rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', letterSpacing: '-0.05em', marginBottom: '28px' };
const heroGradientText = { background: 'linear-gradient(90deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroSub = { fontSize: '1.25rem', color: '#475569', margin: '0 auto 48px auto', maxWidth: '700px', lineHeight: '1.6' };

const primaryBtn = { background: '#10b981', color: '#fff', padding: '20px 44px', borderRadius: '14px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center' };
const secondaryBtn = { background: '#fff', color: '#0f172a', padding: '20px 44px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' };
const loginBtnStyle = { background: 'transparent', border: '1px solid #e2e8f0', padding: '10px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const getStartedBtnStyle = { background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };

const mockupOuter = { width: '1000px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '12px', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' };
const mockupInner = { background: '#fff', borderRadius: '24px', height: '320px', display: 'flex', overflow: 'hidden' };
const mockSidebar = { width: '200px', background: '#f8fafc', borderRight: '1px solid #f1f5f9', padding: '30px 20px' };
const mockLine = { height: '10px', borderRadius: '4px', marginBottom: '20px' };
const mockMetricCard = { flex: 1, height: '80px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #d1fae5' };
const mockMetricCardLight = { flex: 1, height: '80px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' };
const mockChartArea = { height: '160px', width: '100%', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' };

const marqueeWrapper = { overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' };
const featureCardStyle = { flex: '0 0 320px', backgroundColor: '#f0fdf4', padding: '40px 30px', borderRadius: '32px', border: '2px solid #d1fae5', borderTop: '6px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '15px', transition: '0.4s' };
const featureIconWrapper = { fontSize: '2.2rem', background: '#fff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 8px 15px rgba(16, 185, 129, 0.1)' };
const featureTitle = { margin: 0, fontSize: '1.25rem', color: '#064e3b', fontWeight: '900' };
const featureDesc = { fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', margin: 0 };
const featureLink = { color: '#10b981', fontWeight: '800', fontSize: '0.85rem', marginTop: 'auto' };

const footerHeadingStyle = { color: '#f8fafc', fontSize: '0.85rem', marginBottom: '24px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' };
const footerListStyle = { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' };
const footerLinkStyle = { cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', transition: 'color 0.2s ease', display: 'inline-block' };

// Modal Styles
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle = { background: '#ffffff', width: '100%', maxWidth: '640px', borderRadius: '24px', padding: '32px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.25)', position: 'relative' };
const closeModalBtn = { background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' };

export default LandingPage;