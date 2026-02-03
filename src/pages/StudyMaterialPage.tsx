import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookMarked, Download, Eye, Clock, Loader2, Search, Play, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import mediaService, { MediaItem } from "@/services/media.service";
import { useNotification } from "@/contexts/NotificationContext";

const StudyMaterialPage = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getAllMedia();
      setMediaItems(data);
    } catch (error: any) {
      notification.error('Failed to load media', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = useMemo(() => {
    let filtered = mediaItems;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => getMediaType(item) === selectedCategory);
    }
    
    return filtered;
  }, [mediaItems, searchQuery, selectedCategory]);

  const getMediaType = (item: MediaItem) => {
    if (item.mimeType) {
      if (item.mimeType.startsWith('video/')) return 'Video';
      if (item.mimeType.startsWith('audio/')) return 'Audio';
      if (item.mimeType.includes('pdf')) return 'PDF';
      if (item.mimeType.startsWith('image/')) return 'Image';
    }
    if (item.url) {
      if (item.url.includes('youtube') || item.url.includes('vimeo')) return 'Video';
    }
    return 'Other';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const categories = useMemo(() => {
    const types = mediaItems.map(getMediaType);
    const uniqueTypes = [...new Set(types)];
    return [
      { name: "All", count: mediaItems.length },
      ...uniqueTypes.map(type => ({
        name: type,
        count: types.filter(t => t === type).length
      }))
    ];
  }, [mediaItems]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-5 w-5" />;
      case 'PDF': return <FileText className="h-5 w-5" />;
      default: return <BookMarked className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Video': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Audio': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PDF': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Image': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (selectedMedia) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedMedia(null)}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Media
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      {getTypeIcon(getMediaType(selectedMedia))}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedMedia.title}
                    </h1>
                  </div>
                  {selectedMedia.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {selectedMedia.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDate(selectedMedia.createdAt)}</span>
                </div>
                {selectedMedia.fileSize && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Download className="h-4 w-4" />
                    <span>{formatFileSize(selectedMedia.fileSize)}</span>
                  </div>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(getMediaType(selectedMedia))}`}>
                  {getMediaType(selectedMedia)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {selectedMedia.url && getMediaType(selectedMedia) === 'Video' && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <iframe
                    src={selectedMedia.url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {selectedMedia.thumbnailPath && (
                <div className="mb-6">
                  <img 
                    src={selectedMedia.thumbnailPath} 
                    alt={selectedMedia.title}
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div className="flex gap-4">
                {selectedMedia.filePath && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
                {selectedMedia.url && (
                  <Button variant="outline" onClick={() => window.open(selectedMedia.url, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open Link
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <BookMarked className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Material</h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Found {filteredMedia.length} of {mediaItems.length} items
            </p>
          )}
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
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                      selectedCategory === category.name
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Media Grid */}
          <div className="lg:col-span-3">
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No media found matching your search' : 'No media available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMedia.map((item, index) => {
                  const mediaType = getMediaType(item);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedMedia(item)}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-600 transition-colors">
                          <div className="text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors">
                            {getTypeIcon(mediaType)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(mediaType)}`}>
                          {mediaType}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        {item.fileSize && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(item.fileSize)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(item);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {item.filePath && (
                          <Button 
                            size="sm" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialPage;