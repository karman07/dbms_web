import React from 'react';
import { Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemPage: React.FC = () => {
  // Mock system data
  const systemMetrics = [
    { time: '00:00', cpu: 45, memory: 62, disk: 78 },
    { time: '04:00', cpu: 38, memory: 58, disk: 78 },
    { time: '08:00', cpu: 72, memory: 75, disk: 79 },
    { time: '12:00', cpu: 85, memory: 82, disk: 80 },
    { time: '16:00', cpu: 68, memory: 71, disk: 81 },
    { time: '20:00', cpu: 52, memory: 65, disk: 82 },
    { time: '24:00', cpu: 41, memory: 59, disk: 82 }
  ];

  const services = [
    { name: 'Web Server', status: 'running', uptime: '15 days', cpu: '12%', memory: '256 MB' },
    { name: 'Database', status: 'running', uptime: '15 days', cpu: '8%', memory: '512 MB' },
    { name: 'File Storage', status: 'running', uptime: '15 days', cpu: '3%', memory: '128 MB' },
    { name: 'Email Service', status: 'warning', uptime: '2 hours', cpu: '15%', memory: '64 MB' },
    { name: 'Backup Service', status: 'running', uptime: '15 days', cpu: '2%', memory: '32 MB' }
  ];

  const logs = [
    { time: '2024-01-29 14:30:25', level: 'INFO', message: 'User authentication successful', service: 'Auth Service' },
    { time: '2024-01-29 14:28:15', level: 'WARN', message: 'High memory usage detected', service: 'System Monitor' },
    { time: '2024-01-29 14:25:10', level: 'INFO', message: 'Database backup completed', service: 'Backup Service' },
    { time: '2024-01-29 14:20:05', level: 'ERROR', message: 'Failed to send email notification', service: 'Email Service' },
    { time: '2024-01-29 14:15:30', level: 'INFO', message: 'New user registration', service: 'User Service' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitor</h1>
          <p className="text-gray-600 mt-1">Monitor system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">68%</p>
              <p className="text-sm text-yellow-600 mt-1">Moderate load</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">71%</p>
              <p className="text-sm text-green-600 mt-1">Normal</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">82%</p>
              <p className="text-sm text-red-600 mt-1">High usage</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
              <p className="text-sm text-green-600 mt-1">All connections stable</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance (24h)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={systemMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="CPU"
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Memory"
            />
            <Line 
              type="monotone" 
              dataKey="disk" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Disk"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Services Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Service</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Uptime</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">CPU</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Memory</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {service.status === 'running' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'running' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{service.uptime}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{service.cpu}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{service.memory}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Logs</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  log.level === 'ERROR' ? 'bg-red-100' :
                  log.level === 'WARN' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    log.level === 'ERROR' ? 'bg-red-500' :
                    log.level === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-900">{log.service}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPage;