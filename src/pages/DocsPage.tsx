import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, Menu, Sun, Moon, BookOpenText, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsReadingView } from "@/components/docs/DocsReadingView";
import { DocsSlidesView } from "@/components/docs/DocsSlidesView";

interface Subtopic {
  _id: string;
  name: string;
  filename: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  _id: string;
  topic: string;
  course: string;
  subtopics: Subtopic[];
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'reading' | 'slides';

const DocsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('reading');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/docs/topics`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load documentation topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtopicContent = async (topicId: string, subtopicName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/docs/topic/${topicId}/subtopic/${encodeURIComponent(subtopicName)}`);
      if (!response.ok) throw new Error('Failed to fetch subtopic content');
      const data = await response.json();
      setSelectedSubtopic(data);
      setError(null);
    } catch (err) {
      setError('Failed to load subtopic content');
      console.error('Error fetching subtopic content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter(topic =>
    topic.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtopics.some(subtopic => 
      subtopic.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className="lg:flex lg:h-screen">
        {/* Sidebar */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <DocsSidebar
            topics={topics}
            filteredTopics={filteredTopics}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedSubtopic}
            setSelectedTopic={setSelectedTopic}
            fetchSubtopicContent={fetchSubtopicContent}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* View Mode Toggle */}
                  {selectedSubtopic && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'reading' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('reading')}
                        className="flex items-center space-x-2"
                      >
                        <BookOpenText className="w-4 h-4" />
                        <span className="hidden sm:inline">Reading</span>
                      </Button>
                      <Button
                        variant={viewMode === 'slides' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('slides')}
                        className="flex items-center space-x-2"
                      >
                        <Presentation className="w-4 h-4" />
                        <span className="hidden sm:inline">Slides</span>
                      </Button>
                    </div>
                  )}
                  
                  {/* Theme Toggle */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleTheme}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className={`lg:h-[calc(100vh-80px)] lg:overflow-y-auto ${viewMode === 'slides' ? '' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
            <motion.div
              key={selectedTopic?._id || selectedSubtopic?._id || 'home'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={viewMode === 'slides' ? '' : 'max-w-4xl'}
            >
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {viewMode === 'reading' ? (
                <DocsReadingView
                  selectedTopic={selectedTopic}
                  selectedSubtopic={selectedSubtopic}
                  filteredTopics={filteredTopics}
                  loading={loading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setSelectedTopic={setSelectedTopic}
                  fetchSubtopicContent={fetchSubtopicContent}
                />
              ) : (
                <DocsSlidesView selectedSubtopic={selectedSubtopic} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
