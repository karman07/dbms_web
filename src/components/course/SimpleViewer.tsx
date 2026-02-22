import React from 'react';
import Modal from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface SimpleViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    content: string;
    type: 'Assignment' | 'Activity';
    duration?: number;
}

const SimpleViewer: React.FC<SimpleViewerProps> = ({
    isOpen,
    onClose,
    title,
    description,
    content,
    type,
    duration
}) => {
    // Simple markdown to HTML
    const renderMarkdown = (markdown: string) => {
        let html = markdown;
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-3">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-10 mb-6">$1</h1>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');
        html = html.replace(/\n/g, '<br />');
        return html;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="font-bold uppercase tracking-widest text-[10px]">
                            {type}
                        </Badge>
                        {duration && (
                            <span className="text-xs font-bold text-slate-400">⏱ {duration} mins</span>
                        )}
                    </div>
                </div>

                <div className="prose prose-slate max-w-none bg-white p-6 rounded-xl border border-slate-100 min-h-[300px]">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-slate-400 italic">
                            No additional content provided.
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                        Close Viewer
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SimpleViewer;
