// theme.js - Enterprise Hospital Management System Theme

const theme = {
  colors: {
    // Brand Colors - High-quality Medical Greens
    primary: "#059669",        // Deep Emerald Green (Main actions)
    primaryDark: "#065f46",    // Darker shade for hover states
    primaryLight: "#d1fae5",   // Soft mint for light backgrounds/tags
    secondary: "hsl(160, 84%, 39%)",      // Brighter accent green
    accent: "#0ea5e9",         // Medical Blue (Used for info/links)
    
    // UI Neutrals - For professional layering
    background: "#f8fafc",     // Soft slate white
    cardWhite: "#ffffff",      // Pure white for cards
    text: "#1e293b",           // Slate 800 (Primary text)
    subtitle: "#64748b",       // Slate 500 (Secondary info)
    muted: "#94a3b8",          // Slate 400 (Placeholder text)
    border: "#e2e8f0",         // Default border color
    divider: "#f1f5f9",        // Subtle line separators
    
    // Status & Feedback (Critical for Medical Apps)
    success: "#22c55e",        // Healthy/Stable
    error: "#ef4444",          // Emergency/Critical
    warning: "#f59e0b",        // Follow-up required
    info: "#3b82f6",           // General information
    emergency: "#991b1b",      // High-priority alert

    // Specialized Chart/Data Colors (For Patient Analytics)
    charts: {
      blue: "#6366f1",
      purple: "#a855f7",
      pink: "#ec4899",
      orange: "#f97316",
    },

    // Gradients
    buttonGradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    backgroundGradient: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)",
    glassGradient: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
  },

  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      h2: "1.75rem",    // 28px
      h1: "2.5rem",     // 40px
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    }
  },

  spacing: {
    unit: 4, // 4px base
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    huge: "64px",
  },

  borderRadius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",  // For sidebar/main containers
    full: "9999px",
  },

  boxShadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    sidebar: "4px 0 24px rgba(0, 0, 0, 0.02)",
    buttonActive: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    focus: "0 0 0 3px rgba(5, 150, 105, 0.2)", // Emerald glow for input focus
  },

  // Z-Index (Prevents UI overlap bugs)
  zIndex: {
    base: 1,
    sidebar: 100,
    navbar: 200,
    dropdown: 300,
    modal: 1000,
    tooltip: 1100,
    toast: 1200,
  },

  // Breakpoints (For Responsive Design)
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1440px",
  },

  transitions: {
    default: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 0.15s ease-in-out",
    slow: "all 0.5s ease-in-out",
  }
};

export default theme;