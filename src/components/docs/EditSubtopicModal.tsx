import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import MarkdownEditor from '../ui/markdown-editor';

interface EditSubtopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (topicId: string, subtopicName: string, newName?: string, content?: string) => Promise<void>;
  topicId: string;
  subtopicName: string;
  initialContent?: string;
}

const EditSubtopicModal: React.FC<EditSubtopicModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  topicId,
  subtopicName,
  initialContent = ''
}) => {
  const [newName, setNewName] = useState('');
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName && content === initialContent) return;

    setLoading(true);
    try {
      await onUpdate(topicId, subtopicName, newName || undefined, content !== initialContent ? content : undefined);
      onClose();
      setNewName('');
      setContent(initialContent);
    } catch (error) {
      console.error('Failed to update subtopic:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Edit Subtopic</h3>
            <p className="text-sm text-gray-600 mt-1">Current name: <span className="font-medium">{subtopicName}</span></p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Name (optional)
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new name or leave empty to keep current name"
              />
            </div>
          </div>
          
          <div className="flex-1 px-6 pb-4 overflow-hidden">
            <label className="block text-sm font-medium mb-2">
              Content
            </label>
            <div className="h-full">
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your documentation content here..."
                minHeight="500px"
              />
            </div>
          </div>
          
          <div className="flex gap-2 p-6 border-t bg-blue-50/20">
            <Button 
              type="submit" 
              disabled={loading || (!newName && content === initialContent)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Updating...' : 'Update Subtopic'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubtopicModal;