import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  EyeOff,
  Quote
} from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  minHeight = '400px'
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      before + 
      textToInsert + 
      after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (!textareaRef) return;
      const newCursorPos = start + before.length + textToInsert.length;
      textareaRef.focus();
      textareaRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdown('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'Heading 3', action: () => insertMarkdown('### ', '', 'Heading 3') },
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('_', '_', 'italic text') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '', 'quote') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ', '', 'list item') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ', '', 'list item') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![', '](image-url)', 'alt text') },
  ];

  // Simple markdown to HTML preview (basic implementation)
  const renderPreview = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
      // Blockquotes
      .replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      // Lists
      .replace(/^\d+\.\s(.*)$/gim, '<li class="ml-6">$1</li>')
      .replace(/^-\s(.*)$/gim, '<li class="ml-6">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700 hover:text-gray-900"
            title={btn.label}
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="ml-2"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {!showPreview ? (
          <Textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border-0 focus:ring-0 font-mono text-sm resize-none"
            style={{ minHeight }}
          />
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none overflow-y-auto"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        )}
      </div>

      {/* Helper text */}
      <div className="bg-gray-50 border-t border-gray-300 px-3 py-2 text-xs text-gray-600">
        <span className="font-medium">Tips:</span> Use the toolbar buttons to format your text. 
        Click Preview to see how it will look.
      </div>
    </div>
  );
};

export default MarkdownEditor;
