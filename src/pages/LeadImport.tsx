import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ParsedLead {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  notes?: string;
}

export function LeadImport() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setSuccess(false);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        setErrors(['CSV file is empty']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const requiredFields = ['first_name', 'last_name', 'email'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));

      if (missingFields.length > 0) {
        setErrors([`Missing required columns: ${missingFields.join(', ')}`]);
        return;
      }

      const leads: ParsedLead[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        if (values.length !== headers.length) {
          parseErrors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const lead: any = {};
        headers.forEach((header, index) => {
          lead[header] = values[index];
        });

        if (!lead.email || !lead.email.includes('@')) {
          parseErrors.push(`Line ${i + 1}: Invalid email address`);
          continue;
        }

        leads.push({
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          job_title: lead.job_title,
          notes: lead.notes,
        });
      }

      if (leads.length === 0) {
        setErrors(['No valid leads found in CSV file', ...parseErrors]);
        return;
      }

      setParsedLeads(leads);
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setErrors(['Failed to parse CSV file. Please ensure it is properly formatted.']);
    }
  };

  const handleImport = async () => {
    if (!user || parsedLeads.length === 0) return;

    setUploading(true);
    setErrors([]);

    try {
      const leadsToInsert = parsedLeads.map(lead => ({
        ...lead,
        user_id: user.id,
        status: 'new',
        lead_score: 50,
        source: 'csv_import',
      }));

      const { error } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (error) throw error;

      setSuccess(true);
      setParsedLeads([]);

      setTimeout(() => {
        navigate('/leads');
      }, 2000);
    } catch (error: any) {
      console.error('Error importing leads:', error);
      setErrors([error.message || 'Failed to import leads']);
    } finally {
      setUploading(false);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const downloadTemplate = () => {
    const template = 'first_name,last_name,email,phone,company,job_title,notes\nJohn,Doe,john@example.com,555-0100,Acme Corp,CEO,Important lead\nJane,Smith,jane@example.com,555-0101,Tech Inc,CTO,Met at conference';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="leads" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/leads')}
            className="text-[#FF6B35] hover:text-[#F7931E] mb-4 inline-flex items-center gap-2"
          >
            ← Back to Leads
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
          <p className="text-gray-600 mt-2">
            Upload a CSV file to import your dormant leads
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Import successful!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your leads have been imported. Redirecting to leads page...
              </p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Import errors</h3>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors([])}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">CSV Format</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your CSV file must include these required columns: <strong>first_name</strong>, <strong>last_name</strong>, and <strong>email</strong>
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Optional columns:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• phone</li>
                <li>• company</li>
                <li>• job_title</li>
                <li>• notes</li>
              </ul>
            </div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#FF6B35] border border-[#FF6B35] rounded-lg hover:bg-orange-50 transition"
            >
              <FileText className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={uploading}
            />
            <label
              htmlFor="csv-upload"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold rounded-lg transition cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              <Upload className="w-5 h-5" />
              Choose File
            </label>
          </div>
        </div>

        {parsedLeads.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Preview ({parsedLeads.length} leads)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Review your leads before importing
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setParsedLeads([]);
                    setErrors([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    `Import ${parsedLeads.length} Leads`
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedLeads.slice(0, 10).map((lead, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lead.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lead.company || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lead.job_title || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedLeads.length > 10 && (
                <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600 text-center">
                  Showing first 10 of {parsedLeads.length} leads
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
