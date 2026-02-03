import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, Loader2, Calendar, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import activitiesService, { ClassActivity } from "@/services/activities.service";
import courseService from "@/services/course.service";
import { useNotification } from "@/contexts/NotificationContext";
import CourseMarkdownRenderer from "@/components/CourseMarkdownRenderer";

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [activities, setActivities] = useState<ClassActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ClassActivity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonMap, setLessonMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const activitiesData = await activitiesService.getAllActivities();
      
      // Get unique lesson IDs from activities
      const lessonIds = [...new Set(activitiesData.filter(a => a.lessonId).map(a => a.lessonId!))];
      
      // Fetch lesson details for each ID
      const lessonTitleMap: Record<string, string> = {};
      await Promise.all(
        lessonIds.map(async (lessonId) => {
          try {
            const lesson = await courseService.getLessonById(lessonId);
            lessonTitleMap[lessonId] = lesson.title;
          } catch (error) {
            console.error(`Failed to fetch lesson ${lessonId}:`, error);
          }
        })
      );
      
      setLessonMap(lessonTitleMap);
      setActivities(activitiesData);
    } catch (error: any) {
      notification.error('Failed to load activities', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    
    const query = searchQuery.toLowerCase();
    return activities.filter(activity => 
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query) ||
      activity.content.toLowerCase().includes(query)
    );
  }, [activities, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (selectedActivity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedActivity(null)}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Activities
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedActivity.title}
                    </h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {selectedActivity.description}
                  </p>
                  {selectedActivity.lessonId && lessonMap[selectedActivity.lessonId] && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                        <BookOpen className="h-4 w-4" />
                        {lessonMap[selectedActivity.lessonId]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{selectedActivity.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedActivity.createdAt)}</span>
                </div>
                {selectedActivity.lessonId && lessonMap[selectedActivity.lessonId] && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{lessonMap[selectedActivity.lessonId]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <CourseMarkdownRenderer content={selectedActivity.content} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Activities</h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Found {filteredActivities.length} of {activities.length} activities
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredActivities.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Linked to Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredActivities.filter(a => a.lessonId).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredActivities.reduce((sum, a) => sum + a.duration, 0)} min
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No activities found matching your search' : 'No activities available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setSelectedActivity(activity)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
                    </div>
                    {/* {activity.lessonId && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                        {lessonMap[activity.lessonId] || 'Lesson Activity'}
                      </span>
                    )} */}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {activity.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{activity.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;