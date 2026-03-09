import { useState } from 'react'
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import './App.css'

function App() {
  const [view, setView] = useState('landing');

  return (
    <>
      {view === 'landing' && (
        <LandingPage onGetStarted={() => setView('onboarding')} />
      )}
      
      {view === 'onboarding' && (
        <OnboardingPage 
          // This line "hands over" the function to the component
          onLoginRedirect={() => setView('login')} 
        />
      )}

      {/* Added a placeholder for your Login view */}
      {view === 'login' && (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Login Page Coming Soon</h1>
            <button onClick={() => setView('onboarding')}>Back</button>
        </div>
      )}
    </>
  );
}

export default App;