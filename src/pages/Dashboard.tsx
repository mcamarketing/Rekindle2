import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigation } from '../components/Navigation';
import { TiltCard } from '../components/TiltCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { RippleButton } from '../components/RippleButton';
import { Users, TrendingUp, Mail, Plus, LayoutDashboard, ArrowUp, ArrowDown } from 'lucide-react';

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
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalLeads: leadsCount || 0,
        activeCampaigns: campaignsCount || 0,
        responseRate: 0,
        meetingsBooked: 0
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

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'from-blue-100 to-blue-50',
      iconColor: 'text-blue-600',
      trend: +12,
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      icon: Mail,
      gradient: 'from-green-500 to-green-600',
      bg: 'from-green-100 to-green-50',
      iconColor: 'text-green-600',
      trend: +5,
    },
    {
      title: 'Response Rate',
      value: stats.responseRate,
      suffix: '%',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600',
      bg: 'from-orange-100 to-orange-50',
      iconColor: 'text-orange-600',
      trend: +8,
    },
    {
      title: 'Meetings Booked',
      value: stats.meetingsBooked,
      icon: LayoutDashboard,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'from-purple-100 to-purple-50',
      iconColor: 'text-purple-600',
      trend: +3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your lead revival campaigns</p>
        </motion.div>

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
              {statCards.map((stat, index) => (
                <TiltCard key={stat.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 h-full"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          {stat.title}
                        </p>
                        <p className="text-4xl font-bold text-gray-900 mt-3">
                          <AnimatedCounter
                            value={stat.value}
                            suffix={stat.suffix}
                            duration={1.5}
                          />
                        </p>
                        {stat.trend !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="flex items-center gap-1 mt-2"
                          >
                            {stat.trend > 0 ? (
                              <ArrowUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {Math.abs(stat.trend)}% vs last month
                            </span>
                          </motion.div>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`p-4 bg-gradient-to-br ${stat.bg} rounded-xl`}
                      >
                        <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                      </motion.div>
                    </div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <RippleButton
                    onClick={() => navigate('/leads/import')}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 group"
                  >
                    <Plus className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700 group-hover:text-primary-600">Import Leads</span>
                  </RippleButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <RippleButton
                    onClick={() => navigate('/campaigns/create')}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 group"
                  >
                    <Mail className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700 group-hover:text-primary-600">Create Campaign</span>
                  </RippleButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <RippleButton
                    onClick={() => navigate('/leads')}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 group"
                  >
                    <Users className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700 group-hover:text-primary-600">View All Leads</span>
                  </RippleButton>
                </motion.div>
              </div>
            </motion.div>

            {stats.totalLeads === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg p-10 text-white"
              >
                <h2 className="text-2xl font-bold mb-4">🚀 Get Started with Rekindle</h2>
                <p className="mb-6 text-white/90">
                  Start reviving your dormant leads in 3 simple steps:
                </p>
                <ol className="space-y-3">
                  {[
                    'Import your dormant leads (CSV, CRM sync, or manual entry)',
                    'Create your first revival campaign with AI-powered messaging',
                    'Watch your leads come back to life with automated follow-ups'
                  ].map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-white text-[#FF6B35] rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </motion.li>
                  ))}
                </ol>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RippleButton
                    onClick={() => navigate('/leads/import')}
                    variant="secondary"
                    className="mt-8 bg-white text-primary-600 hover:bg-gray-50"
                  >
                    Import Your First Leads
                  </RippleButton>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
