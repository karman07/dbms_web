# CoursePage - Tabbed Interface Implementation

## Instructions

Replace the lesson view section (starting after the video iframe and ending before navigation buttons) with the following tabbed interface code:

```tsx
              {/* Lesson Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'content'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Content
                      </div>
                    </button>
                    
                    {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                      <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                          activeTab === 'resources'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileDown className="h-4 w-4" />
                          Resources
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                            {selectedLesson.resources.length}
                          </span>
                        </div>
                      </button>
                    )}

                    {((selectedLesson.quiz && selectedLesson.quiz.length > 0) || 
                      (selectedLesson.linkedQuizzes && selectedLesson.linkedQuizzes.length > 0)) && (
                      <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                          activeTab === 'quizzes'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Quizzes
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                            {(selectedLesson.quiz.length > 0 ? 1 : 0) + (selectedLesson.linkedQuizzes?.length || 0)}
                          </span>
                        </div>
                      </button>
                    )}

                    {selectedLesson.linkedAssignments && selectedLesson.linkedAssignments.length > 0 && (
                      <button
                        onClick={() => setActiveTab('assignments')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                          activeTab === 'assignments'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          Assignments
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                            {selectedLesson.linkedAssignments.length}
                          </span>
                        </div>
                      </button>
                    )}

                    {selectedLesson.linkedActivities && selectedLesson.linkedActivities.length > 0 && (
                      <button
                        onClick={() => setActiveTab('activities')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                          activeTab === 'activities'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Activities
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                            {selectedLesson.linkedActivities.length}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Content Tab */}
                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedLesson.title}
                      </h2>
                      <CourseMarkdownRenderer content={selectedLesson.content} />
                    </div>
                  )}

                  {/* Resources Tab */}
                  {activeTab === 'resources' && selectedLesson.resources && selectedLesson.resources.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileDown className="h-5 w-5" />
                        Learning Resources
                      </h3>
                      <div className="grid gap-3">
                        {selectedLesson.resources.map((resource, idx) => {
                          const fileName = resource.split('/').pop() || `Resource ${idx + 1}`;
                          const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
                          
                          return (
                            <a
                              key={idx}
                              href={`http://localhost:3000${resource}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {fileName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {fileExtension} Document
                                </p>
                              </div>
                              <Download className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quizzes Tab */}
                  {activeTab === 'quizzes' && (
                    <div className="space-y-6">
                      {enrolled && selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                                Lesson Quiz
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Complete this {selectedLesson.quiz.length}-question quiz.
                              </p>
                              <Button onClick={handleStartQuiz} className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white">
                                <Trophy className="h-4 w-4 mr-2" />
                                Start Quiz
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedLesson.linkedQuizzes && selectedLesson.linkedQuizzes.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Additional Quizzes
                          </h3>
                          {selectedLesson.linkedQuizzes.map((quiz: any) => (
                            <div
                              key={quiz._id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                            >
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {quiz.title}
                                <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                                  {quiz.questions.length} Questions
                                </span>
                              </h4>
                              {quiz.questions.slice(0, 2).map((q: any, idx: number) => (
                                <div key={idx} className="pl-3 border-l-2 border-gray-300 dark:border-gray-600 mt-2">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {idx + 1}. {q.question}
                                  </p>
                                </div>
                              ))}
                              {quiz.questions.length > 2 && (
                                <p className="text-xs text-gray-500 mt-2 pl-3">
                                  + {quiz.questions.length - 2} more
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignments Tab */}
                  {activeTab === 'assignments' && selectedLesson.linkedAssignments && (
                    <div className="space-y-4">
                      {selectedLesson.linkedAssignments.map((assignment: any) => (
                        <div key={assignment._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {assignment.title}
                          </h4>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {assignment.description}
                            </p>
                          )}
                          {assignment.content && (
                            <details>
                              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                View Details
                              </summary>
                              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm">
                                {assignment.content.substring(0, 500)}...
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activities Tab */}
                  {activeTab === 'activities' && selectedLesson.linkedActivities && (
                    <div className="space-y-4">
                      {selectedLesson.linkedActivities.map((activity: any) => (
                        <div key={activity._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {activity.title}
                            </h4>
                            {activity.duration && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                                <Clock className="h-3 w-3" />
                                {activity.duration} min
                              </span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {activity.description}
                            </p>
                          )}
                          {activity.content && (
                            <details>
                              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                View Details
                              </summary>
                              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm">
                                {activity.content.substring(0, 500)}...
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
```

## Key Changes:
1. **Tabbed Navigation**: Content organized into tabs (Content, Resources, Quizzes, Assignments, Activities)
2. **Conditional Tabs**: Only shows tabs for content that exists
3. **Badge Counts**: Shows number of items in each tab
4. **Cleaner UI**: Subtle gray colors matching theme
5. **Resource URL**: Updated to `http://localhost:3000`
6. **Details/Summary**: Collapsible content previews
7. **Better spacing**: Not cramming everything together

Replace the old sections between the video iframe and navigation buttons with this code!
