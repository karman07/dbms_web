import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Modal from '../ui/modal';

interface SubtopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topicId: string, formData: FormData) => Promise<void>;
  topicId: string;
  topicName: string;
}

const SubtopicModal: React.FC<SubtopicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  topicId,
  topicName,
}) => {
  const [loading, setLoading] = useState(false);
  const [subtopicName, setSubtopicName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile && !selectedFile.name.endsWith('.md')) {
      alert('Only .md files are allowed');
      return;
    }
    
    setFile(selectedFile || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please upload a markdown file');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      if (subtopicName.trim()) {
        data.append('subtopicName', subtopicName.trim());
      }
      data.append('file', file);

      await onSubmit(topicId, data);
      
      // Reset form
      setSubtopicName('');
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Error adding subtopic:', error);
      alert('Failed to add subtopic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Subtopic to "${topicName}"`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtopic Name (Optional)
          </label>
          <Input
            value={subtopicName}
            onChange={(e) => setSubtopicName(e.target.value)}
            placeholder="Leave empty to use filename"
          />
          <p className="mt-1 text-xs text-gray-500">
            If not provided, the filename will be used (underscores replaced with spaces)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Markdown File <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".md,.markdown"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50/30 hover:bg-blue-50">
                <Upload className="h-6 w-6 text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload markdown file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .md file only
                  </p>
                </div>
              </div>
            </label>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-blue-50/30 rounded-lg border border-blue-200">
                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border-blue-200 text-blue-600 hover:bg-blue-50">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Adding...' : 'Add Subtopic'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubtopicModal;
