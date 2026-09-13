import React, { useState, useEffect } from 'react';
import { Search, FileText, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Modal from '../ui/modal';
import { docsAPI } from '../../utils/api';

interface DocSubtopic {
  _id: string;
  name: string;
  content: string;
}

interface DocTopic {
  _id: string;
  title: string;
  description: string;
  subtopics: DocSubtopic[];
}

interface DocSubtopicPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (subtopicIds: string[]) => void;
  selectedIds?: string[];
  multiple?: boolean;
}

const DocSubtopicPicker: React.FC<DocSubtopicPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIds = [],
  multiple = true,
}) => {
  const [topics, setTopics] = useState<DocTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTopics();
      setTempSelected(selectedIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const response = await docsAPI.getAllTopics();
      const list = Array.isArray(response) ? response : [];
      setTopics(list);
      // Auto-expand topics that already contain a selected subtopic
      const toExpand = list
        .filter((t: DocTopic) => (t.subtopics || []).some((s) => selectedIds.includes(s._id)))
        .map((t: DocTopic) => t._id);
      if (toExpand.length > 0) setExpandedTopics((prev) => Array.from(new Set([...prev, ...toExpand])));
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleSelection = (subtopicId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (multiple) {
      setTempSelected((prev) =>
        prev.includes(subtopicId)
          ? prev.filter((id) => id !== subtopicId)
          : [...prev, subtopicId]
      );
    } else {
      setTempSelected([subtopicId]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const filteredTopics = topics.filter((topic) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description?.toLowerCase().includes(query) ||
      (topic.subtopics || []).some((sub) => sub.name.toLowerCase().includes(query))
    );
  });

  // While searching, auto-expand every topic that matches so results are visible immediately
  useEffect(() => {
    if (!searchQuery.trim()) return;
    setExpandedTopics((prev) => Array.from(new Set([...prev, ...filteredTopics.map((t) => t._id)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Documentation ${multiple ? '(Multiple)' : ''}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search topics and subtopics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Topics List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documentation found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTopics.map((topic) => {
              const isExpanded = expandedTopics.includes(topic._id);
              const subtopics = topic.subtopics || [];
              const selectedInTopic = subtopics.filter((s) => tempSelected.includes(s._id)).length;
              return (
                <div key={topic._id} className="border border-slate-300 rounded-lg overflow-hidden">
                  {/* Topic Header */}
                  <div
                    onClick={() => toggleTopic(topic._id)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900">{topic.title}</h4>
                      {topic.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{topic.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {subtopics.length} subtopic{subtopics.length !== 1 ? 's' : ''}
                        </Badge>
                        {selectedInTopic > 0 && (
                          <Badge className="text-xs bg-blue-600 text-white">
                            {selectedInTopic} selected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Subtopics */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 p-2 space-y-1">
                      {subtopics.length === 0 ? (
                        <div className="text-sm text-slate-500 p-2">No subtopics available</div>
                      ) : (
                        subtopics.map((subtopic) => {
                          const isSelected = tempSelected.includes(subtopic._id);
                          return (
                            <div
                              key={subtopic._id}
                              onClick={(e) => toggleSelection(subtopic._id, e)}
                              className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-100 border border-blue-600'
                                  : 'bg-white border border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {subtopic.name}
                                </p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          );
                        })
                      )}
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
            {tempSelected.length} subtopic{tempSelected.length > 1 ? 's' : ''} selected
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

export default DocSubtopicPicker;
