import React from 'react';
import { Quiz, QuizQuestion } from '@/types';
import { Check, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface QuizViewerProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz | null;
}

const QuizViewer: React.FC<QuizViewerProps> = ({ isOpen, onClose, quiz }) => {
    if (!quiz) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={quiz.title} size="xl">
            <div className="space-y-6">
                {/* Quiz Info Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{quiz.title}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {quiz.questions?.length || 0} Questions
                        </p>
                    </div>
                    <Badge variant="secondary">Preview Mode</Badge>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {quiz.questions?.map((q: QuizQuestion, qIndex: number) => (
                        <div
                            key={qIndex}
                            className="bg-white rounded-xl border border-slate-200 p-6"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                    {qIndex + 1}
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900 pt-0.5">{q.question}</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {q.options.map((opt, oIndex) => (
                                    <div
                                        key={oIndex}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${opt.isCorrect
                                                ? 'bg-green-50 border-green-200 text-green-900'
                                                : 'bg-white border-slate-200 text-slate-600'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {opt.isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : String.fromCharCode(65 + oIndex)}
                                        </div>
                                        <span className="font-medium text-sm">{opt.text}</span>
                                    </div>
                                ))}
                            </div>

                            {q.explanation && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-0.5">Explanation</p>
                                        <p className="text-sm text-blue-900/80 leading-relaxed">{q.explanation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default QuizViewer;
