import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Target, Eye, ShieldCheck, Zap, Activity, Mail, Phone, 
  MapPin, Globe, Users, Award, Database, Cpu, Layout, Server, Lock 
} from 'lucide-react';
import theme from '../theme/theme';

const AboutPage = ({ onBack }) => {
  // Sophisticated Entrance Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div style={pageWrapper}>
      {/* 1. SOFT MESH BACKGROUND */}
      <div style={meshBg} />

      {/* 2. NAVBAR */}
      <nav style={navbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={logoStyle}>Nex<span style={{ color: '#10b981' }}>Health</span></span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, x: -5 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={onBack} 
          style={backBtn}
        >
          <ArrowLeft size={18} /> Back to Home
        </motion.button>
      </nav>

      {/* 3. HERO SECTION */}
      <section style={heroSection}>
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={fadeInUp} style={aboutBadge}>Engineering Excellence</motion.div>
          <motion.h1 variants={fadeInUp} style={mainTitle}>
            The Digital Spine of <span style={gradientText}>Modern Care.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} style={mainSubtitle}>
            NexHealth is a unified clinical infrastructure built to eliminate administrative friction and empower healthcare providers with elite digital tools.
          </motion.p>
        </motion.div>
      </section>

      {/* 4. STATS - CLEAN MINIMAL CARDS */}
      <section style={statsSection}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={containerVariants} 
          style={statsGrid}
        >
          <StatBox icon={<Layout />} count="12+" label="Core Modules" />
          <StatBox icon={<ShieldCheck />} count="RBAC" label="Advanced Security" />
          <StatBox icon={<Cpu />} count="FastAPI" label="Sync Latency <50ms" />
          <StatBox icon={<Activity />} count="Live" label="Cloud Infrastructure" />
        </motion.div>
      </section>

      {/* 5. ROADMAP - REFINED WHITE CARDS */}
      <section style={contentSection}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={sectionHeading}>Strategic <span style={{ color: '#10b981' }}>Roadmap</span></h2>
          <p style={sectionSubheading}>Future-proofing the Indian healthcare ecosystem.</p>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={containerVariants}
          style={roadmapGrid}
        >
          <RoadmapCard phase="Phase 1" title="WhatsApp Automation" desc="Instant delivery of lab reports and clinical alerts." icon={<Mail />} />
          <RoadmapCard phase="Phase 2" title="ABHA Integration" desc="Seamless linking of government health IDs and records." icon={<ShieldCheck />} />
          <RoadmapCard phase="Phase 3" title="Digital Prescription" desc="Zero-paper treatment workflows with secure routing." icon={<Activity />} />
          <RoadmapCard phase="Phase 4" title="Inventory Intelligence" desc="Real-time stock tracking for pharmacy and equipment." icon={<Database />} />
          <RoadmapCard phase="Phase 5" title="Offline Resilience" desc="PWA architecture for uninterrupted service in low-sync zones." icon={<Zap />} />
          <RoadmapCard phase="Phase 6" title="Clinical AI" desc="Machine learning for early markers and risk diagnosis." icon={<Cpu />} />
        </motion.div>
      </section>

      {/* 6. FOOTER */}
      {/* 6. UPDATED BRANDED FOOTER */}
      <footer style={footerContainer}>
        <div style={footerMainContent}>
          <div style={footerBrandCol}>
            <div style={footerLogoWrapper}>
              <span style={footerLogoText}>Nex<span style={{ color: '#fff', opacity: 0.8 }}>Health</span></span>
            </div>
            <p style={footerBrandDesc}>
              Defining professional healthcare standards through innovation, security, and elite user experiences.
            </p>
          </div>

          <div style={footerLinksWrapper}>
            <div style={footerLinkCol}>
              <h4 style={footerColTitle}>Navigation</h4>
              <span style={footerLink}>Project Vision</span>
              <span style={footerLink}>Tech Stack</span>
              <span style={footerLink}>Architecture</span>
            </div>
            <div style={footerLinkCol}>
              <h4 style={footerColTitle}>Get in Touch</h4>
              <div style={contactItem}><Mail size={16} /> hello@nexhealth.com</div>
              <div style={contactItem}><MapPin size={16} /> Pune, Maharashtra</div>
              <div style={contactItem}><Globe size={16} /> v1.0.4 Build</div>
            </div>
          </div>
        </div>
        <div style={footerBottomLine}>
          <p>© 2026 NexHealth Systems • Engineering the Future of Care</p>
        </div>
      </footer>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatBox = ({ icon, count, label }) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }} 
    style={statBoxStyle}
  >
    <div style={{ color: '#10b981', marginBottom: '15px' }}>{icon}</div>
    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', margin: '5px 0' }}>{count}</h2>
    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{label}</p>
  </motion.div>
);

const RoadmapCard = ({ phase, title, desc, icon }) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
    whileHover={{ y: -5, borderColor: '#10b981' }}
    style={roadmapCardStyle}
  >
    <div style={phaseBadge}>{phase}</div>
    <div style={{ color: '#10b981', marginBottom: '20px' }}>{icon}</div>
    <h4 style={roadmapTitle}>{title}</h4>
    <p style={roadmapDesc}>{desc}</p>
  </motion.div>
);

// --- STYLES (CLEAN MEDICAL LIGHT THEME) ---
const pageWrapper = { background: '#f8fafc', minHeight: '100vh', color: '#0f172a', position: 'relative', overflowX: 'hidden' };
const meshBg = { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.5 };

const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px', height: '80px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid #e2e8f0' };
const logoStyle = { fontWeight: '900', fontSize: '1.6rem', letterSpacing: '-0.02em' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.3s' };

const heroSection = { padding: '180px 20px 100px', textAlign: 'center', position: 'relative' };
const mainTitle = { fontSize: '4.2rem', fontWeight: '900', color: '#0f172a', margin: '20px 0', letterSpacing: '-0.03em' };
const gradientText = { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const mainSubtitle = { fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' };
const aboutBadge = { color: '#059669', background: '#dcfce7', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', display: 'inline-block', textTransform: 'uppercase' };

const statsSection = { padding: '0 80px 80px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', maxWidth: '1100px', margin: '0 auto' };
const statBoxStyle = { background: '#fff', border: '1px solid #e2e8f0', padding: '35px 25px', borderRadius: '24px', textAlign: 'center', transition: '0.3s' };

const contentSection = { padding: '100px 80px' };
const sectionHeading = { fontSize: '2.8rem', fontWeight: '900', color: '#0f172a' };
const sectionSubheading = { color: '#64748b', fontSize: '1.1rem', marginTop: '8px' };

const roadmapGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' };
const roadmapCardStyle = { padding: '40px 30px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', transition: '0.3s' };
const phaseBadge = { position: 'absolute', top: '25px', right: '25px', color: '#10b981', fontSize: '0.7rem', fontWeight: '900', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' };
const roadmapTitle = { fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' };
const roadmapDesc = { color: '#64748b', lineHeight: '1.7', fontSize: '0.95rem' };

const footerContainer = { 
  background: '#064e3b', // Deep Emerald Green 
  color: '#ecfdf5', 
  padding: '80px 80px 40px', 
  position: 'relative', 
  zIndex: 2,
  marginTop: '60px'
};

const footerMainContent = { 
  maxWidth: '1100px', 
  margin: '0 auto', 
  display: 'flex', 
  justifyContent: 'space-between', 
  gap: '60px' 
};

const footerBrandCol = { maxWidth: '350px' };

const footerLogoWrapper = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  marginBottom: '20px' 
};

const footerLogoText = { 
  fontSize: '1.8rem', 
  fontWeight: '900', 
  color: '#10b981' // Bright green for "Nex"
};

const footerBrandDesc = { 
  color: '#a7f3d0', 
  fontSize: '0.95rem', 
  lineHeight: '1.7', 
  opacity: 0.8 
};

const footerLinksWrapper = { display: 'flex', gap: '80px' };

const footerLinkCol = { display: 'flex', flexDirection: 'column', gap: '15px' };

const footerColTitle = { 
  fontSize: '1.1rem', 
  fontWeight: '700', 
  marginBottom: '10px', 
  color: '#fff' 
};

const footerLink = { 
  color: '#a7f3d0', 
  fontSize: '0.9rem', 
  cursor: 'pointer', 
  opacity: 0.7, 
  transition: '0.3s' 
};

const contactItem = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  color: '#a7f3d0', 
  fontSize: '0.9rem', 
  opacity: 0.7 
};

const footerBottomLine = { 
  maxWidth: '1100px', 
  margin: '60px auto 0', 
  paddingTop: '30px', 
  borderTop: '1px solid rgba(255,255,255,0.1)', 
  textAlign: 'center', 
  color: '#a7f3d0', 
  fontSize: '0.85rem', 
  opacity: 0.5 
};
export default AboutPage;