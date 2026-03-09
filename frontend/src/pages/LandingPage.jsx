import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme/theme';
import logo from '../assets/logo.png';
import AddHospitalModal from './AddHospitalModal';
import { 
  Stethoscope, 
  Wallet, 
  Boxes, 
  FlaskConical, 
  ReceiptIndianRupee, 
  Video, 
  Users 
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {  const features = [
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
    { 
      name: "Doctor's Scribe", 
      icon: <Stethoscope size={32} color="#10b981" />, 
      desc: "AI-powered clinical notes and prescription management." 
    },
    { 
      name: "Patient Wallet", 
      icon: <Wallet size={32} color="#10b981" />, 
      desc: "Seamless digital payments and credit management." 
    },
    { 
      name: "Staff Inventory", 
      icon: <Boxes size={32} color="#10b981" />, 
      desc: "Real-time tracking of hospital supplies and medical stock." 
    },
    { 
      name: "WhatsApp Delivery", 
      // Using an actual WhatsApp SVG for authenticity
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ), 
      desc: "Reports and appointments sent directly to phones." 
    },
    { 
      name: "Lab & Diagnostics", 
      icon: <FlaskConical size={32} color="#10b981" />, 
      desc: "Integrated lab module for automated test results." 
    },
    { 
      name: "GST Billing", 
      icon: <ReceiptIndianRupee size={32} color="#10b981" />, 
      desc: "Simplified tax-compliant invoicing for all services." 
    },
    { 
      name: "Telehealth Hub", 
      icon: <Video size={32} color="#10b981" />, 
      desc: "Connect with patients via secure video calls." 
    },
    { 
      name: "OPD Queue", 
      icon: <Users size={32} color="#10b981" />, 
      desc: "Live tracking of patient wait times and availability." 
    },
  ];

  // Doubling the features to create a seamless infinite loop
  const doubledFeatures = [...features, ...features];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: theme.typography.fontFamily, 
      overflowX: 'hidden' 
    }}>
      
      {/* 1. Enhanced Navigation Bar */}
{/* 1. Enhanced Navigation Bar */}
<motion.nav 
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 80px',
    height: '90px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky', 
    top: 0, 
    zIndex: 1000, 
    borderBottom: `1px solid ${theme.colors.divider}`,
    boxShadow: '0 2px 15px rgba(0, 0, 0, 0.03)' 
  }}
>
  {/* Left: Branding */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <img src={logo} alt="logo" style={{ height: '50px' }} />
    <span style={{ fontWeight: '800', fontSize: '1.7rem' }}>
      Nex<span style={{ color: theme.colors.primary }}>Health</span>
    </span>
  </div>

  {/* Right: Actions */}
  <div style={{ display: 'flex', gap: '12px' }}>
    <motion.button 
      whileHover={{ scale: 1.05 }}
      style={{ 
        background: 'transparent', 
        border: `2px solid ${theme.colors.primary}`, 
        color: theme.colors.primary,
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: '700',
        cursor: 'pointer'
      }}
    >
      Login
    </motion.button>
    
    <motion.button 
      whileHover={{ scale: 1.05 }}
      onClick={onGetStarted} 
      style={{ 
        background: theme.colors.buttonGradient, 
        color: '#fff', 
        padding: '10px 24px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '800', 
        cursor: 'pointer'
      }}
    >
      Get Started
    </motion.button>
  </div>
</motion.nav>



{/* 2. Hero Section - Updated with Glow & Connected Background */}
<section style={{ 
  display: 'grid', 
  gridTemplateColumns: '1.2fr 1fr', 
  padding: '100px 80px', 
  alignItems: 'center',
  background: 'linear-gradient(to bottom, #ffffff, #f0fdf4)',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Left Content */}
  <motion.div initial="initial" animate="animate" variants={fadeInUp}>
    <div style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '8px', 
      background: '#d1fae5', color: '#065f46', padding: '8px 16px', 
      borderRadius: '20px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '25px'
    }}>
      <span style={{ display: 'block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
      ABDM Compliant & ABHA Integrated
    </div>

    <h1 style={{ fontSize: '4.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.05' }}>
      Transforming Indian <br /> Healthcare with <br /> 
      <span style={{ color: theme.colors.primary }}>NexHealth.</span>
    </h1>
    <p style={{ fontSize: '1.25rem', color: '#475569', margin: '25px 0', maxWidth: '530px', lineHeight: '1.6' }}>
      A simple, integrated platform for Doctors, Patients, and Admin, designed for maximum efficiency and seamless ABHA linking.
    </p>
    
    <div style={{ display: 'flex', gap: '20px' }}>
      <motion.button 
        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(5, 150, 105, 0.3)' }}
        style={{ background: theme.colors.buttonGradient, color: '#fff', padding: '18px 45px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
        Get Started Free
      </motion.button>
      <motion.button 
        whileHover={{ background: '#f1f5f9' }}
        style={{ background: 'transparent', color: '#0f172a', padding: '18px 45px', borderRadius: '15px', border: '2px solid #e2e8f0', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
        Watch Demo
      </motion.button>
    </div>
  </motion.div>
  
  {/* Right Content: Connected Floating Mockups */}
  <div style={{ position: 'relative', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    
    {/* 1. Subtle Background Glow */}
    <div style={{
      position: 'absolute',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
      zIndex: 0
    }} />

    {/* 2. Rotating Decorative Ring (Bridges the gap without being heavy) */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{ 
        position: 'absolute', 
        width: '420px', 
        height: '420px', 
        border: '2px dashed rgba(16, 185, 129, 0.15)', 
        borderRadius: '50%', 
        zIndex: 0 
      }}
    />

    {/* 3. Floating Component 1: Live OPD Wait Time Ticker */}
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1, y: [0, -15, 0] }}
      transition={{ 
        x: { delay: 0.6, duration: 0.8 },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }}
      style={{ 
        position: 'absolute', top: '15%', right: '10px', background: '#10b981', 
        color: '#fff', padding: '20px 25px', borderRadius: '28px', 
        boxShadow: '0 25px 50px rgba(16, 185, 129, 0.3)', zIndex: 3, width: '200px'
      }}
    >
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', opacity: 0.9 }}>Live OPD Wait Time</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
        <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>12</h3>
        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>mins</span>
      </div>
      <div style={{ height: '5px', width: '100%', background: 'rgba(255,255,255,0.3)', marginTop: '12px', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{ height: '100%', width: '60%', background: '#fff' }}
        />
      </div>
    </motion.div>
    {/* --- 3.5 Interactive Dashboard Preview (Carepatron Style) --- */}
<section style={{ padding: '100px 80px', background: theme.colors.cardWhite }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', marginBottom: '60px' }}>
    <h2 style={{ fontSize: theme.typography.fontSize.h1, fontWeight: theme.typography.weight.bold, color: theme.colors.text }}>
      One Unified Dashboard. <span style={{ color: theme.colors.primary }}>Total Control.</span>
    </h2>
    
  </div>

  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    style={{ 
      background: theme.colors.glassGradient,
      backdropFilter: 'blur(10px)',
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.boxShadow.dropdown,
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Browser Header */}
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '10px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.colors.error }} />
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.colors.warning }} />
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.colors.success }} />
    </div>

    {/* Mockup Content */}
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px', height: '500px' }}>
      {/* Sidebar Mockup */}
      <div style={{ background: theme.colors.background, borderRadius: theme.borderRadius.lg, padding: '20px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: '35px', width: '100%', background: '#fff', marginBottom: '15px', borderRadius: '6px', border: `1px solid ${theme.colors.divider}` }} />
        ))}
      </div>
      {/* Main Content Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: theme.borderRadius.lg, padding: '20px', boxShadow: theme.boxShadow.sm }}>
          <h4 style={{ color: theme.colors.primary, marginBottom: '15px' }}>Patient Queue</h4>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '50px', width: '100%', background: theme.colors.background, marginBottom: '10px', borderRadius: '8px' }} />
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: theme.borderRadius.lg, padding: '20px', boxShadow: theme.boxShadow.sm }}>
          <h4 style={{ color: theme.colors.accent, marginBottom: '15px' }}>Revenue Analytics</h4>
          <div style={{ height: '150px', width: '100%', background: `linear-gradient(to top, ${theme.colors.primaryLight}, transparent)`, borderRadius: '8px', borderBottom: `2px solid ${theme.colors.primary}` }} />
        </div>
      </div>
    </div>
  </motion.div>
</section>


    {/* 4. Floating Component 2: Digital Prescription Card */}
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1, y: [0, 15, 0] }}
      transition={{ 
        x: { delay: 0.8, duration: 0.8 },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
      }}
      style={{ 
        position: 'absolute', bottom: '10%', left: '-20px', width: '310px', 
        background: '#fff', borderRadius: '32px', padding: '25px', 
        boxShadow: '0 40px 80px -15px rgba(0,0,0,0.12)', zIndex: 2,
        border: '1px solid #f1f5f9'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ background: '#25D366', padding: '8px', borderRadius: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </div>
        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>Digital Rx Sent!</span>
      </div>
      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', marginBottom: '12px', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Patient: Rahul Sharma</p>
        <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>Amoxicillin 500mg</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: '#005A9C', padding: '5px 10px', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: '900' }}>ABHA</div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Linked to Health Record</span>
      </div>
    </motion.div>

  </div>
</section>
{/* --- 3. Unified Green Infinite Right-to-Left Marquee --- */}
<section style={{ padding: '80px 0 120px' }}>
  <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2.8rem', fontWeight: '900', color: '#0f172a' }}>
     Powerful Solutions for Every Department
  </h2>
  
  <div 
    style={{ 
      overflow: 'hidden', 
      width: '100%',
      // Creates the soft fade-in/out effect at the edges
      maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
    }}
  >
    <motion.div 
      // Pauses the entire line when any card is hovered
      whileHover={{ animationPlayState: "paused" }} 
      animate={{ x: ["0%", "-50%"] }} // Smooth Right-to-Left movement
      transition={{ 
        repeat: Infinity, 
        duration: 45, 
        ease: "linear" 
      }}
      style={{ 
        display: 'flex', 
        gap: '30px', 
        width: 'max-content', 
        padding: '30px 0' 
      }}
    >
      {doubledFeatures.map((f, i) => (
        <motion.div 
          key={i}
          whileHover={{ 
            y: -15, 
            backgroundColor: '#ffffff', // Card brightens to pure white
            borderColor: '#10b981',     // Border becomes prominent green
            boxShadow: '0 30px 60px -12px rgba(16, 185, 129, 0.2)', // Deep green glow
          }}
          style={{ 
            flex: '0 0 320px',
            backgroundColor: '#f0fdf4',   // Uniform Soft Mint background
            padding: '40px 30px', 
            borderRadius: '32px', 
            border: '2px solid #d1fae5',   // Subtle initial green border
            borderTop: '6px solid #10b981', // Thick consistent green accent
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            gap: '15px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Consistent Circular Icon */}
          <div style={{ 
            fontSize: '2.2rem', 
            background: '#ffffff', 
            width: '70px', height: '70px',
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 8px 15px rgba(16, 185, 129, 0.1)'
          }}>
            {f.icon}
          </div>
          
          <h4 style={{ margin: 0, fontSize: '1.35rem', color: '#064e3b', fontWeight: '900' }}>
            {f.name}
          </h4>
          
          <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
            {f.desc}
          </p>

          <motion.span 
            whileHover={{ x: 5 }} 
            style={{ 
              color: '#10b981', 
              fontWeight: '800', 
              fontSize: '0.9rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              marginTop: 'auto' 
            }}
          >
            Learn More <span style={{ fontSize: '1.2rem' }}>›</span>
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>
{/* --- 3. Animated Trust & Compliance Bar --- */}
<section style={{ 
  padding: `${theme.spacing.huge} 80px`, 
  background: theme.colors.cardWhite, 
  borderTop: `1px solid ${theme.colors.divider}`,
  borderBottom: `1px solid ${theme.colors.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '40px',
  overflow: 'hidden'
}}>
  {/* Left: Social Proof with Staggered Fade-In */}
  <motion.div 
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    style={{ flex: '0 0 520px' }}
  >
    <h2 style={{ 
      fontSize: '2.6rem', 
      fontWeight: theme.typography.weight.bold, 
      color: theme.colors.text, 
      lineHeight: 1.1,
      marginBottom: theme.spacing.lg,
      letterSpacing: '-1px'
    }}>
      #1 highest-rated by <br /> 
      <span style={{ color: theme.colors.primary }}>100,000 clinicians</span> <br /> 
      just like you
    </h2>
    
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
      {/* Ratings with hover pulse */}
      {['G2'].map((platform, idx) => (
        <motion.div 
          key={platform}
          whileHover={{ scale: 1.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <span style={{ 
            fontWeight: '900', 
            color: platform === 'G2' ? '#FF492C' : '#0051FF', 
            fontSize: platform === 'G2' ? '1.4rem' : '1.1rem' 
          }}>
            {platform}
          </span>
          <div style={{ color: '#7c3aed', fontSize: '1.2rem', letterSpacing: '2px' }}>
            {'★'.repeat(4)}<span style={{ opacity: 0.3 }}>★</span>
          </div>
          <span style={{ fontWeight: theme.typography.weight.bold, color: theme.colors.text, fontSize: '1.1rem' }}>4.5</span>
        </motion.div>
      ))}
    </div>
  </motion.div>

  {/* Right: Infinite Smooth Loop with Fade Edges */}
  <div style={{ 
    flex: 1, 
    position: 'relative',
    // The mask creates the soft "disappearing" effect on the sides
    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' 
  }}>
    <motion.div 
      animate={{ x: [0, -1500] }}
      transition={{ 
        duration: 50, // Higher number = slower, more professional crawl
        repeat: Infinity, 
        ease: "linear" 
      }}
      whileHover={{ animationPlayState: "paused" }} // Stops on hover so users can read badges
      style={{ display: 'flex', gap: '25px', alignItems: 'center', width: 'max-content' }}
    >
      {[
        { name: "ABDM", label: "Certified", color: theme.colors.primary },
        { name: "ABHA", label: "Integrated", color: theme.colors.accent },
        { name: "GDPR", label: "Compliant", color: theme.colors.secondary },
        { name: "HIPAA", label: "Compliant", color: "#4CAF50" },
        { name: "DISHA", label: "Compliant", color: "#6366f1" },
        { name: "ISO 27001", label: "Certified", color: theme.colors.subtitle },
        // Repeat to ensure no gaps in the loop
        { name: "ABDM", label: "Certified", color: theme.colors.primary },
        { name: "ABHA", label: "Integrated", color: theme.colors.accent },
        { name: "GDPR", label: "Compliant", color: theme.colors.secondary },
        { name: "HIPAA", label: "Compliant", color: "#4CAF50" },
      ].map((badge, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -5, borderColor: badge.color }}
          style={{ 
            minWidth: '200px', 
            height: '90px', 
            background: theme.colors.cardWhite, 
            borderRadius: theme.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: `0 ${theme.spacing.md}`,
            boxShadow: theme.boxShadow.sm,
            border: `1px solid ${theme.colors.border}`,
            borderLeft: `5px solid ${badge.color}`,
            transition: theme.transitions.fast
          }}
        >
          <div style={{ 
            width: '40px', height: '40px', borderRadius: theme.borderRadius.sm, 
            background: `${badge.color}15`, display: 'flex', 
            alignItems: 'center', justifyContent: 'center' 
          }}>
            <div style={{ width: '20px', height: '20px', border: `2px solid ${badge.color}`, borderRadius: '4px' }} />
          </div>
          <div>
            <div style={{ fontWeight: theme.typography.weight.bold, color: theme.colors.text, fontSize: theme.typography.fontSize.base }}>{badge.name}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.subtitle, textTransform: 'uppercase', fontWeight: '700' }}>{badge.label}</div>
          </div>
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
      

      {/* --- Full-Width Professional Footer --- */}
{/* --- 100% FULL-WIDTH GREEN FOOTER --- */}
<footer style={{ 
  /* This ensures the background color bleeds to the very edges of the screen */
  width: '100%',
  backgroundColor: '#04210a', // Deep Forest Green matching your theme
  color: '#ffffff', 
  padding: '100px 0 40px 0',
  fontFamily: theme.typography.fontFamily,
  borderTop: `4px solid ${theme.colors.primary}`, // Bold brand green top bar
  
  /* These lines are the safety net to kill the white side-bars */
  display: 'block',
  margin: '0',
  boxSizing: 'border-box'
}}>
  {/* Inner Content Wrapper - This centers your text while the footer background stays 100% */}
  <div style={{ 
    width: '100%', 
    maxWidth: '1400px', 
    margin: '0 auto', 
    padding: '0 80px',
    boxSizing: 'border-box'
  }}>
    
    {/* Navigation Grid */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '40px',
      marginBottom: '80px'
    }}>
      
      {/* Column: Features */}
      <div>
        <h4 style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Features</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
          {['Health Records', 'Practice Management', 'Telehealth', 'Clinical Notes', 'Patient Portal', 'Scheduling', 'Billing', 'Payments', 'Electronic Signing', 'Compliance'].map(item => (
            <li key={item} style={{ cursor: 'pointer', opacity: 0.8 }} onMouseOver={e => e.target.style.color = theme.colors.primary} onMouseOut={e => e.target.style.color = '#fff'}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Column: Who We Serve */}
      <div>
        <h4 style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Who we serve</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
          {['General Practice', 'Therapy', 'Psychology', 'Nursing', 'Mental Health', 'Nutrition', 'Medical Specialists'].map(item => (
            <li key={item} style={{ cursor: 'pointer', opacity: 0.8 }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Column: Resources */}
      <div>
        <h4 style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Resources</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
          {['Help Center', 'API Documentation', 'ABDM Sandbox', 'Security Standards', 'Developer Portal'].map(item => (
            <li key={item} style={{ cursor: 'pointer', opacity: 0.8 }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Column: Trust */}
      <div>
        <h4 style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Trust</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Data Sovereignty', 'HIPAA Compliance', 'DISHA Readiness'].map(item => (
            <li key={item} style={{ cursor: 'pointer', opacity: 0.8 }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Branding Column */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
         <div style={{ color: theme.colors.primary, fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
           🌐 English (India)
         </div>
         <div style={{ opacity: 0.5, fontSize: '0.8rem', textAlign: 'right' }}>
            ABDM Sandbox v2.0 <br />
            ISO 27001 Certified
         </div>
      </div>
    </div>

    {/* Bottom Identity Section */}
    <div style={{ 
      borderTop: '1px solid rgba(255,255,255,0.1)', 
      paddingTop: '40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src={logo} alt="logo" style={{ height: '60px', filter: 'brightness(0) invert(1)' }} />
        <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
          Nex<span style={{ color: theme.colors.primary }}>Health</span>
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px' }}>
        {['In', 'Yt', 'Fb', 'Tw'].map(s => (
          <span key={s} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff', opacity: 0.6 }}>{s}</span>
        ))}
      </div>
    </div>

    <div style={{ marginTop: '40px', fontSize: '0.85rem', opacity: 0.4, textAlign: 'center', fontWeight: '500' }}>
      © NexHealth 2026. Built for the Digital Spine of Indian Healthcare. ABDM Sandbox Certified.
    
    </div>
  
  <div style={utilityContainerStyle}>
        <span style={adminLabelStyle}>Super Admin Portal</span>
        <button onClick={() => setIsModalOpen(true)} style={fabStyle}>
          <span>+</span>
        </button>
      </div>

      {/* 2. Add the Modal component inside the main div */}
      <AnimatePresence>
        {isModalOpen && (
          <AddHospitalModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
  </div>
</footer>


    </div>
  );
};
const utilityContainerStyle = {
  position: 'fixed', bottom: '40px', right: '40px', zIndex: 100,
  display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px'
};

const adminLabelStyle = { 
  fontSize: '11px', fontWeight: '800', color: '#14532d', // theme.colors.primaryDark
  backgroundColor: 'rgba(255,255,255,0.95)', padding: '6px 14px',
  borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb', textTransform: 'uppercase'
};

const fabStyle = {
  width: '56px', height: '56px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
  color: 'white', border: 'none', cursor: 'pointer', fontSize: '28px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 10px 20px rgba(40, 167, 69, 0.3)'
};
export default LandingPage;