import { CheckCircle, XCircle } from 'lucide-react';

interface QuestionReviewProps {
  questions: { question: string }[];
  /** perQuestion[i] === true means question i was answered correctly. Never shows which option was right. */
  perQuestion: boolean[];
}

/**
 * Shows per-question correct/incorrect status after a quiz submission.
 * Deliberately does not reveal the correct answer or the option the learner picked —
 * only whether each question was right or wrong, so the quiz stays useful on retake.
 */
export const QuestionReview = ({ questions, perQuestion }: QuestionReviewProps) => (
  <div className="text-left mt-6">
    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Question Review</h5>
    <div className="space-y-2">
      {questions.map((q, idx) => {
        const isCorrect = perQuestion[idx];
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              isCorrect
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {idx + 1}. {q.question}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? 'Correct' : 'Incorrect'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default QuestionReview;
