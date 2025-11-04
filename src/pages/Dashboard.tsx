import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigation } from '../components/Navigation';
import { Users, TrendingUp, Mail, Plus, LayoutDashboard } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  activeCampaigns: number;
  responseRate: number;
  meetingsBooked: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeCampaigns: 0,
    responseRate: 0,
    meetingsBooked: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get total leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Get active campaigns count
      const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalLeads: leadsCount || 0,
        activeCampaigns: campaignsCount || 0,
        responseRate: 0, // Will be calculated from actual data
        meetingsBooked: 0 // Will be calculated from actual data
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your lead revival campaigns</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Leads */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Leads</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{stats.totalLeads}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-info-100 to-info-50 rounded-xl">
                    <Users className="w-8 h-8 text-info-600" />
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Campaigns</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{stats.activeCampaigns}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-success-100 to-success-50 rounded-xl">
                    <Mail className="w-8 h-8 text-success-600" />
                  </div>
                </div>
              </div>

              {/* Response Rate */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Response Rate</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{stats.responseRate}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Meetings Booked */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Meetings Booked</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{stats.meetingsBooked}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-xl">
                    <LayoutDashboard className="w-8 h-8 text-secondary-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => navigate('/leads/import')}
                  className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 group"
                >
                  <Plus className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-primary-600">Import Leads</span>
                </button>

                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 group"
                >
                  <Mail className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-primary-600">Create Campaign</span>
                </button>

                <button
                  onClick={() => navigate('/leads')}
                  className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-md transition-all duration-200 group"
                >
                  <Users className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-primary-600">View All Leads</span>
                </button>
              </div>
            </div>

            {/* Getting Started */}
            {stats.totalLeads === 0 && (
              <div className="mt-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-brand-lg p-10 text-white animate-slide-up">
                <h2 className="text-2xl font-bold mb-4">🚀 Get Started with Rekindle</h2>
                <p className="mb-6 text-white/90">
                  Start reviving your dormant leads in 3 simple steps:
                </p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-white text-[#FF6B35] rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <span>Import your dormant leads (CSV, CRM sync, or manual entry)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-white text-[#FF6B35] rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <span>Create your first revival campaign with AI-powered messaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-white text-[#FF6B35] rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <span>Watch your leads come back to life with automated follow-ups</span>
                  </li>
                </ol>
                <button
                  onClick={() => navigate('/leads/import')}
                  className="mt-8 px-8 py-4 bg-white text-primary-600 font-bold text-lg rounded-lg hover:bg-gray-50 hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Import Your First Leads
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
