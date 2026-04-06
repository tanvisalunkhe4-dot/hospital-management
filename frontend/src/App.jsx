import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Login from './pages/Login';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import ReceptionistDashboard from './pages/Receptionist/ReceptionistDashboard';

// --- ABDM IMPORTS ---
import CreateAbha from './pages/ABDM/CreateAbha';
import VerifyAbha from './pages/ABDM/VerifyAbha';
import LinkRecords from './pages/ABDM/LinkRecords';
import FetchRecords from './pages/ABDM/FetchRecords';
import UploadRecords from './pages/ABDM/UploadRecords';
import ConsentManager from './pages/ABDM/ConsentManager';
import DownloadAbha from './pages/ABDM/DownloadAbha';

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Landing Route */}
        <Route path="/" element={<LandingPageWrapper />} />
        
        {/* Authentication Routes */}
        <Route path="/onboarding" element={<OnboardingPageWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        
        {/* Dashboards */}
        <Route path="/nex-master-control" element={<SuperAdminDashboard />} />
        <Route path="/reception-desk" element={<ReceptionistDashboardWrapper />} />

        {/* General Navigation Routes */}
        <Route path="/about" element={<AboutPageWrapper />} />
        <Route path="/features" element={<FeaturesPageWrapper />} />
        <Route path="/solutions" element={<SolutionsPageWrapper />} />

        {/* ABDM SUB-PAGES ROUTES */}
        <Route path="/create-abha" element={<CreateAbhaWrapper />} />
        <Route path="/verify-abha" element={<VerifyAbhaWrapper />} />
        <Route path="/link-records" element={<LinkRecordsWrapper />} />
        <Route path="/fetch-records" element={<FetchRecordsWrapper />} />
        <Route path="/upload-records" element={<UploadRecordsWrapper />} />
        <Route path="/consent-mgmt" element={<ConsentManagerWrapper />} />
        <Route path="/download-abha" element={<DownloadAbhaWrapper />} />
      </Routes>
    </Router>
  );
}

// --- Navigation Wrappers ---

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

const ReceptionistDashboardWrapper = () => {
  const navigate = useNavigate();
  return <ReceptionistDashboard onLogout={() => navigate('/login')} />;
};

const FeaturesPageWrapper = () => {
  const navigate = useNavigate();
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