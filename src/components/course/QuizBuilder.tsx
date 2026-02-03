import React from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { QuizQuestion } from '../../types';

interface QuizBuilderProps {
  quiz: QuizQuestion[];
  onChange: (quiz: QuizQuestion[]) => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ quiz, onChange }) => {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
    };
    onChange([...quiz, newQuestion]);
  };

  const removeQuestion = (questionIndex: number) => {
    onChange(quiz.filter((_, i) => i !== questionIndex));
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    const updated = quiz.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, [field]: value };
      }
      return q;
    });
    onChange(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = quiz.map((q, i) => {
      if (i === questionIndex) {
        return {
          ...q,
          options: [...q.options, { text: '', isCorrect: false }],
        };
      }
      return q;
    });
    onChange(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = quiz.map((q, i) => {
      if (i === questionIndex) {
        return {
          ...q,
          options: q.options.filter((_, oi) => oi !== optionIndex),
        };
      }
      return q;
    });
    onChange(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updated = quiz.map((q, i) => {
      if (i === questionIndex) {
        return {
          ...q,
          options: q.options.map((opt, oi) => {
            if (oi === optionIndex) {
              // If setting this option as correct, unset others
              if (field === 'isCorrect' && value === true) {
                return { ...opt, isCorrect: true };
              }
              return { ...opt, [field]: value };
            }
            // Unset other options if this one is being set as correct
            if (field === 'isCorrect' && value === true) {
              return { ...opt, isCorrect: false };
            }
            return opt;
          }),
        };
      }
      return q;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900">Quiz Questions</h3>
            <p className="text-sm text-blue-700">Build interactive questions for your quiz</p>
          </div>
        </div>
        <Button 
          type="button" 
          onClick={addQuestion} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {quiz.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-blue-200">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">No quiz questions yet</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Question" to create your first question</p>
        </div>
      )}

      {quiz.map((question, qIndex) => (
        <div key={qIndex} className="border-0 rounded-xl p-6 space-y-6 bg-gradient-to-br from-white to-blue-50/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {qIndex + 1}
              </div>
              <h4 className="text-lg font-bold text-gray-900">Question {qIndex + 1}</h4>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeQuestion(qIndex)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Question Text <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              required
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-800">
                Answer Options (mark one as correct)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(qIndex)}
                disabled={question.options.length >= 6}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => updateOption(qIndex, oIndex, 'isCorrect', !option.isCorrect)}
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      option.isCorrect
                        ? 'bg-blue-500 border-blue-500 shadow-lg'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    title="Mark as correct answer"
                  >
                    {option.isCorrect && <Check className="h-4 w-4 text-white" />}
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Explanation (Optional)
            </label>
            <Textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
              placeholder="Explain the correct answer..."
              rows={2}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizBuilder;
