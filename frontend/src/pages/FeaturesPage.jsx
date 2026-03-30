import React from 'react';
import { motion } from 'framer-motion';
import theme from '../theme/theme';
import logo from '../assets/logo.png';
import { 
  ShieldCheck, Stethoscope, Wallet, Boxes, 
  FlaskConical, ReceiptIndianRupee, Video, Users,
  ArrowLeft, CheckCircle2, Activity, BrainCircuit
} from 'lucide-react';



const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const FeatureSection = ({ title, icon, desc, points, imageSide = 'right', badge }) => {
  const isRight = imageSide === 'right';

  return (
    <div style={sectionWrapper}>
      <div style={{ ...contentGrid, flexDirection: isRight ? 'row' : 'row-reverse' }}>
        
        {/* Text Content */}
        <motion.div 
          variants={isRight ? fadeInLeft : fadeInRight} 
          initial="initial" 
          whileInView="whileInView" 
          viewport={{ once: true }} 
          style={textCol}
        >
          <div style={iconBox}>{icon}</div>
          <div style={featureBadge}>{badge}</div>
          <h2 style={featureTitle}>{title}</h2>
          <p style={featureDesc}>{desc}</p>
          <ul style={pointsList}>
            {points.map((p, i) => (
              <li key={i} style={pointItem}>
                <CheckCircle2 size={18} color={theme.colors.primary} style={{ flexShrink: 0 }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mockup Display */}
        <motion.div 
          variants={isRight ? fadeInRight : fadeInLeft} 
          initial="initial" 
          whileInView="whileInView" 
          viewport={{ once: true }} 
          style={imageCol}
        >
          <div style={mockupContainer}>
            <div style={browserBar}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ ...dot, background: '#ff5f56' }} />
                <div style={{ ...dot, background: '#ffbd2e' }} />
                <div style={{ ...dot, background: '#27c93f' }} />
              </div>
            </div>
            <div style={mockupContent}>
               <div style={skeletonHeader} />
               <div style={skeletonBody} />
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                 style={floatingCard}
               >
                  <Activity size={20} color={theme.colors.primary} />
                  <div style={{ height: '8px', width: '60px', background: '#e2e8f0', borderRadius: '4px' }} />
               </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FeaturesPage = ({ onBack }) => {
  return (
    <div style={pageWrapper}>
      <div style={gridLayer} />

      {/* Navigation */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} style={navbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={logoStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></span>
        </div>
        <motion.button whileHover={{ x: -5 }} onClick={onBack} style={backBtn}>
          <ArrowLeft size={18} /> Back to Home
        </motion.button>
      </motion.nav>

      {/* Hero */}
      <header style={heroSection}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={mainTitle}>Comprehensive Care <br /><span style={gradientText}>Without Complexity.</span></h1>
          <p style={mainSubtitle}>The complete toolkit for Indian healthcare practitioners—from ABDM compliance to AI clinical notes and GST billing.</p>
        </motion.div>
      </header>

      {/* --- Feature Sections (All 8 Features Integrated) --- */}
      <FeatureSection 
        badge="Compliance"
        title="ABDM Compliance"
        icon={<ShieldCheck size={28} />}
        desc="Instant ABHA creation and seamless health record linking (ABD-M compliant)."
        points={["Digital Health ID creation", "Secure PHR linking", "Sandbox v2.0 certified", "Consent-based sharing"]}
        imageSide="right"
      />

      <FeatureSection 
        badge="Automation"
        title="Doctor's Scribe"
        icon={<Stethoscope size={28} />}
        desc="AI-powered clinical notes and prescription management."
        points={["Voice-to-text transcription", "Instant Digital prescriptions", "Clinical history tracking", "WhatsApp PDF delivery"]}
        imageSide="left"
      />

      <FeatureSection 
        badge="Finance"
        title="Patient Wallet"
        icon={<Wallet size={28} />}
        desc="Seamless digital payments and credit management."
        points={["Integrated UPI payments", "Pre-paid patient balances", "Transaction history", "Refund management"]}
        imageSide="right"
      />

      <FeatureSection 
        badge="Logistics"
        title="Staff Inventory"
        icon={<Boxes size={28} />}
        desc="Real-time tracking of hospital supplies and medical stock."
        points={["Low-stock alerts", "Batch & Expiry tracking", "Supplier management", "Automated reordering"]}
        imageSide="left"
      />

      <FeatureSection 
        badge="Diagnostics"
        title="Lab & Diagnostics"
        icon={<FlaskConical size={28} />}
        desc="Integrated lab module for automated test results."
        points={["Direct report uploads", "Patient notification alerts", "Sample tracking", "Diagnostic history"]}
        imageSide="right"
      />

      <FeatureSection 
        badge="Accounting"
        title="GST Billing"
        icon={<ReceiptIndianRupee size={28} />}
        desc="Simplified tax-compliant invoicing for all services."
        points={["Automated GST calculation", "Custom branded invoices", "Expense tracking", "Tally/ERP integration"]}
        imageSide="left"
      />

      <FeatureSection 
        badge="Remote Care"
        title="Telehealth Hub"
        icon={<Video size={28} />}
        desc="Connect with patients via secure video calls."
        points={["HD Video consultations", "In-call note taking", "Scheduled appointments", "Encrypted data stream"]}
        imageSide="right"
      />

      <FeatureSection 
        badge="Efficiency"
        title="OPD Queue"
        icon={<Users size={28} />}
        desc="Live tracking of patient wait times and availability."
        points={["Live queue dashboard", "SMS arrival alerts", "Doctor availability status", "Wait-time optimization"]}
        imageSide="left"
      />

      {/* CTA Section */}
      <section style={ctaSection}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>Ready to digitize?</h2>
        <motion.button whileHover={{ scale: 1.05 }} style={primaryBtn}>
          Start 14-Day Free Trial
        </motion.button>
      </section>
    </div>
  );
};

// --- STYLES ---
const pageWrapper = { background: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a', overflowX: 'hidden' };
const gridLayer = { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, black, transparent)' };
const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px', height: '80px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid #f1f5f9' };
const logoStyle = { fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.03em' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' };
const heroSection = { padding: '180px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 };
const mainTitle = { fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.04em' };
const gradientText = { background: 'linear-gradient(90deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const mainSubtitle = { fontSize: '1.25rem', color: '#475569', maxWidth: '700px', margin: '24px auto 0', lineHeight: '1.6' };
const sectionWrapper = { padding: '80px 80px', position: 'relative', zIndex: 1 };
const contentGrid = { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '100px' };
const textCol = { flex: 1 };
const iconBox = { width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '24px' };
const featureBadge = { fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#10b981', letterSpacing: '1px', marginBottom: '12px' };
const featureTitle = { fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.02em' };
const featureDesc = { fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', marginBottom: '32px' };
const pointsList = { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' };
const pointItem = { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', color: '#334155', fontSize: '1rem' };
const imageCol = { flex: 1.2 };
const mockupContainer = { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', overflow: 'hidden' };
const browserBar = { height: '40px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 16px' };
const dot = { width: '8px', height: '8px', borderRadius: '50%' };
const mockupContent = { height: '320px', padding: '32px', position: 'relative' };
const skeletonHeader = { height: '20px', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '20px' };
const skeletonBody = { height: '140px', width: '100%', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };
const floatingCard = { position: 'absolute', bottom: '40px', right: '40px', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9' };
const ctaSection = { padding: '120px 20px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #f1f5f9' };
const primaryBtn = { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '18px 44px', borderRadius: '14px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' };

export default FeaturesPage;