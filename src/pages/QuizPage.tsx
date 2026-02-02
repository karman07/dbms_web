import { useState, useEffect } from 'react';
import { courseAPI } from '@/utils/api';
import QuizManager from '@/components/course/QuizManager';
import { Search } from 'lucide-react';

const QuizPage = () => {
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
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Quizzes</h1>
        <p className="text-gray-600 mt-1">Create and manage quizzes for your course. Use the search box to find quizzes quickly.</p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title..."
            className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <QuizManager lessonOptions={lessonOptions} />
      </div>
    </div>
  );
};

export default QuizPage;
