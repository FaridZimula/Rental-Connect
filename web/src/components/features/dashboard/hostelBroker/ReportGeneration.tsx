import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportFilters {
  startDate: string;
  endDate: string;
  reportType: 'all' | 'bookings' | 'owners' | 'revenue';
  format: 'pdf' | 'excel';
}

const ReportGeneration: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    reportType: 'all',
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement report generation logic
      // 1. Fetch data based on filters
      // 2. Format data according to report type
      // 3. Generate PDF/Excel using a library like jsPDF or xlsx
      // 4. Trigger download
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Generate Reports</h2>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <FileText className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Report Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => setFilters({ ...filters, reportType: e.target.value as ReportFilters['reportType'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  >
                    <option value="all">All Data</option>
                    <option value="bookings">Bookings</option>
                    <option value="owners">Hostel Owners</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Format</label>
                  <select
                    value={filters.format}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value as ReportFilters['format'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">
                    {filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report
                  </span>
                </div>
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {filters.startDate} - {filters.endDate}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                This report will include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {filters.reportType === 'all' && (
                    <>
                      <li>All hostel owner accounts</li>
                      <li>All booking transactions</li>
                      <li>Revenue summaries</li>
                      <li>System statistics</li>
                    </>
                  )}
                  {filters.reportType === 'bookings' && (
                    <>
                      <li>Booking details and status</li>
                      <li>Payment information</li>
                      <li>Booking trends</li>
                    </>
                  )}
                  {filters.reportType === 'owners' && (
                    <>
                      <li>Hostel owner profiles</li>
                      <li>Hostel listings</li>
                      <li>Owner activity metrics</li>
                    </>
                  )}
                  {filters.reportType === 'revenue' && (
                    <>
                      <li>Revenue by hostel</li>
                      <li>Commission calculations</li>
                      <li>Payment history</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration; 