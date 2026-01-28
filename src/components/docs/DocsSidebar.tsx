import { Button } from "@/components/ui/button";
import { Database, X, Search, ChevronRight, FileText } from "lucide-react";
import { GRADIENTS } from "@/constants";

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

interface DocsSidebarProps {
  topics: Topic[];
  filteredTopics: Topic[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTopic: Topic | null;
  selectedSubtopic: Subtopic | null;
  setSelectedTopic: (topic: Topic) => void;
  fetchSubtopicContent: (topicId: string, subtopicName: string) => void;
}

export const DocsSidebar = ({
  topics,
  filteredTopics,
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  selectedTopic,
  selectedSubtopic,
  setSelectedTopic,
  fetchSubtopicContent,
}: DocsSidebarProps) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${GRADIENTS.gradientPrimary} rounded-lg flex items-center justify-center`}>
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Documentation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{topics.length} topics</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
        <X className="w-5 h-5" />
      </Button>
    </div>
    <div className="overflow-y-auto h-full pb-20">
      <div className="p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
        <nav className="space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Topics & Subtopics</h3>
          </div>
          {filteredTopics.map((topic) => (
            <div key={topic._id} className="space-y-1">
              <button
                onClick={() => {
                  setSelectedTopic(topic);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3 text-sm rounded-lg transition-all ${
                  selectedTopic?._id === topic._id
                    ? `${GRADIENTS.gradientPrimary} text-white shadow-sm`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{topic.topic}</div>
                    <div className="text-xs opacity-75">{topic.subtopics.length} subtopics</div>
                  </div>
                  {selectedTopic?._id === topic._id && <ChevronRight className="w-4 h-4" />}
                </div>
              </button>
              
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                {topic.subtopics.map((subtopic) => (
                  <button
                    key={subtopic._id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      fetchSubtopicContent(topic._id, subtopic.name);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all block ${
                      selectedSubtopic?._id === subtopic._id
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{subtopic.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  </div>
);
