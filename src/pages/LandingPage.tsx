import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Phone,
  Upload,
  Brain,
  Calendar,
  Shield,
  ShieldCheck,
  Sliders,
  User,
  Briefcase,
  Building2,
  Star,
  ArrowRight,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const COLORS = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  navy: '#1A1F2E',
  darkGray: '#242938',
  mediumGray: '#313645',
  success: '#10B981',
};

const Button = ({ children, primary = true, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) => {
  const baseClasses = 'px-10 py-5 font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg';
  const primaryClasses = 'bg-[#FF6B35] text-white hover:bg-[#F7931E]';
  const secondaryClasses = 'bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white';

  return (
    <button
      className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const SectionTitle = ({ eyebrow, children, subtitle }: { eyebrow?: string; children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-16">
    {eyebrow && (
      <div className="text-[#FF6B35] font-semibold text-sm uppercase tracking-widest mb-4">
        {eyebrow}
      </div>
    )}
    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
      {children}
    </h2>
    {subtitle && (
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

// Interactive Channel Selector Component
const InteractiveChannelSelector = ({
  channels,
  activeChannel,
  setActiveChannel
}: {
  channels: any[];
  activeChannel: string;
  setActiveChannel: (id: string) => void;
}) => {
  const colorClasses: Record<string, any> = {
    blue: { bg: 'from-blue-900/30 to-blue-800/20', border: 'border-blue-700/50', text: 'text-blue-400', active: 'bg-blue-900/50 border-blue-500' },
    green: { bg: 'from-green-900/30 to-green-800/20', border: 'border-green-700/50', text: 'text-green-400', active: 'bg-green-900/50 border-green-500' },
    emerald: { bg: 'from-emerald-900/30 to-emerald-800/20', border: 'border-emerald-700/50', text: 'text-emerald-400', active: 'bg-emerald-900/50 border-emerald-500' },
    orange: { bg: 'from-orange-900/30 to-orange-800/20', border: 'border-orange-700/50', text: 'text-orange-400', active: 'bg-orange-900/50 border-orange-500' },
    purple: { bg: 'from-purple-900/30 to-purple-800/20', border: 'border-purple-700/50', text: 'text-purple-400', active: 'bg-purple-900/50 border-purple-500' }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);
  if (!activeChannelData) return null;

  return (
    <>
      {/* Channel Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        {channels.map(channel => {
          const colors = colorClasses[channel.color];
          const isActive = activeChannel === channel.id;
          const Icon = channel.icon;

          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`
                bg-gradient-to-br ${colors.bg} rounded-xl p-6 border-2
                ${isActive ? colors.active : colors.border}
                hover:scale-105 transition-all duration-300 cursor-pointer
                ${isActive ? 'shadow-lg shadow-[#FF6B35]/20' : 'hover:shadow-md'}
              `}
            >
              <Icon className={`w-8 h-8 mx-auto mb-3 ${colors.text}`} />
              <div className={`font-bold mb-2 ${isActive ? 'text-white' : ''}`}>
                {channel.name}
              </div>
              <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                {channel.shortDesc}
              </div>
              {isActive && (
                <div className="mt-3 text-xs font-semibold text-white">
                  Selected ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Details Panel */}
      <div className="max-w-5xl mx-auto bg-[#1A1F2E] rounded-2xl p-8 border-2 border-[#FF6B35]">
        <div className="flex items-start gap-6">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClasses[activeChannelData.color].bg} border-2 ${colorClasses[activeChannelData.color].border} flex items-center justify-center flex-shrink-0`}>
            <activeChannelData.icon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeChannelData.name}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeChannelData.description}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#242938] rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-[#FF6B35] mb-1">{activeChannelData.stats.open || activeChannelData.stats.meeting}</div>
                <div className="text-xs text-gray-400">Open Rate</div>
              </div>
              <div className="bg-[#242938] rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-[#FF6B35] mb-1">{activeChannelData.stats.reply}</div>
                <div className="text-xs text-gray-400">Reply Rate</div>
              </div>
              <div className="bg-[#242938] rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-[#FF6B35] mb-1">{activeChannelData.stats.meeting}</div>
                <div className="text-xs text-gray-400">Meeting Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ROI Calculator Component
const ROICalculator = ({
  dealValue,
  setDealValue,
  meetingsGoal,
  setMeetingsGoal,
  monthlyCost,
  revenue,
  roi,
  profit
}: {
  dealValue: number;
  setDealValue: (val: number) => void;
  meetingsGoal: number;
  setMeetingsGoal: (val: number) => void;
  monthlyCost: number;
  revenue: number;
  roi: string;
  profit: number;
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-[#242938] rounded-2xl p-8 border border-gray-700">
      <h3 className="text-2xl font-bold text-center mb-8 text-white">
        Calculate Your ROI in 30 Seconds
      </h3>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            Your Average Deal Value
          </label>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={dealValue}
            onChange={(e) => setDealValue(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-lg font-bold text-[#FF6B35]">
            £{dealValue.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            Meetings Per Month Goal
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={meetingsGoal}
            onChange={(e) => setMeetingsGoal(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-lg font-bold text-[#FF6B35]">
            {meetingsGoal} meetings
          </div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm text-gray-400 mb-1">Monthly Cost</div>
            <div className="text-2xl font-bold text-white">
              £{Math.round(monthlyCost).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              (£99 + {meetingsGoal} × £{(dealValue * 0.025).toFixed(0)})
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Revenue (20% close)</div>
            <div className="text-2xl font-bold text-green-400">
              £{Math.round(revenue).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              ({Math.round(meetingsGoal * 0.2)} deals × £{dealValue.toLocaleString()})
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">ROI</div>
            <div className="text-2xl font-bold text-green-400">{roi}x</div>
            <div className="text-xs text-gray-500">
              £{Math.round(profit).toLocaleString()} profit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function LandingPage() {
  const [dealValue, setDealValue] = useState(2500);
  const [meetingsGoal, setMeetingsGoal] = useState(40);
  const [activeChannel, setActiveChannel] = useState('email');

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const monthlyCost = 99 + (meetingsGoal * (dealValue * 0.025));
  const revenue = meetingsGoal * 0.2 * dealValue;
  const roi = (revenue / monthlyCost).toFixed(1);
  const profit = revenue - monthlyCost;

  const channels = [
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'blue',
      shortDesc: 'Highly contextual',
      description: 'Highly contextual and personalized. AI-researched subject lines that reference recent company news, job changes, funding rounds. Each email is unique.',
      gradient: 'from-blue-900/30 to-blue-800/20',
      border: 'border-blue-700/50',
      activeBorder: 'border-blue-500',
      iconColor: 'text-blue-400',
      stats: { open: '15.2%', reply: '4.8%', meeting: '2.1%' }
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageSquare,
      color: 'green',
      shortDesc: 'Capture attention',
      description: 'Capture executive attention where they read. 98% open rate within 3 minutes. Perfect for time-sensitive follow-ups. Short, punchy messages.',
      gradient: 'from-green-900/30 to-green-800/20',
      border: 'border-green-700/50',
      activeBorder: 'border-green-500',
      iconColor: 'text-green-400',
      stats: { open: '98%', reply: '12%', meeting: '3.2%' }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'emerald',
      shortDesc: 'Where execs read',
      description: 'Capture executive attention where they read. Perfect for international leads. Voice notes, documents, and casual touchpoints work great in Europe and APAC.',
      gradient: 'from-emerald-900/30 to-emerald-800/20',
      border: 'border-emerald-700/50',
      activeBorder: 'border-emerald-500',
      iconColor: 'text-emerald-400',
      stats: { open: '95%', reply: '18%', meeting: '4.5%' }
    },
    {
      id: 'push',
      name: 'Push',
      icon: Bell,
      color: 'purple',
      shortDesc: 'Mobile alerts',
      description: 'Mobile alerts (if applicable via integration). Instant delivery, high visibility when the lead is most engaged with mobile device.',
      gradient: 'from-purple-900/30 to-purple-800/20',
      border: 'border-purple-700/50',
      activeBorder: 'border-purple-500',
      iconColor: 'text-purple-400',
      stats: { open: '87%', reply: '8%', meeting: '1.8%' }
    },
    {
      id: 'voicemail',
      name: 'Voicemail',
      icon: Phone,
      color: 'orange',
      shortDesc: 'Human touch',
      description: 'AI voice drops for the human touch. Natural and personalized voice messages dropped directly to voicemail (no ringing). Perfect final touchpoint.',
      gradient: 'from-orange-900/30 to-orange-800/20',
      border: 'border-orange-700/50',
      activeBorder: 'border-orange-500',
      iconColor: 'text-orange-400',
      stats: { open: '72%', reply: '6%', meeting: '1.5%' }
    }
  ];

  const selectedChannel = channels.find(c => c.id === activeChannel) || channels[0];

  return (
    <div className="bg-[#1A1F2E] min-h-screen text-white">

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 bg-[#1A1F2E]/95 backdrop-blur-sm shadow-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img
              src="/images/image copy copy.png"
              alt="Rekindle.ai - Lead Revival Platform"
              className="h-12 md:h-14 w-auto hover:opacity-90 transition-opacity"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a href="#auto-icp" className="text-gray-400 hover:text-white transition">
              Auto-ICP
            </a>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#FF6B35] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#F7931E] transition"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">

        {/* SECTION 1: HERO */}
        <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-b from-[#1A1F2E] via-[#1F2430] to-[#1A1F2E]">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#FF6B35] opacity-20 blur-3xl rounded-full -z-10"></div>

          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-block bg-[#FF6B35]/20 border border-[#FF6B35] text-[#FF6B35] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Built for Sales Managers & SDR Teams
              </div>

              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
                Rekindle Pipeline.{' '}
                <span className="text-[#FF6B35]">Only Pay When The Meeting is Booked.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Stop letting £50,000 in valuable acquisition spend rot in your CRM. Our AI automatically finds the exact timing and personalized hook to convert dormant leads into high-quality, booked meetings—guaranteed.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>4.9/5 from 300+ businesses</span>
                </div>
                <span className="text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>SOC 2 Type II Certified</span>
                </div>
                <span className="text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mb-4">
                <Button onClick={() => navigate('/signup')}>
                  Revive Your First 50 Leads Free <ArrowRight className="inline w-5 h-5 ml-2" />
                </Button>
                <Button primary={false}>
                  Watch 2-Min Demo
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mb-2">
                No Credit Card Required
              </p>

              <p className="text-sm text-gray-400 text-center mb-8">
                Trusted by 50+ high-growth sales teams • Integrates with Salesforce, HubSpot, Outreach
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>10-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">15.2%</div>
                <div className="text-sm text-gray-400">Avg Meeting Rate</div>
                <div className="text-xs text-gray-500">vs. 6-8% industry</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">7-10x</div>
                <div className="text-sm text-gray-400">ROI</div>
                <div className="text-xs text-gray-500">Avg customer return</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">24hrs</div>
                <div className="text-sm text-gray-400">To first campaign</div>
                <div className="text-xs text-gray-500">From signup to live</div>
              </div>
            </div>

            <div className="bg-[#242938] rounded-2xl border border-gray-700 p-8 shadow-2xl">
              <div className="aspect-video bg-[#1A1F2E] rounded-xl overflow-hidden border border-gray-700">
                <img
                  src="/Gemini_Generated_Image_jkovk9jkovk9jkov.png"
                  alt="Rekindle Dashboard showing lead revival campaigns, meetings booked, and AI-powered insights"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE PROBLEM */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#1A1F2E] via-[#242938] to-[#1A1F2E]">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              eyebrow="THE PROBLEM"
              subtitle="You spent thousands acquiring 1,000 leads. 850 said 'not now' or ghosted. That's a massive, hidden liability of wasted spend just sitting there—and it represents millions in lost opportunity."
            >
              The £50,000 Problem Hiding in Your Pipeline
            </SectionTitle>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-2xl p-8 border-2 border-red-700/50">
                <div className="text-5xl font-bold text-red-400 mb-2">£5,000</div>
                <div className="text-lg font-semibold text-white mb-2">
                  You Spent on Acquisition
                </div>
                <div className="text-gray-400">
                  Initial investment
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-2xl p-8 border-2 border-orange-700/50">
                <div className="text-5xl font-bold text-orange-400 mb-2">850</div>
                <div className="text-lg font-semibold text-white mb-2">
                  Leads Went Dormant
                </div>
                <div className="text-gray-400">
                  Costly inaction
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-8 border-2 border-gray-600">
                <div className="text-5xl font-bold text-white mb-2">£50K+</div>
                <div className="text-lg font-semibold text-white mb-2">
                  Lost Revenue Potential
                </div>
                <div className="text-gray-400">
                  The prize you're missing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section className="relative py-20 px-4 bg-[#1F2430]" id="how-it-works">
          <div className="absolute inset-0 bg-[#FF6B35] opacity-5 blur-3xl"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <SectionTitle eyebrow="HOW REKINDLE WORKS" subtitle="We don't just send emails. We deploy a multi-channel, performance-based engine that only engages leads when the timing is perfect.">
              AI Does the Heavy Lifting. You Close the Revenue.
            </SectionTitle>

            <h3 className="text-2xl font-bold text-center mb-12 text-[#FF6B35]">
              The 4-Step Revenue Engine: Identify Intent, Personalize, Deploy, Pay-for-Result
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="bg-[#242938] rounded-2xl p-8 border border-gray-700 hover:border-[#FF6B35] transition-all">
                <div className="w-16 h-16 bg-[#FF6B35]/20 border border-[#FF6B35] rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <div className="text-sm font-bold text-[#FF6B35] mb-2">STEP 1</div>
                <h3 className="text-xl font-bold mb-3">Upload Your Coldest Leads</h3>
                <p className="text-gray-400 text-sm">
                  Secure sync via CRM (Salesforce, HubSpot) or simple CSV. Takes 2 minutes.
                </p>
              </div>

              <div className="bg-[#242938] rounded-2xl p-8 border border-gray-700 hover:border-[#FF6B35] transition-all">
                <div className="w-16 h-16 bg-[#FF6B35]/20 border border-[#FF6B35] rounded-full flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <div className="text-sm font-bold text-[#FF6B35] mb-2">STEP 2</div>
                <h3 className="text-xl font-bold mb-3">Intelligent Engine Pinpoints Buying Intent</h3>
                <p className="text-gray-400 text-sm">
                  AI analyzes thousands of data points—funding, hiring, job changes, news—to find the specific, urgent reason to re-engage them right now.
                </p>
              </div>

              <div className="bg-[#242938] rounded-2xl p-8 border border-gray-700 hover:border-[#FF6B35] transition-all">
                <div className="w-16 h-16 bg-[#FF6B35]/20 border border-[#FF6B35] rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <div className="text-sm font-bold text-[#FF6B35] mb-2">STEP 3</div>
                <h3 className="text-xl font-bold mb-3">Hyper-Personalized Outreach</h3>
                <p className="text-gray-400 text-sm">
                  Messages reference specific, timely events. Not a template, but a relevant, compelling reason for them to take the meeting.
                </p>
              </div>

              <div className="bg-[#242938] rounded-2xl p-8 border border-gray-700 hover:border-[#FF6B35] transition-all">
                <div className="w-16 h-16 bg-[#FF6B35]/20 border border-[#FF6B35] rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <div className="text-sm font-bold text-[#FF6B35] mb-2">STEP 4</div>
                <h3 className="text-xl font-bold mb-3">Revenue-Ready Meetings Booked</h3>
                <p className="text-gray-400 text-sm">
                  Lead replies → AI confirms the meeting → Meeting appears on your calendar → You pay only the performance fee.
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-4">
                Comparison: Outcome vs. Effort
              </h3>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Generic templates damage your domain reputation. AI-researched messages establish context and urgency.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-900/20 rounded-2xl p-8 border-2 border-red-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-6 h-6 text-red-400" />
                    <div className="font-bold text-red-400">Generic Template (2% Reply Rate)</div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Looks like a template. Low reply rate. Damages domain reputation.</p>
                  <div className="bg-[#242938] rounded-lg p-6 font-mono text-sm border border-gray-700">
                    <div className="text-gray-500 mb-2">Subject: Following up</div>
                    <div className="text-gray-300">
                      Hi Sarah,
                      <br /><br />
                      Just checking in on that project we discussed a few months ago.
                      Are you still interested?
                      <br /><br />
                      Let me know if you'd like to reconnect.
                      <br /><br />
                      Best,<br />
                      John
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-2xl p-8 border-2 border-green-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div className="font-bold text-green-400">Rekindle-Researched (15.2% Reply Rate)</div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">References specific news, shows urgency, establishes context. High reply rate.</p>
                  <div className="bg-[#242938] rounded-lg p-6 font-mono text-sm border border-gray-700">
                    <div className="text-gray-500 mb-2">Subject: Congrats on your Series B 🎉</div>
                    <div className="text-gray-300">
                      Hi Sarah,
                      <br /><br />
                      Just saw CloudSync raised a Series B—congrats! 🎉
                      <br /><br />
                      Also noticed you're hiring 5 marketing roles. That website redesign
                      project we discussed 6 months ago would be perfect timing now.
                      <br /><br />
                      Worth a 15-min chat?
                      <br /><br />
                      Best,<br />
                      John
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-400 font-semibold">
                    ✓ References recent news (Series B)<br />
                    ✓ Shows urgency (hiring = budget)<br />
                    ✓ Contextual timing (right moment)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: MULTI-CHANNEL */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#2A2F3E] to-[#2D3348]">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              eyebrow="MULTI-CHANNEL OUTREACH"
              subtitle="Intelligent, pre-built sequences across every channel until the lead responds or opts out. Maximize reach without risking your team's bandwidth."
            >
              One Lead, Five Channels. Zero Risk.
            </SectionTitle>

            <InteractiveChannelSelector
              channels={channels}
              activeChannel={activeChannel}
              setActiveChannel={setActiveChannel}
            />

            <div className="max-w-4xl mx-auto bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-center mb-8">
                Example 7-Day Sequence
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-gray-500">Day 0</div>
                  <div className="flex-1 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <Mail className="w-4 h-4 inline mr-2 text-blue-400" />
                    <span className="font-semibold">Email:</span> Initial personalized message
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-gray-500">Day 2</div>
                  <div className="flex-1 bg-green-900/30 border border-green-700 rounded-lg p-4">
                    <MessageSquare className="w-4 h-4 inline mr-2 text-green-400" />
                    <span className="font-semibold">SMS:</span> Quick follow-up
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-gray-500">Day 4</div>
                  <div className="flex-1 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <Mail className="w-4 h-4 inline mr-2 text-blue-400" />
                    <span className="font-semibold">Email:</span> Different angle (case study)
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-gray-500">Day 6</div>
                  <div className="flex-1 bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
                    <MessageCircle className="w-4 h-4 inline mr-2 text-emerald-400" />
                    <span className="font-semibold">WhatsApp:</span> Voice note
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-gray-500">Day 7</div>
                  <div className="flex-1 bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                    <Phone className="w-4 h-4 inline mr-2 text-orange-400" />
                    <span className="font-semibold">Voicemail:</span> Final touchpoint
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center text-sm text-gray-400">
                <strong className="text-[#FF6B35]">15.2% meeting booking rate</strong> vs. 6-8% industry
              </div>
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-3xl font-bold mb-4">Unrivaled Results</h3>
              <div className="bg-green-900/20 border border-green-700 rounded-xl p-8 inline-block">
                <div className="text-5xl font-bold text-[#FF6B35] mb-2">15.2%</div>
                <div className="text-lg text-gray-300">Meeting Booking Rate</div>
                <div className="text-sm text-gray-400">(Vs. industry 6-8%)</div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-center mb-8">Enterprise Control & Compliance</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-[#FF6B35]" />
                    <h4 className="font-bold">Flexibility</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    Build dynamic cadences that pause instantly when a hook is found.
                  </p>
                </div>
                <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-[#FF6B35]" />
                    <h4 className="font-bold">Compliance</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    Built-in GDPR and CAN-SPAM readiness. Automatic suppression list sync.
                  </p>
                </div>
                <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-[#FF6B35]" />
                    <h4 className="font-bold">Efficiency</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    One dashboard to manage all five channels, maximizing SDR efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PRICING */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#1A1F2E] to-[#1F2430]" id="pricing">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              eyebrow="PERFORMANCE PRICING"
              subtitle="The most risk-free pricing model in sales. No flat fees for 'seats' or 'contacts.' You only pay a small percentage of your average deal value, and only when a meeting is booked and confirmed."
            >
              Performance Pricing: If They Don't Convert, You Don't Pay.
            </SectionTitle>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#242938] rounded-2xl p-8 border-2 border-gray-700">
                <div className="text-lg font-bold mb-2">Starter</div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£19</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">
                  + <strong className="text-[#FF6B35]">3% of deal value</strong> per meeting
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Up to 5,000 leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>All 5 channels included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>AI research & scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500">Auto-ICP sourcing</span>
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-white text-[#1A1F2E] py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  Start Free Trial
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#FF6B35] to-[#F7931E] rounded-2xl p-8 border-2 border-[#FF6B35] transform scale-105 shadow-2xl">
                <div className="inline-block bg-white text-[#FF6B35] px-3 py-1 rounded-full text-xs font-bold mb-4">
                  MOST POPULAR
                </div>
                <div className="text-lg font-bold text-white mb-2">Pro</div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">£99</span>
                  <span className="text-orange-100">/month</span>
                </div>
                <div className="text-sm text-orange-100 mb-6">
                  + <strong className="text-white">2.5% of deal value</strong> per meeting
                </div>
                <ul className="space-y-3 mb-8 text-white text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Up to 25,000 leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>All 5 channels included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span><strong>Auto-ICP sourcing</strong> (100/mo)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>CRM integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>5 team seats</span>
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-white text-[#FF6B35] py-3 rounded-full font-semibold hover:bg-orange-50 transition"
                >
                  Start Free Trial
                </button>
              </div>

              <div className="bg-[#242938] rounded-2xl p-8 border-2 border-gray-700">
                <div className="text-lg font-bold mb-2">Enterprise</div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£499</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">
                  + <strong className="text-[#FF6B35]">2% of deal value</strong> per meeting
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Auto-ICP</strong> (1,000/mo)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>White-label option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>15 team seats</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-[#1A1F2E] py-3 rounded-full font-semibold hover:bg-gray-200 transition">
                  Contact Sales
                </button>
              </div>
            </div>

            <ROICalculator
              dealValue={dealValue}
              setDealValue={setDealValue}
              meetingsGoal={meetingsGoal}
              setMeetingsGoal={setMeetingsGoal}
              monthlyCost={monthlyCost}
              revenue={revenue}
              roi={roi}
              profit={profit}
            />

            <div className="mt-8 text-center">
              <p className="text-lg font-bold text-white mb-2">
                ROI: <span className="text-[#FF6B35]">{roi}x profit</span>
              </p>
              <p className="text-sm text-gray-400 max-w-3xl mx-auto">
                The Math is Simple: Rekindle is <strong className="text-[#FF6B35]">50-75% cheaper than agencies</strong> and delivers 2x the meeting rate. Your investment is tied directly to confirmed pipeline.
              </p>
            </div>

            <div className="mt-8 bg-[#1A1F2E] border border-gray-700 rounded-xl p-6 text-center max-w-4xl mx-auto">
              <p className="text-gray-300 mb-3">
                <strong className="text-white">Our platform is 100% focused on efficiency.</strong> If a lead doesn't respond to a hook, it's recycled for a new, future event—no wasted opportunities.
              </p>
              <p className="text-sm text-gray-400">
                You only pay when meetings are booked. No meetings = no cost beyond the £99 platform fee.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: AUTO-ICP */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-[#242938] to-[#2A2F3E]" id="auto-icp">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF6B35] opacity-10 blur-3xl rounded-full"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <SectionTitle
              eyebrow="AUTO-ICP ENGINE"
              subtitle="After achieving 25 meetings, our AI automatically analyzes the winning lead data to reverse-engineer your perfect Ideal Customer Profile (ICP), and instantly sources 100-1,000 fresh, verified leads that match."
            >
              Auto-ICP: The Engine That Finds Your Next Best Customer
            </SectionTitle>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="w-16 h-16 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">
                  AI Learns Your ICP
                </h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Analyzes which industries, sizes, and titles closed. Identifies patterns in your winning leads.
                </p>
                <div className="bg-[#242938] rounded-lg p-4 border border-gray-700 font-mono text-xs">
                  <div className="text-[#FF6B35] font-bold mb-2">ICP DETECTED:</div>
                  <div className="space-y-1 text-gray-400">
                    <div>• Industry: <strong className="text-white">B2B SaaS</strong></div>
                    <div>• Size: <strong className="text-white">10-50 employees</strong></div>
                    <div>• Titles: <strong className="text-white">VP Marketing</strong></div>
                    <div>• Region: <strong className="text-white">UK, Ireland</strong></div>
                    <div className="mt-2 text-green-400">✓ Confidence: <strong>87%</strong></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="w-16 h-16 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">
                  Sources & Verifies
                </h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Scraper finds and validates emails for high-score matches. Enriches with firmographics.
                </p>
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-2xl font-bold">987</div>
                      <div className="text-xs text-gray-400">Found</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">823</div>
                      <div className="text-xs text-gray-400">Verified</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#FF6B35]">642</div>
                      <div className="text-xs text-gray-400">High-score</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="w-16 h-16 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">
                  Auto-Queues for Campaign
                </h3>
                <p className="text-gray-400 mb-6 text-sm">
                  New leads automatically enter the revival sequence. AI generates personalized messages. Meetings book.
                </p>
                <div className="bg-[#242938] rounded-lg p-4 border border-gray-700">
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>642 leads queued</span>
                      <span className="font-semibold">Day 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>218 emails sent</span>
                      <span className="font-semibold">Day 2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>47 replies received</span>
                      <span className="font-semibold">Day 4</span>
                    </div>
                    <div className="flex justify-between text-[#FF6B35] font-bold">
                      <span>🎯 18 meetings booked</span>
                      <span>Day 7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 border border-gray-700">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💬</div>
                <div className="flex-1">
                  <blockquote className="text-xl italic mb-4 leading-relaxed text-gray-300">
                    "After reviving 40 leads, Rekindle found 200 MORE people just like them.
                    Booked 18 meetings from the sourced leads in the first month. This Auto-ICP
                    thing is insane—it's like having an AI SDR that actually works."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center font-bold text-xl">
                      S
                    </div>
                    <div>
                      <div className="font-bold">Sarah Chen</div>
                      <div className="text-sm text-gray-400">VP Sales, CloudSync</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">40</div>
                  <div className="text-sm text-gray-400">Dead leads revived</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">200</div>
                  <div className="text-sm text-gray-400">New leads sourced</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">18</div>
                  <div className="text-sm text-gray-400">Meetings from Auto-ICP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">£57K</div>
                  <div className="text-sm text-gray-400">Pipeline generated</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: BRAND CONTROL */}
        <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="max-w-7xl mx-auto">
            <SectionTitle
              eyebrow="YOUR BRAND. YOUR RULES."
              subtitle="We give you complete control over every message, every channel, and every lead. Your brand reputation is sacred—here's how we protect it."
            >
              You're Always in Control
            </SectionTitle>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <Shield className="w-16 h-16 text-[#FF6B35] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-center mb-4">
                  Approval Mode (ON by Default)
                </h3>
                <p className="text-gray-400 mb-6 text-center text-sm">
                  Every message is drafted by AI and sent to you for approval
                  <strong className="text-white"> before it goes out</strong>.
                </p>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Review every message in dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Edit AI copy before sending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Turn off after you trust the system</span>
                  </li>
                </ul>
                <div className="mt-6 bg-[#FF6B35]/20 border border-[#FF6B35]/50 rounded-lg p-4">
                  <p className="text-sm text-orange-200 text-center">
                    <strong className="text-white">90% turn this off after week 1</strong>
                    once they see the quality.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <Sliders className="w-16 h-16 text-[#FF6B35] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-center mb-4">
                  Toggle Any Channel On/Off
                </h3>
                <p className="text-gray-400 mb-6 text-center text-sm">
                  Don't want to use WhatsApp? Uncomfortable with voicemail drops?
                  Just toggle it off.
                </p>

                <div className="bg-[#1A1F2E] rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Email</span>
                    </div>
                    <div className="w-12 h-6 bg-[#FF6B35] rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">SMS</span>
                    </div>
                    <div className="w-12 h-6 bg-[#FF6B35] rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 font-medium">WhatsApp</span>
                    </div>
                    <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <ShieldCheck className="w-16 h-16 text-[#FF6B35] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-center mb-4">
                  Built-In Safety Guardrails
                </h3>
                <p className="text-gray-400 mb-6 text-center text-sm">
                  Automatic safeguards that prevent spam, respect opt-outs, and maintain your reputation.
                </p>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Auto Opt-Out Detection</strong>
                      <div className="text-xs text-gray-500 mt-1">
                        "Unsubscribe" → instantly removed
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Suppression List Sync</strong>
                      <div className="text-xs text-gray-500 mt-1">
                        Syncs with CRM "Do Not Contact"
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Rate Limiting</strong>
                      <div className="text-xs text-gray-500 mt-1">
                        Smart throttling protects domain
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Emergency Kill Switch</strong>
                      <div className="text-xs text-gray-500 mt-1">
                        Stop ALL campaigns instantly
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-4">
                  Your Brand. Your Data. Your Control.
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Messages send from <strong className="text-white">your team's email addresses</strong>
                  (not ours), so leads always see your brand. You can review, edit, or block any
                  message before it goes out. We're the co-pilot, you're the pilot.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>SOC 2 Type II Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Data Encrypted at Rest</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: COMPETITIVE COMPARISON */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#1A1F2E] to-[#242938]">
          <div className="max-w-7xl mx-auto">
            <SectionTitle eyebrow="ALTERNATIVES: THE SIMPLE CHOICE">
              You Have Three Costly Options. Or One Smart, Risk-Free One.
            </SectionTitle>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#242938] rounded-2xl p-6 border border-gray-700">
                <div className="text-center mb-4">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold">Manual Revival</h3>
                  <div className="text-sm text-gray-500">The Old Way</div>
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-bold">40+ hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost/Meeting:</span>
                    <span className="font-bold">£80-120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meeting Rate:</span>
                    <span className="font-bold text-red-400">2-3%</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Takes weeks</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Generic templates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#242938] rounded-2xl p-6 border border-gray-700">
                <div className="text-center mb-4">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold">Hire an SDR</h3>
                  <div className="text-sm text-gray-500">The Expensive Way</div>
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly:</span>
                    <span className="font-bold">£4K-6K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ramp Up:</span>
                    <span className="font-bold">3-6 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meeting Rate:</span>
                    <span className="font-bold text-orange-400">5-8%</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>£50K+ annual cost</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Turnover risk</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#242938] rounded-2xl p-6 border border-gray-700">
                <div className="text-center mb-4">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold">Lead Agency</h3>
                  <div className="text-sm text-gray-500">The Overpriced Way</div>
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Setup Fee:</span>
                    <span className="font-bold">£2K-5K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost/Meeting:</span>
                    <span className="font-bold">£50-200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meeting Rate:</span>
                    <span className="font-bold text-orange-400">8-12%</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Agency markup</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Long contracts</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#FF6B35] to-[#F7931E] rounded-2xl p-6 border-2 border-[#FF6B35] transform scale-105 shadow-2xl">
                <div className="text-center mb-4">
                  <img
                    src="/images/image copy copy.png"
                    alt="Rekindle.ai"
                    className="h-14 w-auto mx-auto mb-3"
                  />
                  <h3 className="text-xl font-bold text-white">Rekindle</h3>
                  <div className="text-sm text-orange-100">The Smart Way ⭐</div>
                </div>
                <div className="space-y-2 mb-6 text-sm text-white">
                  <div className="flex justify-between">
                    <span className="text-orange-100">Base:</span>
                    <span className="font-bold">£19-499</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-100">Cost/Meeting:</span>
                    <span className="font-bold">£15-150*</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-100">Meeting Rate:</span>
                    <span className="font-bold">15.2%</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-white">
                  <li className="flex items-start gap-1">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Only pay for meetings</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>AI research every lead</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>5 channels included</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>48-hour setup</span>
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-white text-[#FF6B35] py-3 rounded-full font-bold mt-4 hover:bg-orange-50 transition"
                >
                  Start Free Trial <ArrowRight className="inline w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mt-16 bg-[#FF6B35]/20 border border-[#FF6B35] rounded-2xl p-8">
              <div className="text-center">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-2xl font-bold mb-4">
                  The Math is Simple
                </h3>
                <p className="text-lg text-gray-300 mb-6">
                  Agencies charge £50-200 per meeting. SDRs cost £4,000-6,000/month.
                  Rekindle costs <strong className="text-white">2-3% of your deal value per meeting</strong>
                  (typically £15-150) with a low monthly base.
                </p>
                <div className="text-xl font-bold text-[#FF6B35]">
                  50-75% cheaper. 2x the meeting rate. You only pay for results.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: SOCIAL PROOF */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-[#2A2F3E] to-[#2D3348]">
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#FF6B35] opacity-10 blur-3xl rounded-full"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <SectionTitle eyebrow="TRUSTED BY GROWTH TEAMS">
              Real Results from Real Businesses
            </SectionTitle>

            <div className="grid md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">300+</div>
                <div className="text-gray-400">Active customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">12,500+</div>
                <div className="text-gray-400">Meetings booked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">£2.4M+</div>
                <div className="text-gray-400">Pipeline generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B35] mb-2">15.2%</div>
                <div className="text-gray-400">Avg meeting rate</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic text-sm">
                  "Revived 87 dead leads in the first month. Booked 13 meetings. Cost us £825.
                  Those 13 meetings generated £58K in pipeline. 70x ROI."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <div className="font-bold">Marcus Williams</div>
                    <div className="text-sm text-gray-400">Founder, TechFlow</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic text-sm">
                  "The Auto-ICP feature is insane. After 25 meetings, it found 200 MORE leads
                  exactly like our best customers. We're never running out of pipeline again."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-bold">Sarah Chen</div>
                    <div className="text-sm text-gray-400">VP Sales, CloudSync</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic text-sm">
                  "We had 5,000 cold leads rotting in HubSpot. Rekindle revived them and booked
                  78 meetings in 60 days. Best ROI of any tool we've tried."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div>
                    <div className="font-bold">James Rodriguez</div>
                    <div className="text-sm text-gray-400">Head of Growth, PayFlow</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: FINAL CTA */}
        <section className="py-24 px-4 bg-gradient-to-br from-[#FF6B35] to-[#F7931E]">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Stop Letting £50,000 Rot in Your CRM
            </h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              You spent thousands acquiring those leads. They're ready to buy now—they just need
              the right message at the right time. Let AI handle it.
            </p>

            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 mb-8 inline-block">
              <p className="text-lg font-bold">
                Claim Your 14-Day Free Revival Scan
              </p>
              <p className="text-sm text-orange-100">
                No credit card required • Cancel anytime
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-[#FF6B35] px-10 py-5 rounded-full text-lg font-bold hover:bg-orange-50 transition-all shadow-2xl hover:scale-105"
              >
                Revive Your First 50 Leads Free <ArrowRight className="inline w-5 h-5 ml-2" />
              </button>
              <button className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
                Watch 2-Min Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-orange-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>50 leads free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>10-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#1A1F2E] border-t border-gray-800 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/images/image copy copy.png"
                alt="Rekindle.ai"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              AI-powered lead revival for B2B sales teams. Only pay when they book meetings.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="text-gray-400 hover:text-[#FF6B35]">How It Works</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-[#FF6B35]">Pricing</a></li>
              <li><a href="#auto-icp" className="text-gray-400 hover:text-[#FF6B35]">Auto-ICP</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Customers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Careers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">GDPR</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35]">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © 2025 Rekindle. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
