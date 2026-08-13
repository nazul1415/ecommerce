import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVUploader } from '../components/CSVUploader';
import { ImportReport } from '../components/ImportReport';
import { importCSV } from '../services/productService';
import type { ImportResult } from '../types';
import { ArrowLeft, RefreshCw, DatabaseBackup, Info } from 'lucide-react';

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setReport(null);

    try {
      const response = await importCSV(file);
      setReport(response.data);
    } catch (err: any) {
      // Safely capture backend error details
      const errorMessage = err.response?.data?.message || err.message || 'Network error while attempting to upload the file.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <DatabaseBackup className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-gray-900 text-lg">Bulk Upload</span>
              </div>
            </div>
            
            {report && (
              <div className="flex items-center">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1.5 px-3.5 py-2 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-semibold text-indigo-700 transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Upload another CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Informative Instructions Banner */}
        {!report && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
            <div className="flex space-x-3">
              <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-gray-950">Import Instructions</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  To update the catalog in bulk, please upload a structured file in <strong className="text-gray-800">CSV</strong> format. The system will process each record, validating mandatory fields such as <strong className="text-gray-800">SKU</strong> and <strong className="text-gray-800">Name</strong>. Valid entries will be imported, while rows with inconsistencies will be skipped and listed in the detailed report below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Error Message */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3 max-w-2xl mx-auto shadow-sm">
            <div className="p-1 bg-rose-500 text-white rounded-full">
              <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">Error processing import</h4>
              <p className="text-sm text-rose-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Box or Report Render */}
        <div className="flex justify-center">
          {!report ? (
            <CSVUploader onFileSelect={handleFileSelect} isUploading={isUploading} />
          ) : (
            <ImportReport report={report} />
          )}
        </div>

      </main>
    </div>
  );
};

export default ImportPage;
