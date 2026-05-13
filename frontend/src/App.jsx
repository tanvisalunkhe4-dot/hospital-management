import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext';
import './App.css';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Login from './pages/Login';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';

// --- DASHBOARD LAYOUTS ---
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import AdminDashboard      from './components/Dashboards/AdminDashboard/pages/AdminDashboard';
import ReceptionistDashboard from './components/Dashboards/ReceptionistDashboard/pages/ReceptionistDashboard';
import DoctorDashboard      from './components/Dashboards/DoctorDashboard/pages/DoctorDashboard';
import NurseDashboard       from './components/Dashboards/NurseDashboard/pages/NurseDashboard';
import PatientDashboard     from './components/Dashboards/PatientDashboard/pages/PatientDashboard';

// Main Dashboard Layouts (Now inside their respective pages folders)
import PharmacistDashboard  from './components/Dashboards/PharmacistDashboard/pages/PharmacistDashboard';
import LabDashboard         from './components/Dashboards/LabDashboard/pages/LabDashboard';
// --- MODULE PAGES ---

// Nurse Module
import NurseOverview from './components/Dashboards/NurseDashboard/pages/NurseOverview';
import PatientMonitoring from './components/Dashboards/NurseDashboard/pages/PatientMonitoring';
import VitalsManagement from './components/Dashboards/NurseDashboard/pages/VitalsManagement';
import WardManagement from './components/Dashboards/NurseDashboard/pages/WardManagement';
import TreatmentSupport from './components/Dashboards/NurseDashboard/pages/TreatmentSupport';
import RecordsAccess from './components/Dashboards/NurseDashboard/pages/RecordsAccess';

// Pharmacist Module
import PrescriptionQueue    from './components/Dashboards/PharmacistDashboard/pages/PrescriptionQueue';
import MedicineDispensing   from './components/Dashboards/PharmacistDashboard/pages/MedicineDispensing';
import InventoryManagement  from './components/Dashboards/PharmacistDashboard/pages/InventoryManagement';
import SupplierManagement   from './components/Dashboards/PharmacistDashboard/pages/SupplierManagement';
import StockAlerts          from './components/Dashboards/PharmacistDashboard/pages/StockAlerts';

// --- LAB MODULE PAGES ---
import TestProcessing       from './components/Dashboards/LabDashboard/pages/TestProcessing'; 
import TestRequests         from './components/Dashboards/LabDashboard/pages/TestRequests';
import SampleCollection     from './components/Dashboards/LabDashboard/pages/SampleCollection';
import ReportManager        from './components/Dashboards/LabDashboard/pages/ReportManager';
import LabHistory           from './components/Dashboards/LabDashboard/pages/LabHistory';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Main Landing & Auth */}
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/onboarding" element={<OnboardingPageWrapper />} />
          <Route path="/login" element={<LoginWrapper />} />

          {/* Super Admin & Hospital Admin */}
          <Route path="/nex-master-control" element={<SuperAdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard key={localStorage.getItem('hospital_id')} />} />

          {/* Receptionist Portal */}
          <Route path="/reception-desk" element={<ReceptionistDashboardWrapper />} />

          {/* Doctor Portal */}
          <Route path="/doctor-portal" element={<DoctorDashboardWrapper />} />

          {/* Nurse Portal with Nested Routing */}
          <Route path="/nurse-dashboard" element={<NurseDashboardWrapper />}>
            <Route index element={<NurseOverview />} />
            <Route path="overview" element={<NurseOverview />} />
            <Route path="monitoring" element={<PatientMonitoring />} />
            <Route path="vitals" element={<VitalsManagement />} />
            <Route path="ward" element={<WardManagement />} />
            <Route path="treatment" element={<TreatmentSupport />} />
            <Route path="records" element={<RecordsAccess />} />
          </Route>

          {/* Pharmacist Portal with Nested Routing */}
          <Route path="/pharmacist" element={<PharmacistDashboardWrapper />}>
            <Route index element={<PrescriptionQueue />} />
            <Route path="prescriptions" element={<PrescriptionQueue />} />
            <Route path="dispense" element={<MedicineDispensing />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="alerts" element={<StockAlerts />} />
          </Route>

          {/* Lab Portal with Nested Routing */}
          <Route path="/lab-dashboard" element={<LabDashboardWrapper />}>
  <Route index element={<TestProcessing />} /> 
  <Route path="requests" element={<TestRequests />} />
  <Route path="samples" element={<SampleCollection />} />
  <Route path="reports" element={<ReportManager />} />
  <Route path="history" element={<LabHistory />} />
</Route>
          {/* Patient Portal */}
          <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
          <Route path="/patient-records/*" element={<Navigate to="/patient-dashboard/overview" replace />} />

          {/* General Navigation */}
          <Route path="/about" element={<AboutPageWrapper />} />
          <Route path="/features" element={<FeaturesPageWrapper />} />
          <Route path="/solutions" element={<SolutionsPageWrapper />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

// --- NAVIGATION WRAPPERS ---

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
  return (
    <Login
      onSignupRedirect={() => navigate('/onboarding')}
      onForgotPassword={() => console.log("Forgot password clicked")}
    />
  );
};

const ReceptionistDashboardWrapper = () => {
  const navigate = useNavigate();
  return <ReceptionistDashboard onLogout={() => navigate('/login')} />;
};

const DoctorDashboardWrapper = () => {
  const navigate = useNavigate();
  return <DoctorDashboard onLogout={() => navigate('/login')} />;
};

const NurseDashboardWrapper = () => {
  const navigate = useNavigate();
  return <NurseDashboard onLogout={() => navigate('/login')} />;
};

const PharmacistDashboardWrapper = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem('user_data'));
  
  // Allow if role is Pharmacist OR if role is Staff with a PHR ID
  const isAuthorized = userData?.role === 'Pharmacist' || 
                       (userData?.role === 'Staff' && userData?.staff_id?.startsWith('PHR'));

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <PharmacistDashboard onLogout={() => navigate('/login')} />;
};

const LabDashboardWrapper = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem('user_data'));
  
  // Normalize the role to handle spaces or different naming conventions
  const normalizedRole = userData?.role?.replace(" ", "");

  // Check if authorized (Role is Lab, LabTechnician, or Staff with a LAB ID)
  const isAuthorized = 
    normalizedRole === 'Lab' || 
    normalizedRole === 'LabTechnician' || 
    (userData?.role === 'Staff' && userData?.staff_id?.startsWith('LAB'));

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <LabDashboard onLogout={() => navigate('/login')} />;
};
const AboutPageWrapper = () => {
  const n = useNavigate();
  return <AboutPage onBack={() => n('/')} />;
};

const FeaturesPageWrapper = () => {
  const n = useNavigate();
  return <FeaturesPage onBack={() => n('/')} />;
};

const SolutionsPageWrapper = () => {
  const n = useNavigate();
  return <SolutionsPage onBack={() => n('/')} />;
};

export default App;