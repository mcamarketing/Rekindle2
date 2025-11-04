import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { CreateCampaign } from './pages/CreateCampaign';
import { LeadImport } from './pages/LeadImport';
import { Billing } from './pages/Billing';
import { AIAgents } from './pages/AIAgents';
import { Analytics } from './pages/Analytics';

function App() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] via-[#F7931E] to-[#FF6B35] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (route === '/' || route === '/login' || route === '/signup') {
      window.history.pushState({}, '', '/dashboard');
      return <Dashboard />;
    }

    if (route === '/leads') {
      return <Leads />;
    }

    if (route.startsWith('/leads/')) {
      const leadId = route.split('/leads/')[1];
      return <LeadDetail leadId={leadId} />;
    }

    if (route === '/campaigns/create') {
      return <CreateCampaign />;
    }

    if (route === '/leads/import') {
      return <LeadImport />;
    }

    if (route === '/billing') {
      return <Billing />;
    }

    if (route === '/agents') {
      return <AIAgents />;
    }

    if (route === '/analytics') {
      return <Analytics />;
    }

    if (route === '/dashboard') {
      return <Dashboard />;
    }

    return <Dashboard />;
  }

  if (route === '/signup') {
    return <SignUp />;
  }

  if (route === '/login') {
    return <Login />;
  }

  return <LandingPage />;
}

export default App;
