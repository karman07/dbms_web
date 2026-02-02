import React, { useState, useEffect } from 'react';
import { Download, FileText, Users, BookOpen, Calendar, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
// Note: Export APIs not fully implemented yet

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    downloads: 0,
    thisMonth: 0,
    scheduled: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd have specific endpoints for reports
        // For now, we'll simulate the data structure
        const mockReports = [
          {
            id: 1,
            title: 'User Activity Report',
            description: 'Detailed user engagement and activity metrics',
            type: 'User Data',
            lastGenerated: new Date().toISOString(),
            size: '2.4 MB',
            icon: Users,
            color: 'bg-blue-100 text-blue-600'
          },
          {
            id: 2,
            title: 'Course Progress Report',
            description: 'Student progress and completion statistics',
            type: 'Course Data',
            lastGenerated: new Date(Date.now() - 86400000).toISOString(),
            size: '1.8 MB',
            icon: BookOpen,
            color: 'bg-green-100 text-green-600'
          },
          {
            id: 3,
            title: 'Monthly Analytics',
            description: 'Comprehensive monthly performance overview',
            type: 'Analytics',
            lastGenerated: new Date(Date.now() - 172800000).toISOString(),
            size: '3.2 MB',
            icon: Calendar,
            color: 'bg-purple-100 text-purple-600'
          },
          {
            id: 4,
            title: 'System Usage Report',
            description: 'Server performance and resource utilization',
            type: 'System',
            lastGenerated: new Date(Date.now() - 259200000).toISOString(),
            size: '1.1 MB',
            icon: FileText,
            color: 'bg-orange-100 text-orange-600'
          }
        ];

        setReports(mockReports);
        setStats({
          totalReports: mockReports.length,
          downloads: 156,
          thisMonth: 8,
          scheduled: 3
        });

        setRecentDownloads([
          { name: 'User Activity Report', type: 'CSV', date: new Date().toISOString(), size: '2.4 MB' },
          { name: 'Course Progress Report', type: 'PDF', date: new Date(Date.now() - 86400000).toISOString(), size: '1.8 MB' },
          { name: 'Monthly Analytics', type: 'Excel', date: new Date(Date.now() - 172800000).toISOString(), size: '3.2 MB' },
          { name: 'System Usage Report', type: 'CSV', date: new Date(Date.now() - 259200000).toISOString(), size: '1.1 MB' }
        ]);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateReport = async (reportId: number) => {
    try {
      // In a real app, this would call the appropriate API endpoint
      console.log('Generating report:', reportId);
      // You could call adminAPI.generateReport(reportId) here
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (reportId: number) => {
    try {
      // Export APIs not fully implemented yet
      alert(`Download feature for report ${reportId} not implemented yet`);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download comprehensive system reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Create Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-xl font-bold text-gray-900">{stats.downloads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Filter className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${report.color}`}>
                      <report.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Type: {report.type}</span>
                  <span>Size: {report.size}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      Generate
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Downloads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Report</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Downloaded</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Size</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentDownloads.map((download, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{download.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {download.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(download.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{download.size}</td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;