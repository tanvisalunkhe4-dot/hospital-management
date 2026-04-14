import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme/theme';
import logo from '../assets/logo.png';
import { 
  Stethoscope, 
  Wallet, 
  Boxes, 
  FlaskConical, 
  ReceiptIndianRupee, 
  Video, 
  Users,
  ChevronDown, UserPlus, ShieldCheck, Link as LinkIcon, 
  DownloadCloud, UploadCloud, FileCheck, CreditCard
} from 'lucide-react';

const LandingPage = ({ onNavigate, onGetStarted, onLoginClick }) => { 
  const features = [
    { 
      name: "ABDM Compliance", 
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V12C3 17.5 7 21 12 23C17 21 21 17.5 21 12V7L12 2Z" fill="#005A9C"/>
          <path d="M12 6V18M8 10H16M8 14H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      desc: "Instant ABHA creation and seamless health record linking (ABD-M compliant)." 
    },
    { name: "Doctor's Scribe", icon: <Stethoscope size={32} color="#10b981" />, desc: "AI-powered clinical notes and prescription management." },
    { name: "Patient Wallet", icon: <Wallet size={32} color="#10b981" />, desc: "Seamless digital payments and credit management." },
    { name: "Staff Inventory", icon: <Boxes size={32} color="#10b981" />, desc: "Real-time tracking of hospital supplies and medical stock." },
    { name: "Lab & Diagnostics", icon: <FlaskConical size={32} color="#10b981" />, desc: "Integrated lab module for automated test results." },
    { name: "GST Billing", icon: <ReceiptIndianRupee size={32} color="#10b981" />, desc: "Simplified tax-compliant invoicing for all services." },
    { name: "Telehealth Hub", icon: <Video size={32} color="#10b981" />, desc: "Connect with patients via secure video calls." },
    { name: "OPD Queue", icon: <Users size={32} color="#10b981" />, desc: "Live tracking of patient wait times and availability." },
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
          <span style={logoStyle}>Nex<span style={{ color: theme.colors.primary }}>Health</span></span>
        </div>

        <div style={linkContainer}>
          <span style={navLink} onClick={() => onNavigate('about')}>About</span>
          
          

          <span style={navLink} onClick={() => onNavigate('features')}>Features</span>
          <span style={navLink} onClick={() => onNavigate('solutions')}>Solutions</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onLoginClick} style={loginBtnStyle}>Login</button>
          <button onClick={onGetStarted} style={getStartedBtnStyle}>Get Started</button>
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
            <span style={heroGradientText}>Indian Healthcare.</span>
          </h1>
          <p style={heroSub}>
            A unified, ABDM-compliant ecosystem designed for doctors and clinics. 
            Automate your practice, link health records, and focus on patients.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            <motion.button whileHover={{ y: -4 }} style={primaryBtn}>Start Free Trial</motion.button>
            <motion.button whileHover={{ background: '#f1f5f9' }} style={secondaryBtn}>View Live Demo</motion.button>
          </div>

          {/* Centered Dashboard Mockup */}
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={mockupOuter}>
            <div style={mockupInner}>
              <div style={mockSidebar}>
                {[1,2,3,4,5].map(i => <div key={i} style={{ ...mockLine, width: i === 1 ? '100%' : '70%', background: i === 1 ? '#10b98133' : '#e2e8f0' }} />)}
              </div>
              <div style={{ flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                  <div style={mockMetricCard} />
                  <div style={mockMetricCardLight} />
                </div>
                <div style={mockChartArea} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Feature Cards Flow - Infinite Marquee */}
      {/* In your LandingPage.jsx */}
<section style={{ padding: '100px 0' }}>
  <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2.8rem', fontWeight: '900' }}>
     Powerful Solutions for Every Department
  </h2>
  <div style={marqueeWrapper}>
    <motion.div 
      animate={{ x: ["0%", "-50%"] }} 
      transition={{ repeat: Infinity, duration: 45, ease: "linear" }} 
      style={{ display: 'flex', gap: '30px', width: 'max-content' }}
    >
      {doubledFeatures.map((f, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -15, borderColor: '#10b981' }} 
          // Redirect Trigger
          onClick={() => onNavigate('features')} 
          style={{ ...featureCardStyle, cursor: 'pointer' }}
        >
          <div style={featureIconWrapper}>{f.icon}</div>
          <h4 style={featureTitle}>{f.name}</h4>
          <p style={featureDesc}>{f.desc}</p>
          <span style={featureLink}>Learn More ›</span>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>
    

{/* --- 4. The "Unified Practice" Section (High-Fidelity Feature) --- */}
<section style={{ padding: '120px 80px', background: theme.colors.cardWhite }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '100px', alignItems: 'center' }}>
      
      {/* Left: Persuasive Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div style={{ color: theme.colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px' }}>
          Clinical Intelligence
        </div>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: theme.colors.text, lineHeight: 1.05, marginBottom: '30px', letterSpacing: '-1.5px' }}>
          Every feature your <br /> practice needs to <br /> <span style={{ color: theme.colors.primary }}>work faster.</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: theme.colors.subtitle, lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px' }}>
          NexHealth is a true all-in-one experience designed for Indian practitioners. Automate clinical notes with AI, simplify ABHA linking, and access everything in one optimized dashboard.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          {['1-Minute AI Scribe', 'ABD-M Integrated', 'GST Ready Billing', 'WhatsApp Reports'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: theme.colors.text }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.colors.primary }} />
              {item}
            </div>
          ))}
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ background: theme.colors.buttonGradient, color: '#fff', padding: '18px 40px', borderRadius: theme.borderRadius.lg, border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: theme.boxShadow.card }}
        >
          Start Your Free Trial
        </motion.button>
      </motion.div>

      {/* Right: The "Visual Proof" (Carepatron Mockup Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        style={{ position: 'relative' }}
      >
        {/* Main Interface Mockup */}
        <div style={{ 
          background: theme.colors.background, 
          borderRadius: '40px', 
          padding: '30px', 
          border: `1px solid ${theme.colors.divider}`,
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.12)'
        }}>
          <div style={{ background: '#fff', borderRadius: '24px', height: '450px', width: '100%', overflow: 'hidden', border: `1px solid ${theme.colors.divider}`, position: 'relative' }}>
             {/* Fake Sidebar */}
             <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60px', borderRight: `1px solid ${theme.colors.divider}`, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 10px' }}>
                {[1,2,3,4].map(i => <div key={i} style={{ width: '100%', height: '30px', background: i === 1 ? theme.colors.primaryLight : '#e2e8f0', borderRadius: '8px' }} />)}
             </div>
             {/* Content Area */}
             <div style={{ marginLeft: '80px', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                   <div style={{ height: '30px', width: '200px', background: '#f1f5f9', borderRadius: '6px' }} />
                   <div style={{ height: '30px', width: '100px', background: theme.colors.primaryLight, borderRadius: '6px' }} />
                </div>
                <div style={{ height: '200px', width: '100%', background: '#f8fafc', borderRadius: '16px', border: `1px dashed ${theme.colors.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ color: theme.colors.subtitle, fontWeight: '600' }}>Clinical Note Preview</span>
                </div>
             </div>
          </div>
          
          {/* Overlapping Floating Context Card */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              position: 'absolute', top: '15%', left: '-40px', 
              background: '#fff', padding: '20px', borderRadius: '24px', 
              boxShadow: theme.boxShadow.dropdown, border: `1px solid ${theme.colors.divider}`,
              display: 'flex', alignItems: 'center', gap: '15px', width: '260px'
            }}
          >
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ color: '#fff', fontWeight: 'bold' }}>AI</span>
            </div>
            <div>
               <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>AI Scribe Active</div>
               <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: '700' }}>Transcribing...</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
</section>
{/* --- 5. Implementation Roadmap --- */}
<section style={{ padding: '100px 80px', background: theme.colors.backgroundGradient }}>
  <div style={{ textAlign: 'center', marginBottom: '80px' }}>
    <h2 style={{ fontSize: theme.typography.fontSize.h1, fontWeight: theme.typography.weight.bold }}>Go Live in <span style={{ color: theme.colors.primary }}>3 Simple Steps</span></h2>
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
    {/* Connector Line */}
    <div style={{ position: 'absolute', top: '40px', left: '15%', right: '15%', height: '2px', background: `dashed ${theme.colors.border}`, zIndex: 0, borderTop: `2px dashed ${theme.colors.primary}44` }} />

    {[
      { step: "01", title: "Hospital Onboarding", desc: "Upload staff details and register your hospital under ABDM in minutes." },
      { step: "02", title: "Smart Configuration", desc: "Set up your clinical templates, inventory alerts, and GST billing codes." },
      { step: "03", title: "Digital Transformation", desc: "Start generating ABHA IDs and sending WhatsApp reports instantly." }
    ].map((item, i) => (
      <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', background: theme.colors.buttonGradient, 
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '1.5rem', fontWeight: '900', margin: '0 auto 25px', boxShadow: theme.boxShadow.dropdown 
        }}>
          {item.step}
        </div>
        <h3 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: 'bold', marginBottom: '10px' }}>{item.title}</h3>
        <p style={{ color: theme.colors.subtitle, lineHeight: 1.6 }}>{item.desc}</p>
      </div>
    ))}
  </div>
</section>
      {/* 4. Contact Us */}
      <section style={{ padding: '100px 80px', textAlign: 'center', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <h2 style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: '900' }}>Ready to modernize your hospital?</h2>
          <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px' }}>Join 500+ Indian hospitals using NexHealth.</p>
          <motion.button whileHover={{ scale: 1.05 }}
            style={{ padding: '18px 50px', background: '#0f172a', color: '#fff', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            Contact Sales
          </motion.button>
      </section>
      

{/* --- 100% FULL-WIDTH GREEN FOOTER --- */}
{/* --- PROFESSIONAL NEXHEALTH FOOTER --- */}
<footer style={{ 
  width: '100%',
  backgroundColor: '#021205', // Slightly darker, richer black-green
  backgroundImage: 'radial-gradient(circle at 50% -20%, #064e3b 0%, transparent 80%)', // Subtle green glow from top
  color: '#ffffff', 
  padding: '100px 0 60px 0',
  fontFamily: "'Inter', sans-serif",
  borderTop: `1px solid rgba(16, 185, 129, 0.2)`, // Thinner, more elegant border
  position: 'relative',
  zIndex: 2,
}}>
  <div style={{ 
    width: '100%', 
    maxWidth: '1280px', 
    margin: '0 auto', 
    padding: '0 40px',
    boxSizing: 'border-box'
  }}>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', // Give the branding column more space
      gap: '60px',
      marginBottom: '80px'
    }}>
      
      {/* Brand & Mission Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="logo" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
            Nex<span style={{ color: theme.colors.primary }}>Health</span>
          </span>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '280px' }}>
          Building the digital infrastructure for modern Indian clinics. Fully ABDM compliant and doctor-first.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['LinkedIn', 'Twitter', 'GitHub'].map(s => (
            <motion.div 
              whileHover={{ y: -3, color: theme.colors.primary }}
              key={s} 
              style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}
            >
              {s}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Column: Features */}
      <div>
        <h4 style={footerHeadingStyle}>Platform</h4>
        <ul style={footerListStyle}>
          {['ABDM Sync', 'AI Scribe', 'Inventory', 'Billing', 'Telehealth'].map(item => (
            <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
          ))}
        </ul>
      </div>

      {/* Column: Resources */}
      <div>
        <h4 style={footerHeadingStyle}>Resources</h4>
        <ul style={footerListStyle}>
          {['API Docs', 'Help Center', 'ABDM Sandbox', 'Security'].map(item => (
            <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
          ))}
        </ul>
      </div>

      {/* Column: Company */}
      <div>
        <h4 style={footerHeadingStyle}>Company</h4>
        <ul style={footerListStyle}>
          {['About Us', 'Careers', 'Privacy', 'Terms'].map(item => (
            <motion.li whileHover={{ x: 5 }} key={item} style={footerLinkStyle}>{item}</motion.li>
          ))}
        </ul>
      </div>

      {/* Column: Status */}
      <div style={{ textAlign: 'right' }}>
        <h4 style={footerHeadingStyle}>System Status</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          All Systems Operational
        </div>
        <div style={{ marginTop: '20px', opacity: 0.5, fontSize: '0.75rem' }}>
          v2.4.0 (Stable)<br />
          Asia-South1 Region
        </div>
      </div>
    </div>

    {/* Bottom Trust & Compliance Bar */}
    <div style={{ 
      borderTop: '1px solid rgba(255,255,255,0.05)', 
      paddingTop: '40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', gap: '30px', opacity: 0.4, filter: 'grayscale(1)' }}>
        {/* Placeholder for small certification logos */}
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #fff', padding: '2px 6px', borderRadius: '4px' }}>ABDM CERTIFIED</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #fff', padding: '2px 6px', borderRadius: '4px' }}>ISO 27001</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #fff', padding: '2px 6px', borderRadius: '4px' }}>HIPAA</span>
      </div>
      
      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
        © 2026 NexHealth. Built with  in India for the world.
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};
const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px', height: '80px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid rgba(16, 185, 129, 0.1)' };
const logoStyle = { fontWeight: '800', fontSize: '1.6rem', letterSpacing: '-0.03em', color: '#0f172a' };
const linkContainer = { display: 'flex', gap: '32px' };
const navLink = { fontSize: '15px', fontWeight: '500', color: '#475569', cursor: 'pointer' };
const navLinkActive = { ...navLink, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' };

const heroContainerStyle = { padding: '160px 0 100px', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const bgBlurLayer = { position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000')", backgroundSize: 'cover', filter: 'blur(120px)', opacity: 0.1, zIndex: 0 };
const gridLayer = { position: 'absolute', inset: 0, zIndex: 1, backgroundSize: '80px 80px', backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.06) 1px, transparent 1px)', maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)' };

const heroH1 = { fontSize: '4.8rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.05', letterSpacing: '-0.05em', marginBottom: '28px' };
const heroGradientText = { background: 'linear-gradient(90deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroSub = { fontSize: '1.3rem', color: '#475569', margin: '0 auto 48px auto', maxWidth: '700px', lineHeight: '1.6' };

const primaryBtn = { background: '#10b981', color: '#fff', padding: '20px 44px', borderRadius: '14px', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' };
const secondaryBtn = { background: '#fff', color: '#0f172a', padding: '20px 44px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' };
const loginBtnStyle = { background: 'transparent', border: '1px solid #e2e8f0', padding: '10px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const getStartedBtnStyle = { background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };

const mockupOuter = { width: '1000px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '12px', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' };
const mockupInner = { background: '#fff', borderRadius: '24px', height: '450px', display: 'flex', overflow: 'hidden' };
const mockSidebar = { width: '200px', background: '#f8fafc', borderRight: '1px solid #f1f5f9', padding: '30px 20px' };
const mockLine = { height: '10px', borderRadius: '4px', marginBottom: '20px' };
const mockMetricCard = { flex: 1, height: '80px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #d1fae5' };
const mockMetricCardLight = { flex: 1, height: '80px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' };
const mockChartArea = { height: '200px', width: '100%', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' };

const marqueeWrapper = { overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' };
const featureCardStyle = { flex: '0 0 320px', backgroundColor: '#f0fdf4', padding: '40px 30px', borderRadius: '32px', border: '2px solid #d1fae5', borderTop: '6px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '15px', cursor: 'pointer', transition: '0.4s' };
const featureIconWrapper = { fontSize: '2.2rem', background: '#fff', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 8px 15px rgba(16, 185, 129, 0.1)' };
const featureTitle = { margin: 0, fontSize: '1.35rem', color: '#064e3b', fontWeight: '900' };
const featureDesc = { fontSize: '0.95rem', color: '#374151', lineHeight: '1.6', margin: 0 };
const featureLink = { color: '#10b981', fontWeight: '800', fontSize: '0.9rem', marginTop: 'auto' };

const footerHeadingStyle = { 
  color: '#f8fafc', 
  fontSize: '0.85rem', 
  marginBottom: '24px', 
  fontWeight: '700', 
  textTransform: 'uppercase', 
  letterSpacing: '1px' 
};

const footerListStyle = { 
  listStyle: 'none', 
  padding: 0, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '14px' 
};

const footerLinkStyle = { 
  cursor: 'pointer', 
  color: '#94a3b8', 
  fontSize: '0.9rem', 
  transition: 'color 0.2s ease',
  display: 'inline-block'
};
export default LandingPage;