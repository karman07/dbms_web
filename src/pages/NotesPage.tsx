import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Plus, Search, Filter, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const notes = [
    {
      id: 1,
      title: "React Hooks Best Practices",
      content: "Key points about using React hooks effectively in modern applications...",
      category: "React",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-16",
      starred: true,
      tags: ["react", "hooks", "best-practices"]
    },
    {
      id: 2,
      title: "API Design Patterns",
      content: "Important patterns for designing RESTful APIs and GraphQL schemas...",
      category: "Backend",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-14",
      starred: false,
      tags: ["api", "rest", "graphql"]
    },
    {
      id: 3,
      title: "CSS Grid Layout Guide",
      content: "Comprehensive guide to CSS Grid layout with practical examples...",
      category: "CSS",
      createdAt: "2024-01-13",
      updatedAt: "2024-01-15",
      starred: true,
      tags: ["css", "grid", "layout"]
    },
    {
      id: 4,
      title: "Database Optimization Tips",
      content: "Performance optimization techniques for SQL databases...",
      category: "Database",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-12",
      starred: false,
      tags: ["database", "sql", "performance"]
    }
  ];

  const categories = [
    { name: "All Notes", count: notes.length, color: "bg-gray-500" },
    { name: "React", count: 1, color: "bg-blue-500" },
    { name: "Backend", count: 1, color: "bg-green-500" },
    { name: "CSS", count: 1, color: "bg-purple-500" },
    { name: "Database", count: 1, color: "bg-orange-500" }
  ];

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <FileText className="w-6 h-6 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                      <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Starred Notes
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Tags
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Notes Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        note.category === 'React' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        note.category === 'Backend' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        note.category === 'CSS' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {note.category}
                      </span>
                      {note.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {note.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Created: {note.createdAt}</span>
                    <span>Updated: {note.updatedAt}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No notes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first note to get started'}
                </p>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;