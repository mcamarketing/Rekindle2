import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, TrendingUp, Settings, LogOut, Cpu } from 'lucide-react';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="focus:outline-none">
              <img
                src="/images/image copy copy.png"
                alt="Rekindle.ai"
                className="h-10 w-auto"
              />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 transition ${
                isActive('dashboard')
                  ? 'text-[#FF6B35] font-semibold'
                  : 'text-gray-700 hover:text-[#FF6B35]'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/leads')}
              className={`flex items-center gap-2 transition ${
                isActive('leads')
                  ? 'text-[#FF6B35] font-semibold'
                  : 'text-gray-700 hover:text-[#FF6B35]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Leads</span>
            </button>

            <button
              onClick={() => navigate('/campaigns')}
              className={`flex items-center gap-2 transition ${
                isActive('campaigns')
                  ? 'text-[#FF6B35] font-semibold'
                  : 'text-gray-700 hover:text-[#FF6B35]'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Campaigns</span>
            </button>

            <button
              onClick={() => navigate('/agents')}
              className={`flex items-center gap-2 transition ${
                isActive('agents')
                  ? 'text-[#FF6B35] font-semibold'
                  : 'text-gray-700 hover:text-[#FF6B35]'
              }`}
            >
              <Cpu className="w-5 h-5" />
              <span className="font-medium">AI Agents</span>
            </button>

            <button
              onClick={() => navigate('/billing')}
              className={`flex items-center gap-2 transition ${
                isActive('billing')
                  ? 'text-[#FF6B35] font-semibold'
                  : 'text-gray-700 hover:text-[#FF6B35]'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Billing</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
