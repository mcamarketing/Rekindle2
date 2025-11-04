import { useState, useRef, DragEvent } from 'react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  FileSpreadsheet,
  ArrowRight,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface ParsedLead {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  notes?: string;
  _rowNumber?: number;
  _isValid?: boolean;
  _errors?: string[];
}

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
}

export function LeadImport() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLead = (lead: ParsedLead, rowNumber: number): ParsedLead => {
    const leadErrors: string[] = [];

    if (!lead.first_name || lead.first_name.trim() === '') {
      leadErrors.push('First name is required');
    }
    if (!lead.last_name || lead.last_name.trim() === '') {
      leadErrors.push('Last name is required');
    }
    if (!lead.email || lead.email.trim() === '') {
      leadErrors.push('Email is required');
    } else if (!validateEmail(lead.email)) {
      leadErrors.push('Invalid email format');
    }

    return {
      ...lead,
      _rowNumber: rowNumber,
      _isValid: leadErrors.length === 0,
      _errors: leadErrors,
    };
  };

  const parseCSV = (text: string): ParsedLead[] => {
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const requiredFields = ['first_name', 'last_name', 'email'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    const leads: ParsedLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

      if (values.length !== headers.length) {
        continue;
      }

      const lead: any = {};
      headers.forEach((header, index) => {
        lead[header] = values[index] || '';
      });

      const validatedLead = validateLead(
        {
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          email: lead.email || '',
          phone: lead.phone,
          company: lead.company,
          job_title: lead.job_title,
          notes: lead.notes,
        },
        i
      );

      leads.push(validatedLead);
    }

    return leads;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setErrors([]);
    setSuccess(false);
    setParsing(true);

    try {
      const text = await file.text();
      const leads = parseCSV(text);

      if (leads.length === 0) {
        setErrors(['No valid leads found in CSV file']);
        setParsedLeads([]);
      } else {
        setParsedLeads(leads);
        const invalidCount = leads.filter(l => !l._isValid).length;
        if (invalidCount > 0) {
          setErrors([`${invalidCount} row(s) have validation errors and will be skipped`]);
        }
      }
    } catch (error: any) {
      console.error('Error parsing CSV:', error);
      setErrors([error.message || 'Failed to parse CSV file. Please ensure it is properly formatted.']);
      setParsedLeads([]);
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      await handleFileSelect(file);
    } else {
      setErrors(['Please upload a valid CSV file']);
    }
  };

  const handleImport = async () => {
    if (!user || parsedLeads.length === 0) return;

    const validLeads = parsedLeads.filter(lead => lead._isValid);
    if (validLeads.length === 0) {
      setErrors(['No valid leads to import']);
      return;
    }

    setUploading(true);
    setErrors([]);

    const progress: ImportProgress = {
      total: validLeads.length,
      processed: 0,
      successful: 0,
      failed: 0,
    };

    setImportProgress(progress);

    try {
      const batchSize = 50;
      for (let i = 0; i < validLeads.length; i += batchSize) {
        const batch = validLeads.slice(i, i + batchSize);

        const leadsToInsert = batch.map(lead => {
          const { _rowNumber, _isValid, _errors, ...cleanLead } = lead;
          return {
            ...cleanLead,
            user_id: user.id,
            status: 'new',
            lead_score: 50,
            source: 'csv_import',
          };
        });

        const { error, data } = await supabase
          .from('leads')
          .insert(leadsToInsert)
          .select();

        if (error) {
          progress.failed += batch.length;
          console.error('Batch import error:', error);
        } else {
          progress.successful += data?.length || batch.length;
        }

        progress.processed += batch.length;
        setImportProgress({ ...progress });
      }

      if (progress.successful > 0) {
        setSuccess(true);
        setParsedLeads([]);
        setFileName('');

        setTimeout(() => {
          navigate('/leads');
        }, 2000);
      } else {
        setErrors(['Failed to import leads. Please check your data and try again.']);
      }
    } catch (error: any) {
      console.error('Error importing leads:', error);
      setErrors([error.message || 'Failed to import leads']);
    } finally {
      setUploading(false);
      setTimeout(() => setImportProgress(null), 3000);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const downloadTemplate = () => {
    const template =
      'first_name,last_name,email,phone,company,job_title,notes\nJohn,Doe,john.doe@example.com,555-0100,Acme Corp,CEO,Important lead from Q4 conference\nJane,Smith,jane.smith@techstart.com,555-0101,TechStart Inc,CTO,Met at AWS Summit 2024';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekindle_leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validLeadsCount = parsedLeads.filter(l => l._isValid).length;
  const invalidLeadsCount = parsedLeads.filter(l => !l._isValid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
      <Navigation currentPage="leads" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="font-medium">Back to Leads</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">Import Leads</h1>
          <p className="text-lg text-gray-600">
            Upload your CSV file to import leads into your Rekindle account
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-success-50 border-2 border-success-200 rounded-xl p-6 mb-8 shadow-lg animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-success-100 rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-success-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-success-900 text-xl mb-1">Import Successful!</h3>
                <p className="text-success-700 text-base">
                  {importProgress?.successful || 0} leads have been imported successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-error-50 border-2 border-error-200 rounded-xl p-6 mb-8 shadow-lg animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-error-100 rounded-xl">
                <AlertCircle className="w-7 h-7 text-error-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-error-900 text-xl mb-2">Import Errors</h3>
                <ul className="text-error-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-error-500 font-bold">\u2022</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors([])}
                className="p-2 text-error-600 hover:text-error-700 hover:bg-error-100 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {importProgress && (
          <div className="bg-white border-2 border-primary-200 rounded-xl p-8 mb-8 shadow-lg animate-scale-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-gray-900">Importing Leads...</span>
                <span className="text-lg font-bold text-primary-600">
                  {importProgress.processed} / {importProgress.total}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-success-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success-600" />
                <div>
                  <p className="text-xs font-semibold text-success-600 uppercase">Successful</p>
                  <p className="text-2xl font-bold text-success-700">{importProgress.successful}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-error-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-error-600" />
                <div>
                  <p className="text-xs font-semibold text-error-600 uppercase">Failed</p>
                  <p className="text-2xl font-bold text-error-700">{importProgress.failed}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Instructions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-8 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">CSV Format</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                    Required Columns
                  </h3>
                  <div className="space-y-2">
                    {['first_name', 'last_name', 'email'].map(field => (
                      <div key={field} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success-600" />
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs text-gray-800">
                          {field}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                    Optional Columns
                  </h3>
                  <div className="space-y-2">
                    {['phone', 'company', 'job_title', 'notes'].map(field => (
                      <div key={field} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 flex items-center justify-center">\u2022</span>
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                          {field}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-primary-600 border-2 border-primary-500 rounded-xl hover:bg-primary-50 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Panel */}
          <div className="lg:col-span-2">
            {parsedLeads.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div
                  className={`relative border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                    disabled={uploading || parsing}
                  />

                  {parsing ? (
                    <LoadingSpinner size="lg" text="Parsing CSV file..." />
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="inline-flex p-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl mb-4">
                          <Upload className="w-16 h-16 text-primary-600" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {dragActive ? 'Drop your file here' : 'Upload CSV File'}
                      </h3>

                      <p className="text-base text-gray-600 mb-8 max-w-md mx-auto">
                        Drag and drop your CSV file here, or click the button below to browse
                      </p>

                      <label
                        htmlFor="csv-upload"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-brand hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      >
                        <FileText className="w-6 h-6" />
                        Choose File
                      </label>

                      <p className="text-sm text-gray-500 mt-6">
                        Supported format: CSV (comma-separated values)
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden animate-slide-up">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Preview & Validate</h2>
                      <p className="text-primary-100">
                        Review your data before importing
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{parsedLeads.length}</div>
                      <div className="text-sm text-primary-100">Total Rows</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3 p-4 bg-success-50 rounded-lg border-2 border-success-200">
                    <CheckCircle2 className="w-8 h-8 text-success-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-success-600 uppercase tracking-wide">Valid Leads</p>
                      <p className="text-3xl font-bold text-success-700">{validLeadsCount}</p>
                    </div>
                  </div>

                  {invalidLeadsCount > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg border-2 border-warning-200">
                      <AlertTriangle className="w-8 h-8 text-warning-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-warning-600 uppercase tracking-wide">Invalid Rows</p>
                        <p className="text-3xl font-bold text-warning-700">{invalidLeadsCount}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedLeads.slice(0, 20).map((lead, index) => (
                        <tr
                          key={index}
                          className={`transition-colors duration-150 ${
                            !lead._isValid ? 'bg-error-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lead._rowNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{lead.job_title || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {lead.company || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead._isValid ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-100 text-success-700 text-xs font-bold rounded-full border border-success-200">
                                <Check className="w-3 h-3" />
                                Valid
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error-100 text-error-700 text-xs font-bold rounded-full border border-error-200">
                                  <AlertCircle className="w-3 h-3" />
                                  Invalid
                                </span>
                                {lead._errors && lead._errors.length > 0 && (
                                  <div className="text-xs text-error-600">
                                    {lead._errors.join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedLeads.length > 20 && (
                  <div className="px-8 py-4 bg-gray-50 border-t-2 border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                      Showing first 20 of {parsedLeads.length} rows
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 p-8 bg-gray-50 border-t-2 border-gray-200">
                  <button
                    onClick={() => {
                      setParsedLeads([]);
                      setErrors([]);
                      setFileName('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold text-base rounded-xl hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-100"
                    disabled={uploading}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleImport}
                    className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-brand hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary-100"
                    disabled={uploading || validLeadsCount === 0}
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Import {validLeadsCount} {validLeadsCount === 1 ? 'Lead' : 'Leads'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
