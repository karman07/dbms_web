import React, { useState, useEffect } from 'react';
import { Search, Play, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Modal from '../ui/modal';
import { mediaAPI } from '../../utils/api';

interface Media {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaIds: string[]) => void;
  selectedIds?: string[];
  multiple?: boolean;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIds = [],
  multiple = true,
}) => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setTempSelected(selectedIds);
    }
  }, [isOpen, selectedIds]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredMedia(
        mediaList.filter(
          (media) =>
            media.title.toLowerCase().includes(query) ||
            media.description?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredMedia(mediaList);
    }
  }, [searchQuery, mediaList]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaAPI.getAllMedia();
      setMediaList(response);
      setFilteredMedia(response);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (mediaId: string) => {
    if (multiple) {
      setTempSelected((prev) =>
        prev.includes(mediaId)
          ? prev.filter((id) => id !== mediaId)
          : [...prev, mediaId]
      );
    } else {
      setTempSelected([mediaId]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Media ${multiple ? '(Multiple)' : ''}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No media found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredMedia.map((media) => {
              const isSelected = tempSelected.includes(media._id);
              return (
                <div
                  key={media._id}
                  onClick={() => toggleSelection(media._id)}
                  className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-slate-300 hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {media.thumbnailUrl ? (
                      <img
                        src={media.thumbnailUrl}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    ) : media.type === 'video' ? (
                      <Play className="w-12 h-12 text-slate-400" />
                    ) : (
                      <FileText className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <h4 className="font-medium text-sm text-slate-900 truncate mb-1">
                    {media.title}
                  </h4>
                  {media.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {media.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {media.type}
                    </Badge>
                    {media.fileSize && (
                      <span className="text-xs text-slate-500">
                        {formatFileSize(media.fileSize)}
                      </span>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Selected count */}
        {tempSelected.length > 0 && (
          <div className="text-sm text-slate-600">
            {tempSelected.length} item{tempSelected.length > 1 ? 's' : ''} selected
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MediaPicker;
