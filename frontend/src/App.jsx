import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Login from './pages/Login';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';

// Portals you've been working on
import ReceptionistDashboard from './pages/Receptionist/ReceptionistDashboard';
import DoctorDashboard from "./components/Dashboards/Doctor/DoctorDashboard";

// New Dashboards from the merge
import AdminDashboard from "./components/Dashboards/AdminDashboard/pages/AdminDashboard";
import PatientDashboard from './components/Dashboards/PatientDashboard/pages/PatientDashboard';

// ABDM Components (Make sure these are imported at the top!)
// import { CreateAbha, VerifyAbha, LinkRecords, FetchRecords, UploadRecords, ConsentManager, DownloadAbha } from './pages/ABDM'; 

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Landing & Auth */}
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/onboarding" element={<OnboardingPageWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        
        {/* Core Dashboards */}
        <Route path="/nex-master-control" element={<SuperAdminDashboard />} />
        <Route path="/reception-desk" element={<ReceptionistDashboardWrapper />} />
        <Route path="/doctor-portal" element={<DoctorDashboardWrapper />} />
        <Route path="/admin-dashboard" element={<AdminDashboard key={localStorage.getItem('hospital_id')} />} />
        
        {/* Patient Portal with Nested Routing */}
        <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
        <Route path="/patient-records/*" element={<Navigate to="/patient-dashboard/overview" replace />} />

        {/* General Navigation */}
        <Route path="/about" element={<AboutPageWrapper />} />
        <Route path="/features" element={<FeaturesPageWrapper />} />
        <Route path="/solutions" element={<SolutionsPageWrapper />} />

        {/* ABDM SUB-PAGES (Keeping your progress here) */}
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

// --- Navigation Wrappers (Optimized) ---

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/onboarding')} onLoginClick={() => navigate('/login')} onNavigate={(target) => navigate(`/${target}`)} />;
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

const DoctorDashboardWrapper = () => {
  const navigate = useNavigate();
  return <DoctorDashboard onLogout={() => navigate('/login')} />;
};

const AboutPageWrapper = () => { const n = useNavigate(); return <AboutPage onBack={() => n('/')} />; };
const FeaturesPageWrapper = () => { const n = useNavigate(); return <FeaturesPage onBack={() => n('/')} />; };
const SolutionsPageWrapper = () => { const n = useNavigate(); return <SolutionsPage onBack={() => n('/')} />; };

// ABDM Wrappers (Ensure these components are imported!)
const CreateAbhaWrapper = () => { const n = useNavigate(); return <CreateAbha onBack={() => n('/')} />; };
const VerifyAbhaWrapper = () => { const n = useNavigate(); return <VerifyAbha onBack={() => n('/')} />; };
const LinkRecordsWrapper = () => { const n = useNavigate(); return <LinkRecords onBack={() => n('/')} />; };
const FetchRecordsWrapper = () => { const n = useNavigate(); return <FetchRecords onBack={() => n('/')} />; };
const UploadRecordsWrapper = () => { const n = useNavigate(); return <UploadRecords onBack={() => n('/')} />; };
const ConsentManagerWrapper = () => { const n = useNavigate(); return <ConsentManager onBack={() => n('/')} />; };
const DownloadAbhaWrapper = () => { const n = useNavigate(); return <DownloadAbha onBack={() => n('/')} />; };

export default App;