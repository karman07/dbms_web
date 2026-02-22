import { useState, useEffect } from 'react';
import { courseAPI } from '@/utils/api';
import AssignmentManager from '@/components/course/AssignmentManager';
import ClassActivityManager from '@/components/course/ClassActivityManager';
import { FileText, Activity, Search } from 'lucide-react';

const AssignmentsActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'activities'>('assignments');
  const [lessonOptions, setLessonOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Assignments & Activities</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Create and manage curriculum-linked assessments and interactive tasks.</p>
      </header>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Search & Tabs Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <nav className="flex gap-2" aria-label="Tabs">
            <button
              className={`flex items-center gap-2 px-6 py-4 font-black transition-all rounded-t-2xl text-sm uppercase tracking-widest ${activeTab === 'assignments'
                ? 'bg-white text-blue-600 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                }`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText className="h-4 w-4" />
              <span>Assignments</span>
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-4 font-black transition-all rounded-t-2xl text-sm uppercase tracking-widest ${activeTab === 'activities'
                ? 'bg-white text-blue-600 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                }`}
              onClick={() => setActiveTab('activities')}
            >
              <Activity className="h-4 w-4" />
              <span>Class Activities</span>
            </button>
          </nav>

          <div className="relative w-full md:max-w-xs mb-[-1px] pb-6 md:pb-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-3 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'assignments' && (
            <AssignmentManager lessonOptions={lessonOptions} searchQuery={searchQuery} />
          )}
          {activeTab === 'activities' && (
            <ClassActivityManager lessonOptions={lessonOptions} searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsActivitiesPage;
