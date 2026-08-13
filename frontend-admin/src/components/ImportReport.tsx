import React from 'react';
import type { ImportResult } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ListFilter } from 'lucide-react';

interface ImportReportProps {
  report: ImportResult;
}

export const ImportReport: React.FC<ImportReportProps> = ({ report }) => {
  const { imported_count, failed_count, errors = [] } = report;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center justify-center space-x-2">
          <ListFilter className="h-5 w-5 text-indigo-600" />
          <span>Import Summary</span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">Results from the latest catalog load</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Success - Green */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">Products Imported</span>
            <div className="text-3xl font-extrabold text-emerald-900">{imported_count}</div>
            <span className="text-xs text-emerald-700/80">Successfully processed and saved</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-full">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        {/* Failed - Red */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-rose-800 uppercase">Failed Records</span>
            <div className="text-3xl font-extrabold text-rose-900">{failed_count}</div>
            <span className="text-xs text-rose-700/80">Skipped due to inconsistencies</span>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-600 rounded-full">
            <XCircle className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Error Details Table */}
      {failed_count > 0 && errors.length > 0 && (
        <div className="border border-rose-100 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-red-50/50 border-b border-rose-100 flex items-center space-x-2.5">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Inconsistency Details</h4>
              <p className="text-xs text-gray-500 mt-0.5">Errors were detected in the following CSV rows:</p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider w-24">
                    Row
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider w-40">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Failure Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 font-medium">
                {errors.map((error, index) => (
                  <tr key={index} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">
                      #{error.line}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-800">
                      {error.sku && error.sku.trim() !== '' ? error.sku : (
                        <span className="text-gray-400 italic font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-red-700 font-normal">
                      {error.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right text-xs text-gray-400">
            Showing {errors.length} detected errors
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportReport;
