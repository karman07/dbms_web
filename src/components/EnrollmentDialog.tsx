import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, GraduationCap, CheckCircle, X } from 'lucide-react';
import { GRADIENTS, BUTTON_STYLES } from '@/constants';

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: () => void;
  enrolling: boolean;
  courseTitle: string;
}

export function EnrollmentDialog({ 
  isOpen, 
  onClose, 
  onEnroll, 
  enrolling, 
  courseTitle 
}: EnrollmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
          {/* Header */}
          <div className={`${GRADIENTS.gradientPrimary} p-6 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Enrollment Required</h2>
                <p className="text-white/80 text-sm mt-1">Start your learning journey</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300">
                To access <span className="font-semibold">{courseTitle}</span>, you need to enroll first.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Benefits of Enrolling:
              </h3>
              <ul className="space-y-2">
                {[
                  'Track your progress across all lessons',
                  'Take quizzes and earn certificates',
                  'Access exclusive learning materials',
                  'Save your learning history',
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={enrolling}
              >
                Cancel
              </Button>
              <Button
                onClick={onEnroll}
                className={`${BUTTON_STYLES.gradient} flex-1`}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
