import React, { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Modal from '../ui/modal';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const TopicModal: React.FC<TopicModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    course: 'dbms',
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const mdFiles = selectedFiles.filter(file => file.name.endsWith('.md'));
    
    if (mdFiles.length !== selectedFiles.length) {
      alert('Only .md files are allowed');
      return;
    }
    
    if (mdFiles.length + files.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }
    
    setFiles([...files, ...mdFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert('Please upload at least one markdown file');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('topic', formData.topic);
      data.append('course', formData.course);
      
      files.forEach(file => {
        data.append('files', file);
      });

      await onSubmit(data);
      
      // Reset form
      setFormData({ topic: '', course: 'dbms' });
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Documentation Topic" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Database Normalization"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course
          </label>
          <Input
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            placeholder="dbms"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Markdown Files <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".md,.markdown"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50/30 hover:bg-blue-50">
                <Upload className="h-6 w-6 text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload markdown files
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .md files only (max 10 files)
                  </p>
                </div>
              </div>
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected Files ({files.length}):
                </p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-blue-600 hover:text-blue-700 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Filenames will be used as subtopic names (underscores will be replaced with spaces)
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border-blue-200 text-blue-600 hover:bg-blue-50">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || files.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Creating...' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TopicModal;
