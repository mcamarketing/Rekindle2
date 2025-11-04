import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { RippleButton } from '../components/RippleButton';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail, Users, Calendar, Send, ArrowRight, CheckCircle2,
  Sparkles, Wand2, Copy, Check, Loader2
} from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
}

interface Message {
  id: string;
  content: string;
  sequenceNumber: number;
}

export function CreateCampaign() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [messageTone, setMessageTone] = useState<'professional' | 'casual' | 'friendly'>('professional');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

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
      showToast({
        type: 'error',
        title: 'Failed to load leads',
        message: 'Please try again',
      });
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
    showToast({
      type: 'success',
      title: 'All leads selected',
      message: `${leads.length} leads added to campaign`,
    });
  };

  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  const generateAIMessage = async () => {
    if (selectedLeads.length === 0) {
      showToast({
        type: 'warning',
        title: 'No leads selected',
        message: 'Please select at least one lead first',
      });
      return;
    }

    setGeneratingMessage(true);
    try {
      const firstLead = leads.find(l => l.id === selectedLeads[0]);

      const response = await apiClient.generateMessage({
        leadName: `${firstLead?.first_name} ${firstLead?.last_name}`,
        company: firstLead?.company || undefined,
        tone: messageTone,
        context: campaignData.description,
      });

      if (response.success && response.data) {
        setGeneratedMessage(response.data.message || 'Hey there! Just wanted to reach out and see if you\'re interested in reconnecting...');
        showToast({
          type: 'success',
          title: 'Message generated',
          message: 'AI created a personalized message for your campaign',
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      setGeneratedMessage('Hey there! Just wanted to reach out and see if you\'re interested in reconnecting. Would love to catch up and discuss how we can help your business grow.');
      showToast({
        type: 'info',
        title: 'Using default message',
        message: 'Backend unavailable - showing example message',
      });
    } finally {
      setGeneratingMessage(false);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMessage(true);
    showToast({
      type: 'success',
      title: 'Copied to clipboard',
    });
    setTimeout(() => setCopiedMessage(false), 2000);
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

      setShowConfetti(true);
      showToast({
        type: 'success',
        title: 'Campaign created successfully!',
        message: `Your campaign "${campaignData.name}" is ready to launch`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      showToast({
        type: 'error',
        title: 'Failed to create campaign',
        message: error.message || 'Please try again',
      });
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
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#FF6B35] hover:text-[#F7931E] mb-4 inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-2">
            Set up a new lead revival campaign
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Campaign Details', icon: Mail },
              { num: 2, title: 'Select Leads', icon: Users },
              { num: 3, title: 'Review & Launch', icon: Send },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step >= s.num
                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium mt-2 transition-colors ${
                    step >= s.num ? 'text-[#FF6B35]' : 'text-gray-600'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 rounded transition-all duration-500 ${
                      step > s.num ? 'bg-[#FF6B35]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div key={step} className="bg-white rounded-lg shadow p-8 mb-6 animate-slide-in">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
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
                  <RippleButton
                    variant="outline"
                    size="sm"
                    onClick={selectAllLeads}
                  >
                    Select All
                  </RippleButton>
                  <RippleButton
                    variant="secondary"
                    size="sm"
                    onClick={deselectAllLeads}
                  >
                    Deselect All
                  </RippleButton>
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
                    className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-0 transition-colors ${
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

              <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">AI Message Generator</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Let AI create personalized messages for your campaign
                    </p>

                    <div className="flex gap-2 mb-4">
                      {(['professional', 'casual', 'friendly'] as const).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setMessageTone(tone)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            messageTone === tone
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </button>
                      ))}
                    </div>

                    <RippleButton
                      variant="primary"
                      size="sm"
                      onClick={generateAIMessage}
                      disabled={generatingMessage || selectedLeads.length === 0}
                    >
                      {generatingMessage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Message
                        </>
                      )}
                    </RippleButton>

                    {generatedMessage && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-fade-in">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-700">Generated Message:</p>
                          <button
                            onClick={copyMessage}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {copiedMessage ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 italic">{generatedMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
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
                    <div className="text-center hover:scale-105 transition-transform">
                      <p className="text-sm font-medium text-gray-600">Leads</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{selectedLeads.length}</p>
                    </div>
                    <div className="text-center hover:scale-105 transition-transform">
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{campaignData.total_messages}</p>
                    </div>
                    <div className="text-center hover:scale-105 transition-transform">
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

        <div className="flex justify-between">
          <RippleButton
            variant="secondary"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </RippleButton>

          {step < 3 ? (
            <RippleButton
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed() || loading}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </RippleButton>
          ) : (
            <RippleButton
              variant="primary"
              onClick={handleCreateCampaign}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </RippleButton>
          )}
        </div>
      </main>
    </div>
  );
}
