import { useState, useEffect } from 'react';
import { mediaAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import {
  Video,
  Upload,
  Search,
  Edit,
  Trash2,
  Plus,
  Link as LinkIcon,
  Eye,
  FileVideo,
} from 'lucide-react';

interface Media {
  _id: string;
  title: string;
  description?: string;
  url?: string;
  filePath?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

const MediaPage = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    file: null as File | null,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mediaList.filter(
        (media) =>
          media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          media.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedia(filtered);
    } else {
      setFilteredMedia(mediaList);
    }
  }, [searchQuery, mediaList]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const data = await mediaAPI.getAllMedia();
      setMediaList(data);
      setFilteredMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      if (formData.description) uploadFormData.append('description', formData.description);

      if (uploadType === 'file') {
        if (formData.file) uploadFormData.append('file', formData.file);
        if (formData.thumbnail) uploadFormData.append('thumbnail', formData.thumbnail);
      } else {
        if (formData.url) uploadFormData.append('url', formData.url);
        if (formData.thumbnailUrl) uploadFormData.append('thumbnailUrl', formData.thumbnailUrl);
      }

      await mediaAPI.createMedia(uploadFormData);
      await loadMedia();
      resetForm();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert('Failed to upload media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;

    try {
      setIsLoading(true);
      const updateFormData = new FormData();
      updateFormData.append('title', formData.title);
      if (formData.description) updateFormData.append('description', formData.description);
      if (formData.thumbnailUrl) updateFormData.append('thumbnailUrl', formData.thumbnailUrl);
      if (formData.thumbnail) updateFormData.append('thumbnail', formData.thumbnail);

      await mediaAPI.updateMedia(selectedMedia._id, updateFormData);
      await loadMedia();
      resetForm();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update media:', error);
      alert('Failed to update media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await mediaAPI.deleteMedia(id);
      await loadMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const openEditModal = (media: Media) => {
    setSelectedMedia(media);
    setFormData({
      title: media.title,
      description: media.description || '',
      url: media.url || '',
      thumbnailUrl: media.thumbnailUrl || '',
      file: null,
      thumbnail: null,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnailUrl: '',
      file: null,
      thumbnail: null,
    });
    setSelectedMedia(null);
  };

  const getThumbnail = (media: Media) => {
    if (media.thumbnailPath) return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${media.thumbnailPath}`;
    if (media.thumbnailUrl) return media.thumbnailUrl;
    return null;
  };

  const getMediaUrl = (media: Media) => {
    if (media.filePath) return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${media.filePath}`;
    if (media.url) return media.url;
    return null;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Media Library
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage your video library with uploads and YouTube links
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search media by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsUploadModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMedia.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Video className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'No media found' : 'No media yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Upload your first video or add a YouTube link to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  resetForm();
                  setIsUploadModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload First Media
              </Button>
            )}
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && filteredMedia.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((media) => (
              <Card
                key={media._id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 bg-white"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-slate-100 overflow-hidden">
                  {getThumbnail(media) ? (
                    <img
                      src={getThumbnail(media)!}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileVideo className="h-20 w-20 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    {media.url ? 'URL' : 'File'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {media.title}
                  </h3>
                  {media.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {media.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    {media.fileSize && (
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        {formatFileSize(media.fileSize)}
                      </span>
                    )}
                    {media.mimeType && (
                      <span className="bg-slate-100 px-2 py-1 rounded">{media.mimeType}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {getMediaUrl(media) && (
                      <a
                        href={getMediaUrl(media)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(media)}
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(media._id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Media"
          size="lg"
        >
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Upload Type Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                  uploadType === 'file'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                  uploadType === 'url'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="h-4 w-4 inline mr-2" />
                Video URL
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SQL Tutorial - Part 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the video content..."
                rows={3}
              />
            </div>

            {uploadType === 'file' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video File <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Max size: 500MB</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL (Optional)</label>
                  <Input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://img.youtube.com/vi/..."
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isLoading ? 'Uploading...' : 'Upload Media'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Media"
          size="lg"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Update Thumbnail (Optional)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })
                }
              />
            </div>

            {selectedMedia?.url && (
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                <Input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isLoading ? 'Updating...' : 'Update Media'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default MediaPage;
//