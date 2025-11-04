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
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your lead revival campaigns</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Leads */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCampaigns}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Response Rate */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.responseRate}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Meetings Booked */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Meetings Booked</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.meetingsBooked}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <LayoutDashboard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/leads/import')}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition"
                >
                  <Plus className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-gray-700">Import Leads</span>
                </button>

                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition"
                >
                  <Mail className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-gray-700">Create Campaign</span>
                </button>

                <button
                  onClick={() => navigate('/leads')}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition"
                >
                  <Users className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-gray-700">View All Leads</span>
                </button>
              </div>
            </div>

            {/* Getting Started */}
            {stats.totalLeads === 0 && (
              <div className="mt-8 bg-gradient-to-br from-[#FF6B35] to-[#F7931E] rounded-lg shadow-lg p-8 text-white">
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
                  className="mt-6 px-6 py-3 bg-white text-[#FF6B35] font-bold rounded-lg hover:bg-gray-100 transition"
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
