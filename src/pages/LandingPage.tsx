import { ArrowRight, Sparkles, BarChart3, Mail, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] via-[#F7931E] to-[#FF6B35]">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">Rekindle</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            You spent £5,000 acquiring those leads. They went cold. What if they're ready now?
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            AI that automatically revives your dead leads from 3-12 months ago. Score, write, send, and track — all for £0.02 per lead.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
          >
            Revive Your First 50 Leads Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/80 mt-4 text-sm">No credit card required</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
            <BarChart3 className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI Scoring</h3>
            <p className="text-white/90">
              Analyzes every lead and scores revivability from 0-100. Focus on High-priority leads first.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
            <Mail className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Smart Messages</h3>
            <p className="text-white/90">
              Generates personalized, empathetic messages that acknowledge the time gap naturally.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
            <CheckCircle2 className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Auto-Track</h3>
            <p className="text-white/90">
              Monitors replies in real-time and notifies you instantly when leads respond.
            </p>
          </div>
        </div>

        <div className="mt-32 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">The Problem</h2>
          <p className="text-xl text-white/90 mb-8">
            Every business has 100-500 dormant leads worth £20K-100K sitting in spreadsheets. You spent £2-5 acquiring each one, but never followed up because it felt awkward or you didn't know what to say.
          </p>
          <p className="text-2xl font-bold">
            Relationships don't expire. They just go quiet.
          </p>
        </div>

        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">£19<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Up to 5K leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Email + SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">AI research</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-xl p-8 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-4">£99<span className="text-lg text-white/80">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
                  <span className="text-white">Up to 25K leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
                  <span className="text-white">All channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
                  <span className="text-white">Auto-ICP + sourcing</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">£499<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Unlimited leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">White-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Dedicated infra</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-12 mt-32">
        <div className="text-center text-white/80">
          <p>&copy; 2025 Rekindle. Relationships don't expire. They just go quiet.</p>
        </div>
      </footer>
    </div>
  );
}
