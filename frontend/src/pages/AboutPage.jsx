import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Eye, ShieldCheck, Zap, Activity, Mail, Phone, MapPin, Globe, Users, Award } from 'lucide-react';
import theme from '../theme/theme';

const AboutPage = ({ onBack }) => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div style={pageWrapper}>
      {/* 1. ANIMATED BACKGROUND GRID */}
      <motion.div 
        animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={gridLayer} 
      />
      <div style={spotlight} />

      {/* 2. NAVBAR */}
      <nav style={navbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={logoStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></span>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} style={backBtn}>
          <ArrowLeft size={18} /> Back to Home
        </motion.button>
      </nav>

      {/* 3. HERO SECTION */}
      <section style={heroSection}>
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.h1 variants={itemVariants} style={mainTitle}>
            Engineering the <span style={gradientText}>Future of Care.</span>
          </motion.h1>
          <motion.p variants={itemVariants} style={mainSubtitle}>
            NexHealth isn't just a management tool; it's a digital ecosystem designed 
            to eliminate administrative friction and put the focus back on the patient.
          </motion.p>
        </motion.div>
      </section>

      {/* 4. STATS COUNTER (NEW) */}
      <section style={statsSection}>
        <div style={statsGrid}>
          <StatBox icon={<Users />} count="500+" label="Clinics Empowered" />
          <StatBox icon={<Activity />} count="1M+" label="Records Digitized" />
          <StatBox icon={<Globe />} count="24/7" label="Cloud Availability" />
          <StatBox icon={<Award />} count="99.9%" label="Uptime Record" />
        </div>
      </section>

      {/* 5. MISSION & VISION (STAGGERED) */}
      <section style={contentSection}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          style={visionGrid}
        >
          <motion.div variants={itemVariants} style={visionCard}>
            <div style={iconBox}><Target size={30} /></div>
            <h3 style={cardTitle}>The Mission</h3>
            <p style={cardText}>To bridge the gap between complex hospital administration and seamless clinical delivery through high-performance software.</p>
          </motion.div>

          <motion.div variants={itemVariants} style={visionCard}>
            <div style={iconBox}><Eye size={30} /></div>
            <h3 style={cardTitle}>The Vision</h3>
            <p style={cardText}>A world where healthcare data moves as fast as the doctors who use it, ensuring zero delays in critical patient care.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 6. GREEN THEME FOOTER */}
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
              <span style={footerLink}>Features</span>
              <span style={footerLink}>About Us</span>
              <span style={footerLink}>Solutions</span>
            </div>
            <div style={footerLinkCol}>
              <h4 style={footerColTitle}>Get in Touch</h4>
              <div style={contactItem}><Mail size={16} /> hello@nexhealth.com</div>
              <div style={contactItem}><Phone size={16} /> +91 (20) 2740-0000</div>
              <div style={contactItem}><MapPin size={16} /> Health-Tech Park, Pune</div>
            </div>
          </div>
        </div>
        <div style={footerBottomLine}>
          <p>© 2026 NexHealth Systems • Version 1.0.4</p>
        </div>
      </footer>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatBox = ({ icon, count, label }) => (
  <motion.div whileHover={{ y: -10 }} style={statBoxStyle}>
    <div style={{ color: theme.colors.primary, marginBottom: '10px' }}>{icon}</div>
    <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '5px 0' }}>{count}</h2>
    <p style={{ color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>{label}</p>
  </motion.div>
);

// --- STYLES ---
const pageWrapper = { background: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a', position: 'relative', overflowX: 'hidden' };
const gridLayer = { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '60px 60px', opacity: 0.6 };
const spotlight = { position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 0%, white 80%)', pointerEvents: 'none', zIndex: 1 };

const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px', height: '80px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid #f1f5f9' };
const logoStyle = { fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.02em' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.3s' };

const heroSection = { padding: '200px 20px 100px', textAlign: 'center', position: 'relative', zIndex: 2 };
const aboutBadge = { display: 'inline-block', padding: '8px 20px', borderRadius: '30px', background: '#f0fdf4', color: theme.colors.primary, fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' };
const mainTitle = { fontSize: '4.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.05em' };
const gradientText = { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const mainSubtitle = { fontSize: '1.3rem', color: '#475569', maxWidth: '800px', margin: '30px auto 0', lineHeight: '1.6' };

const statsSection = { padding: '50px 80px', position: 'relative', zIndex: 2 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto' };
const statBoxStyle = { background: '#fff', padding: '30px', borderRadius: '24px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };

const contentSection = { padding: '100px 80px', position: 'relative', zIndex: 2 };
const visionGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1100px', margin: '0 auto' };
const visionCard = { padding: '50px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.04)' };
const cardTitle = { fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' };
const cardText = { color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' };
const iconBox = { width: '70px', height: '70px', borderRadius: '20px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' };

const footerContainer = { background: 'linear-gradient(180deg, #064e3b 0%, #064e3b 100%)', color: '#ecfdf5', padding: '100px 80px 40px', position: 'relative', zIndex: 2 };
const footerMainContent = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '60px' };
const footerBrandCol = { maxWidth: '400px' };
const footerLogoWrapper = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' };
const footerLogoText = { fontSize: '1.8rem', fontWeight: '900', color: '#fff' };
const footerBrandDesc = { color: '#a7f3d0', fontSize: '1rem', lineHeight: '1.7', opacity: 0.8 };
const footerLinksWrapper = { display: 'flex', gap: '100px' };
const footerLinkCol = { display: 'flex', flexDirection: 'column', gap: '18px' };
const footerColTitle = { fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px', color: '#fff' };
const footerLink = { color: '#a7f3d0', fontSize: '1rem', cursor: 'pointer', opacity: 0.7, transition: '0.3s' };
const contactItem = { display: 'flex', alignItems: 'center', gap: '12px', color: '#a7f3d0', fontSize: '1rem', opacity: 0.7 };
const footerBottomLine = { maxWidth: '1200px', margin: '80px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#a7f3d0', fontSize: '0.9rem', opacity: 0.5 };

export default AboutPage;