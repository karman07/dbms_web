import React, { useState, useEffect } from 'react';
import { Users, BookOpen, UserCheck, Award,  RefreshCw } from 'lucide-react';
import { userAPI, courseAPI } from '../utils/api';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  accentColor: string;
  iconBg: string;
  loading?: boolean;
}> = ({ title, value, change, changeType, icon, accentColor, iconBg, loading }) => {
  const changeColor = changeType === 'positive' ? 'text-emerald-600' :
                     changeType === 'negative' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-t-2 ${accentColor}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
            {loading ? (
              <div className="h-7 bg-gray-100 rounded animate-pulse mb-2 w-16" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            )}
            <p className={`text-xs font-medium ${changeColor}`}>{change}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      console.log('Fetching dashboard data...');
      
      const [usersData, courseData] = await Promise.all([
        userAPI.getAllUsers().catch((err) => {
          console.error('Users error:', err);
          return [];
        }),
        courseAPI.getCourse().catch((err) => {
          console.error('Course error:', err);
          return null;
        })
      ]);
      
      console.log('Fetched data:', { usersData, courseData });
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats from real data
  const totalUsers = users.length;
  const verifiedUsers = users.filter(user => user.isEmailVerified).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const enrolledCount = course?.enrolledCount || 0;

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="text-xs text-gray-400 bg-white px-3 py-2 rounded-lg border border-gray-200">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          change="Real-time data"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          accentColor="border-t-blue-500"
          iconBg="bg-blue-50"
          loading={loading}
        />
        <StatCard
          title="Verified Users"
          value={verifiedUsers}
          change={`${totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}% verified`}
          changeType="positive"
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          accentColor="border-t-emerald-500"
          iconBg="bg-emerald-50"
          loading={loading}
        />
        <StatCard
          title="Admin Users"
          value={adminUsers}
          change="System administrators"
          changeType="neutral"
          icon={<Award className="w-5 h-5 text-violet-600" />}
          accentColor="border-t-violet-500"
          iconBg="bg-violet-50"
          loading={loading}
        />
        <StatCard
          title="Course Enrolled"
          value={enrolledCount}
          change="Total enrollments"
          changeType="positive"
          icon={<BookOpen className="w-5 h-5 text-orange-600" />}
          accentColor="border-t-orange-500"
          iconBg="bg-orange-50"
          loading={loading}
        />
      </div>

      {/* Course Information */}
      {course && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Course Information</h3>
            <p className="text-sm text-gray-500 mt-0.5">Current course details and statistics</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.sections?.length || 0} sections
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrolled Students:</span>
                  <span className="font-semibold">{course.enrolledCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sections:</span>
                  <span className="font-semibold">{course.sections?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Lessons:</span>
                  <span className="font-semibold">
                    {course.sections?.reduce((total: number, section: any) => 
                      total + (section.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tags:</span>
                  <span className="font-semibold">{course.tags?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Users</h3>
          <p className="text-sm text-gray-500 mt-0.5">Latest registered users in the system</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : users.length > 0 ? (
              users.slice(0, 5).map((user, index) => (
                <div key={user._id || index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-600">
                      {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                      {user.isEmailVerified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No users found</p>
                <p className="text-gray-400 text-sm mt-1">Users will appear here when they register</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;