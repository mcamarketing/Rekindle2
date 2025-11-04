import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, TrendingUp, Settings, LogOut, Cpu, BarChart3 } from 'lucide-react';

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
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="focus:outline-none focus:ring-4 focus:ring-primary-100 rounded-lg transition-all duration-200"
            >
              <img
                src="/images/image copy copy.png"
                alt="Rekindle.ai"
                className="h-10 w-auto"
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('dashboard')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/leads')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('leads')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <Users className="w-5 h-5" />
              <span>Leads</span>
            </button>

            <button
              onClick={() => navigate('/campaigns')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('campaigns')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Campaigns</span>
            </button>

            <button
              onClick={() => navigate('/agents')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('agents')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <Cpu className="w-5 h-5" />
              <span>AI Agents</span>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('analytics')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => navigate('/billing')}
              className={`
                flex items-center gap-2 px-4 py-2
                font-medium text-base rounded-lg
                transition-all duration-200
                ${isActive('billing')
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              <span>Billing</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-error-600 hover:bg-error-50 font-medium text-base rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
