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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Questions (Optional)</h3>
        <Button type="button" onClick={addQuestion} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {quiz.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No quiz questions yet. Click "Add Question" to create one.
        </div>
      )}

      {quiz.map((question, qIndex) => (
        <div key={qIndex} className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <h4 className="text-md font-medium text-gray-900">Question {qIndex + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeQuestion(qIndex)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Options (at least 2, mark one as correct)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(qIndex)}
                disabled={question.options.length >= 6}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>

            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateOption(qIndex, oIndex, 'isCorrect', !option.isCorrect)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    option.isCorrect
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-400'
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
                  className="flex-1"
                />
                {question.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <Textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
              placeholder="Explain the correct answer..."
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizBuilder;
