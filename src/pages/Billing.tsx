import { Navigation } from '../components/Navigation';
import { CreditCard, Check, Zap } from 'lucide-react';

export function Billing() {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const plans = [
    {
      name: 'Starter',
      monthlyBase: 19,
      perMeetingRate: '3%',
      perMeetingMin: 5,
      perMeetingMax: 50,
      leadLimit: '5K',
      aiSourcing: false,
      features: [
        'Up to 5,000 leads',
        'Email + SMS outreach',
        'AI research & personalization',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      monthlyBase: 99,
      perMeetingRate: '2.5%',
      perMeetingMin: 8,
      perMeetingMax: 150,
      leadLimit: '25K',
      aiSourcing: true,
      aiSourcingIncluded: '100 leads/mo',
      features: [
        'Up to 25,000 leads',
        'All channels (Email, SMS, LinkedIn)',
        'AI research & personalization',
        'Auto-ICP analysis',
        'AI lead sourcing (100 leads/mo)',
        'Advanced analytics',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyBase: 499,
      perMeetingRate: '2%',
      perMeetingMin: 10,
      perMeetingMax: 200,
      leadLimit: 'Unlimited',
      aiSourcing: true,
      aiSourcingIncluded: '1,000 leads/mo',
      features: [
        'Unlimited leads',
        'All channels + WhatsApp',
        'AI research & personalization',
        'Auto-ICP analysis',
        'AI lead sourcing (1,000 leads/mo)',
        'White-label option',
        'Dedicated infrastructure',
        'Custom integrations',
        'Dedicated support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="billing" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Pay based on results. Low monthly base, we win when you win.
          </p>
        </div>

        {/* Pricing Info */}
        <div className="max-w-3xl mx-auto mb-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How Pricing Works</h3>
          <p className="text-sm text-blue-800">
            You pay a low monthly base fee plus a percentage of your average deal value per meeting booked.
            For example, if your average deal is $5,000 and you're on the Pro plan (2.5%), you'll pay $125 per meeting booked.
            Our pricing is capped to ensure fairness at all deal sizes.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-[#FF6B35]' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white text-center py-2 font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.monthlyBase}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    + {plan.perMeetingRate} per meeting (${plan.perMeetingMin}-${plan.perMeetingMax})
                  </p>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700">Lead Limit:</span>
                    <span className="text-gray-900">{plan.leadLimit}</span>
                  </div>
                  {plan.aiSourcing && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <Zap className="w-4 h-4 text-[#FF6B35]" />
                      <span className="font-semibold text-gray-700">AI Sourcing:</span>
                      <span className="text-gray-900">{plan.aiSourcingIncluded}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Current Plan (Mock) */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan</h2>

            <div className="bg-gradient-to-br from-[#FF6B35] to-[#F7931E] text-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
                  <p className="text-white/90">Active until you choose a plan</p>
                </div>
                <CreditCard className="w-12 h-12 text-white/50" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/80 text-sm">Leads Used</p>
                  <p className="text-2xl font-bold">0 / 100</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Messages Sent</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Meetings Booked</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Start by importing leads and creating your first campaign
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
