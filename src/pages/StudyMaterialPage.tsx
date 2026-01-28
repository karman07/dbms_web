import { motion } from "framer-motion";
import { ArrowLeft, BookMarked, Download, Eye, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StudyMaterialPage = () => {
  const navigate = useNavigate();

  const materials = [
    {
      id: 1,
      title: "React Complete Guide 2024",
      type: "PDF",
      size: "15.2 MB",
      pages: 245,
      rating: 4.8,
      downloads: 1250,
      category: "Frontend",
      description: "Comprehensive guide covering React fundamentals to advanced concepts"
    },
    {
      id: 2,
      title: "JavaScript ES6+ Cheat Sheet",
      type: "PDF",
      size: "2.1 MB",
      pages: 12,
      rating: 4.9,
      downloads: 2100,
      category: "JavaScript",
      description: "Quick reference for modern JavaScript features and syntax"
    },
    {
      id: 3,
      title: "Database Design Principles",
      type: "PDF",
      size: "8.7 MB",
      pages: 156,
      rating: 4.7,
      downloads: 890,
      category: "Database",
      description: "Learn database normalization, indexing, and optimization techniques"
    },
    {
      id: 4,
      title: "Node.js Best Practices",
      type: "PDF",
      size: "5.4 MB",
      pages: 89,
      rating: 4.6,
      downloads: 650,
      category: "Backend",
      description: "Production-ready Node.js development patterns and practices"
    },
    {
      id: 5,
      title: "CSS Grid & Flexbox Mastery",
      type: "PDF",
      size: "3.8 MB",
      pages: 67,
      rating: 4.8,
      downloads: 1450,
      category: "CSS",
      description: "Master modern CSS layout techniques with practical examples"
    },
    {
      id: 6,
      title: "API Design Guidelines",
      type: "PDF",
      size: "4.2 MB",
      pages: 78,
      rating: 4.5,
      downloads: 720,
      category: "Backend",
      description: "RESTful API design principles and GraphQL fundamentals"
    }
  ];

  const categories = [
    { name: "All", count: materials.length },
    { name: "Frontend", count: 2 },
    { name: "Backend", count: 2 },
    { name: "JavaScript", count: 1 },
    { name: "Database", count: 1 },
    { name: "CSS", count: 1 }
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
              <BookMarked className="w-6 h-6 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Material</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Materials Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
                        <BookMarked className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          material.category === 'Frontend' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          material.category === 'Backend' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          material.category === 'JavaScript' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          material.category === 'Database' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                        }`}>
                          {material.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {material.type}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {material.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {material.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{material.pages} pages</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{material.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs">{material.size}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {material.downloads} downloads
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialPage;