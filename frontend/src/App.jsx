import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Login from './pages/Login';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import AdminDashboard from "./components/Dashboards/AdminDashboard/pages/AdminDashboard";
import PatientDashboard from './components/Dashboards/PatientDashboard/pages/PatientDashboard';

import './App.css'

function App() {
  const currentHospitalId = localStorage.getItem('hospital_id');
  return (
    <Router>
      <Routes>
        {/* Main Landing Route */}
        <Route path="/" element={<LandingPageWrapper />} />
        
        {/* Authentication Routes */}
        <Route path="/onboarding" element={<OnboardingPageWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/nex-master-control" element={<SuperAdminDashboard />} />
        <Route 
  path="/admin-dashboard" 
  element={<AdminDashboard key={localStorage.getItem('hospital_id')} />} 
/>
<Route path="/patient-dashboard/*" element={<PatientDashboard />} />
<Route path="/patient-records/*" element={<Navigate to="/patient-dashboard/overview" replace />} />
            {/* General Navigation Routes */}
        <Route path="/about" element={<AboutPageWrapper />} />
        <Route path="/features" element={<FeaturesPageWrapper />} />
        <Route path="/solutions" element={<SolutionsPageWrapper />} />

         </Routes>
    </Router>
  );
}

// --- Navigation Wrappers to maintain your existing component props ---

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return (
    <LandingPage 
      onGetStarted={() => navigate('/onboarding')} 
      onLoginClick={() => navigate('/login')} 
      onNavigate={(target) => navigate(`/${target}`)} 
    />
  );
};

const OnboardingPageWrapper = () => {
  const navigate = useNavigate();
  return <OnboardingPage onLoginRedirect={() => navigate('/login')} />;
};

const LoginWrapper = () => {
  const navigate = useNavigate();
  return <Login onSignupRedirect={() => navigate('/onboarding')} onForgotPassword={() => console.log("Forgot password clicked")} />;
};

const FeaturesPageWrapper = () => {
  const navigate = useNavigate();
  // Using navigate(-1) allows the "Back" arrow icon in the UI to act just like the browser back button
  return <FeaturesPage onBack={() => navigate('/')} />;
};

// Generic Wrapper for ABDM and General pages
const AboutPageWrapper = () => { const n = useNavigate(); return <AboutPage onBack={() => n('/')} />; };
const SolutionsPageWrapper = () => { const n = useNavigate(); return <SolutionsPage onBack={() => n('/')} />; };
const CreateAbhaWrapper = () => { const n = useNavigate(); return <CreateAbha onBack={() => n('/')} />; };
const VerifyAbhaWrapper = () => { const n = useNavigate(); return <VerifyAbha onBack={() => n('/')} />; };
const LinkRecordsWrapper = () => { const n = useNavigate(); return <LinkRecords onBack={() => n('/')} />; };
const FetchRecordsWrapper = () => { const n = useNavigate(); return <FetchRecords onBack={() => n('/')} />; };
const UploadRecordsWrapper = () => { const n = useNavigate(); return <UploadRecords onBack={() => n('/')} />; };
const ConsentManagerWrapper = () => { const n = useNavigate(); return <ConsentManager onBack={() => n('/')} />; };
const DownloadAbhaWrapper = () => { const n = useNavigate(); return <DownloadAbha onBack={() => n('/')} />; };

export default App;