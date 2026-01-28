import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AssignmentsPage = () => {
  const navigate = useNavigate();

  const assignments = [
    {
      id: 1,
      title: "React Component Design",
      course: "React Fundamentals",
      dueDate: "2024-01-20",
      status: "pending",
      progress: 60,
      description: "Create a reusable component library with proper documentation"
    },
    {
      id: 2,
      title: "Database Schema Design",
      course: "Database Systems",
      dueDate: "2024-01-18",
      status: "submitted",
      progress: 100,
      description: "Design a normalized database schema for an e-commerce platform"
    },
    {
      id: 3,
      title: "API Development Project",
      course: "Backend Development",
      dueDate: "2024-01-25",
      status: "pending",
      progress: 30,
      description: "Build a RESTful API with authentication and CRUD operations"
    }
  ];

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
              <ClipboardList className="w-6 h-6 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  assignment.status === 'submitted' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {assignment.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {assignment.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {assignment.course}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {assignment.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {assignment.dueDate}</span>
                </div>
                {assignment.status === 'submitted' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

              {assignment.status === 'pending' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-white font-medium">{assignment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                      style={{ width: `${assignment.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button 
                className={`w-full ${
                  assignment.status === 'submitted' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                } text-white`}
              >
                {assignment.status === 'submitted' ? 'View Submission' : 'Continue Working'}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;