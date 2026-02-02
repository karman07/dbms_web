import React from 'react';
import { TrendingUp, Users, BookOpen, Clock, Download } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from '../components/ui/button';

const AnalyticsPage: React.FC = () => {
  // Mock data for charts
  const userActivityData = [
    { date: '2024-01-01', activeUsers: 45, newUsers: 12, sessions: 89 },
    { date: '2024-01-02', activeUsers: 52, newUsers: 8, sessions: 95 },
    { date: '2024-01-03', activeUsers: 48, newUsers: 15, sessions: 87 },
    { date: '2024-01-04', activeUsers: 61, newUsers: 18, sessions: 112 },
    { date: '2024-01-05', activeUsers: 55, newUsers: 10, sessions: 98 },
    { date: '2024-01-06', activeUsers: 67, newUsers: 22, sessions: 125 },
    { date: '2024-01-07', activeUsers: 73, newUsers: 16, sessions: 134 }
  ];

  const courseProgressData = [
    { section: 'Intro', completed: 89, inProgress: 12, notStarted: 5 },
    { section: 'HTML/CSS', completed: 76, inProgress: 18, notStarted: 12 },
    { section: 'JavaScript', completed: 58, inProgress: 25, notStarted: 23 },
    { section: 'React', completed: 42, inProgress: 28, notStarted: 36 },
    { section: 'Backend', completed: 28, inProgress: 22, notStarted: 56 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#3b82f6' },
    { name: 'Mobile', value: 28, color: '#10b981' },
    { name: 'Tablet', value: 7, color: '#f59e0b' }
  ];

  const engagementData = [
    { week: 'Week 1', videoViews: 245, notesCreated: 89, quizCompleted: 67 },
    { week: 'Week 2', videoViews: 289, notesCreated: 102, quizCompleted: 78 },
    { week: 'Week 3', videoViews: 312, notesCreated: 95, quizCompleted: 85 },
    { week: 'Week 4', videoViews: 298, notesCreated: 108, quizCompleted: 92 }
  ];

  const timeSpentData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 4.1 },
    { day: 'Fri', hours: 3.6 },
    { day: 'Sat', hours: 5.2 },
    { day: 'Sun', hours: 4.8 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into user behavior and course performance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,247</p>
              <p className="text-sm text-green-600 mt-1">+12.5% from last week</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">24m 32s</p>
              <p className="text-sm text-green-600 mt-1">+8.2% from last week</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Course Completion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">68.5%</p>
              <p className="text-sm text-green-600 mt-1">+5.1% from last week</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">892</p>
              <p className="text-sm text-green-600 mt-1">+15.3% from last week</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={userActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="activeUsers" 
              stackId="1"
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Active Users"
            />
            <Area 
              type="monotone" 
              dataKey="newUsers" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="New Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Course Progress and Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Section Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseProgressData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="section" type="category" stroke="#6b7280" width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
              <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
              <Bar dataKey="notStarted" stackId="a" fill="#ef4444" name="Not Started" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Metrics</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="videoViews" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              name="Video Views"
            />
            <Line 
              type="monotone" 
              dataKey="notesCreated" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              name="Notes Created"
            />
            <Line 
              type="monotone" 
              dataKey="quizCompleted" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
              name="Quiz Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time Spent Analysis */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Daily Time Spent</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeSpentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} hours`, 'Time Spent']}
            />
            <Bar 
              dataKey="hours" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <h4 className="text-lg font-semibold mb-2">Top Performing Section</h4>
          <p className="text-2xl font-bold">Introduction</p>
          <p className="text-blue-100 mt-1">89% completion rate</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <h4 className="text-lg font-semibold mb-2">Peak Activity Day</h4>
          <p className="text-2xl font-bold">Saturday</p>
          <p className="text-green-100 mt-1">5.2 hours average</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <h4 className="text-lg font-semibold mb-2">Most Used Device</h4>
          <p className="text-2xl font-bold">Desktop</p>
          <p className="text-purple-100 mt-1">65% of all sessions</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;