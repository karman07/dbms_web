import { motion } from "framer-motion";
import { Loader, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Typewriter } from "@/components/Typewriter";
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

interface DocsReadingViewProps {
  selectedTopic: Topic | null;
  selectedSubtopic: Subtopic | null;
  filteredTopics: Topic[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedTopic: (topic: Topic) => void;
  fetchSubtopicContent: (topicId: string, subtopicName: string) => void;
}

export const DocsReadingView = ({
  selectedTopic,
  selectedSubtopic,
  filteredTopics,
  loading,
  searchQuery,
  setSearchQuery,
  setSelectedTopic,
  fetchSubtopicContent,
}: DocsReadingViewProps) => {
  if (selectedSubtopic) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 leading-tight ${GRADIENTS.gradientTitle}`}>
            <Typewriter 
              text={selectedSubtopic.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
              speed={50} 
              delay={200} 
            />
          </h1>
          <div className={`h-1.5 w-40 ${GRADIENTS.gradientPrimary} rounded-full shadow-lg`} />
        </motion.div>
        <div className="max-w-none">
          {selectedSubtopic.content ? (
            <MarkdownRenderer content={selectedSubtopic.content} />
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 leading-tight ${GRADIENTS.gradientTitle}`}>
            <Typewriter text={selectedTopic.topic} speed={50} delay={200} />
          </h1>
          <div className={`h-1.5 w-40 ${GRADIENTS.gradientPrimary} rounded-full shadow-lg mb-3`} />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">{selectedTopic.subtopics?.length || 0} chapters available</p>
        </motion.div>
        <div className="grid gap-4">
          {selectedTopic.subtopics.map((subtopic, idx) => (
            <motion.div
              key={subtopic._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => fetchSubtopicContent(selectedTopic._id, subtopic.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subtopic.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {subtopic.filename}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
                  View →
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documentation...</span>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Documentation Library</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore our comprehensive database management documentation
            </p>
          </div>
          <div className="grid gap-6">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`${GRADIENTS.gradientAccent} rounded-lg p-4 group-hover:scale-110 transition-transform`}>
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {topic.topic}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          Course: {topic.course.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredTopics.length === 0 && !loading && (
            <div className="text-center py-16">
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Documentation Found</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'No documentation topics are available yet'}
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
