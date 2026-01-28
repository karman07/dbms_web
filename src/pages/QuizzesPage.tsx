import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, Clock, Star, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const QuizzesPage = () => {
  const navigate = useNavigate();

  const quizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      course: "JavaScript Basics",
      questions: 15,
      duration: "20 min",
      difficulty: "Beginner",
      score: null,
      status: "available",
      attempts: 0
    },
    {
      id: 2,
      title: "React Hooks Assessment",
      course: "React Advanced",
      questions: 20,
      duration: "30 min",
      difficulty: "Intermediate",
      score: 85,
      status: "completed",
      attempts: 1
    },
    {
      id: 3,
      title: "Database Design Quiz",
      course: "Database Systems",
      questions: 12,
      duration: "15 min",
      difficulty: "Advanced",
      score: null,
      status: "locked",
      attempts: 0
    },
    {
      id: 4,
      title: "CSS Grid & Flexbox",
      course: "CSS Mastery",
      questions: 18,
      duration: "25 min",
      difficulty: "Intermediate",
      score: 92,
      status: "completed",
      attempts: 2
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-teal-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all ${
                quiz.status === 'locked' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-2 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  {quiz.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {quiz.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {quiz.course}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>{quiz.questions} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration}</span>
                </div>
              </div>

              {quiz.score !== null && (
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Best Score:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">{quiz.score}%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Attempts: {quiz.attempts}
                </span>
                {quiz.status === 'locked' && (
                  <span className="text-xs text-red-500">Complete previous quizzes to unlock</span>
                )}
              </div>

              <Button 
                disabled={quiz.status === 'locked'}
                className={`w-full ${
                  quiz.status === 'locked' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                } text-white`}
              >
                {quiz.status === 'locked' ? (
                  'Locked'
                ) : quiz.status === 'completed' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;