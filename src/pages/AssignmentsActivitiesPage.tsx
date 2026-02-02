import { useState, useEffect } from 'react';
import { courseAPI } from '@/utils/api';
import AssignmentManager from '@/components/course/AssignmentManager';
import ClassActivityManager from '@/components/course/ClassActivityManager';
import { FileText, Activity, Search } from 'lucide-react';

const AssignmentsActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'activities'>('assignments');
  const [lessonOptions, setLessonOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('');

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      const courseData = await courseAPI.getCourse();
      
      // Build lesson options
      const lessons: Array<{ value: string; label: string }> = [];
      courseData.sections.forEach((section: any) => {
        section.lessons.forEach((lesson: any) => {
          lessons.push({
            value: lesson._id,
            label: `${section.title} - ${lesson.title}`,
          });
        });
      });
      setLessonOptions(lessons);
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Assignments & Class Activities</h1>
        <p className="text-gray-600 mt-1">Create, link and manage assignments and interactive class activities.</p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, activities..."
              className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedLessonFilter}
            onChange={(e) => setSelectedLessonFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">All Lessons</option>
            {lessonOptions.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Showing: <span className="font-medium text-gray-700">{activeTab === 'assignments' ? 'Assignments' : 'Activities'}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        {/* Tab Navigation */}
        <div className="border-b border-gray-100 mb-6">
          <nav className="flex gap-2" aria-label="Tabs">
            <button
              className={`flex items-center gap-2 px-5 py-3 font-medium border-b-2 transition-all ${
                activeTab === 'assignments'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText className="h-5 w-5" />
              <span>Assignments</span>
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-3 font-medium border-b-2 transition-all ${
                activeTab === 'activities'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('activities')}
            >
              <Activity className="h-5 w-5" />
              <span>Class Activities</span>
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'assignments' && (
            <AssignmentManager lessonOptions={lessonOptions} />
          )}
          {activeTab === 'activities' && (
            <ClassActivityManager lessonOptions={lessonOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsActivitiesPage;
