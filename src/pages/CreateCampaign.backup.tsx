import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Users, Calendar, Send, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
}

export function CreateCampaign() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    total_messages: 5,
    days_between_messages: 3,
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, company')
        .in('status', ['new', 'contacted', 'unresponsive'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeads(leads.map(l => l.id));
  };

  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  const handleCreateCampaign = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          user_id: user.id,
          status: 'draft',
          total_leads: selectedLeads.length,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const campaignLeads = selectedLeads.map(leadId => ({
        campaign_id: campaign.id,
        lead_id: leadId,
        status: 'pending',
      }));

      const { error: leadsError } = await supabase
        .from('campaign_leads')
        .insert(campaignLeads);

      if (leadsError) throw leadsError;

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return campaignData.name.trim().length > 0;
      case 2:
        return selectedLeads.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="campaigns" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#FF6B35] hover:text-[#F7931E] mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-2">
            Set up a new lead revival campaign
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Campaign Details', icon: Mail },
              { num: 2, title: 'Select Leads', icon: Users },
              { num: 3, title: 'Review & Launch', icon: Send },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step >= s.num
                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium mt-2 ${
                    step >= s.num ? 'text-[#FF6B35]' : 'text-gray-600'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-24 h-1 mx-4 ${
                    step > s.num ? 'bg-[#FF6B35]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    placeholder="e.g., Q1 Lead Revival"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                    placeholder="Optional campaign description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Messages
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={campaignData.total_messages}
                      onChange={(e) => setCampaignData({ ...campaignData, total_messages: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of follow-up messages (1-10)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days Between Messages
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={campaignData.days_between_messages}
                      onChange={(e) => setCampaignData({ ...campaignData, days_between_messages: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Delay between each message (1-14 days)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Select Leads</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose which leads to include in this campaign
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllLeads}
                    className="px-4 py-2 text-sm text-[#FF6B35] border border-[#FF6B35] rounded-lg hover:bg-orange-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllLeads}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>{selectedLeads.length}</strong> leads selected
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => toggleLeadSelection(lead.id)}
                    className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-0 ${
                      selectedLeads.includes(lead.id) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-[#FF6B35] rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                    </div>
                    {lead.company && (
                      <div className="text-sm text-gray-500">{lead.company}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Launch</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Campaign Name</p>
                    <p className="text-lg font-semibold text-gray-900">{campaignData.name}</p>
                  </div>

                  {campaignData.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="text-gray-900">{campaignData.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Leads</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{selectedLeads.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{campaignData.total_messages}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Frequency</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{campaignData.days_between_messages}d</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Note:</strong> Your campaign will be created as a draft. You can review and activate it from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed() || loading}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleCreateCampaign}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
