import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BUTTON_STYLES } from "../constants";
import { User, Phone, MapPin, ChevronRight, ChevronLeft, Check, GraduationCap, Briefcase, Calendar } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import userService from "@/services/user.service";
import { UpdateProfileDto } from "@/types/user";

interface CompleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

const STEPS = [
  { id: 1, title: 'Visitor Type', icon: User },
  { id: 2, title: 'Personal Info', icon: User },
  { id: 3, title: 'Profile Details', icon: GraduationCap },
  { id: 4, title: 'Location & Bio', icon: MapPin },
];

export function CompleteProfileDialog({ isOpen, onClose, onSkip }: CompleteProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const notification = useNotification();
  const [formData, setFormData] = useState<UpdateProfileDto>({
    phoneNumber: '',
    gender: undefined,
    dateOfBirth: '',
    visitorType: undefined,
    city: '',
    state: '',
    country: '',
    bio: '',
    // Student fields
    university: '',
    degree: '',
    major: '',
    graduationYear: undefined,
    // Teacher fields
    department: '',
    designation: '',
    teachingExperience: undefined,
    specialization: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if not on the last step
    if (currentStep !== STEPS.length) {
      handleNext();
      return;
    }

    setLoading(true);

    try {
      // Clean up data based on visitor type
      const dataToSubmit: UpdateProfileDto = {
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        visitorType: formData.visitorType,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        bio: formData.bio,
      };

      // Add visitor-specific fields
      if (formData.visitorType === 'student') {
        dataToSubmit.university = formData.university;
        dataToSubmit.degree = formData.degree;
        dataToSubmit.major = formData.major;
        dataToSubmit.graduationYear = formData.graduationYear;
      } else if (formData.visitorType === 'teacher') {
        dataToSubmit.department = formData.department;
        dataToSubmit.designation = formData.designation;
        dataToSubmit.teachingExperience = formData.teachingExperience;
        dataToSubmit.specialization = formData.specialization;
      }

      // Explicitly call the API to update profile
      const updatedUser = await userService.updateProfile(dataToSubmit);

      // Dispatch event to update UI with fresh data from API
      const event = new CustomEvent('loginSuccess', { detail: { user: updatedUser } });
      window.dispatchEvent(event);

      notification.success('Profile completed!', 'Your information has been saved successfully.');
      onClose();

      // Reload page after profile completion to ensure UI reflects updated state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      notification.error('Update failed', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    notification.info('Profile skipped', 'You can complete your profile anytime from your profile page.');
    onSkip();
    onClose();

    // Reload page after skipping profile to ensure UI reflects authenticated state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-purple-600" />
              Who are you?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select your role to customize your profile experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visitorType: 'student' })}
                className={`p-6 rounded-xl border-2 transition-all ${formData.visitorType === 'student'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md ring-2 ring-purple-100 dark:ring-purple-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${formData.visitorType === 'student' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Student</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  I'm here to learn and access study materials
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, visitorType: 'teacher' })}
                className={`p-6 rounded-xl border-2 transition-all ${formData.visitorType === 'teacher'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md ring-2 ring-purple-100 dark:ring-purple-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${formData.visitorType === 'teacher' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                  <Briefcase className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Teacher</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  I'm here to manage content and students
                </p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-purple-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors pointer-events-none" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-10 rounded-lg border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 transition-all"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors pointer-events-none" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10 rounded-lg border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 transition-all cursor-pointer appearance-none"
                    value={formData.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]} // Disable future dates
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                  {/* Custom arrow for Date Input consistency cross-browser */}
                  <style>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      cursor: pointer;
                      opacity: 0.6;
                      transition: 0.2s;
                    }
                    input[type="date"]::-webkit-calendar-picker-indicator:hover {
                      opacity: 1;
                    }
                  `}</style>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500 transition-all outline-none"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              {formData.visitorType === 'student' ? (
                <><GraduationCap className="w-5 h-5 text-purple-600" /> Academic Details</>
              ) : (
                <><Briefcase className="w-5 h-5 text-purple-600" /> Professional Details</>
              )}
            </h3>

            {formData.visitorType === 'student' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="university">University/College *</Label>
                  <Input
                    id="university"
                    type="text"
                    placeholder="Enter university name"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    type="text"
                    placeholder="B.Tech / B.Sc"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study *</Label>
                  <Input
                    id="major"
                    type="text"
                    placeholder="Computer Science"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="2026"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.graduationYear || ''}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value ? Number(e.target.value) : undefined })}
                    min={1950}
                    max={2050}
                  />
                </div>
              </div>
            ) : formData.visitorType === 'teacher' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Computer Science"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Assistant Professor"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachingExperience">Teaching Experience (years) *</Label>
                  <Input
                    id="teachingExperience"
                    type="number"
                    placeholder="5"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.teachingExperience || ''}
                    onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value ? Number(e.target.value) : undefined })}
                    min={0}
                    max={70}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization (comma-separated)</Label>
                  <Input
                    id="specialization"
                    type="text"
                    placeholder="DBMS, OS, Networks"
                    className="rounded-lg focus:border-purple-500"
                    value={formData.specialization?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p>Please select your visitor type in Step 1 first.</p>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                  className="text-purple-600 mt-2 hover:underline p-0 h-auto hover:bg-transparent"
                >
                  Go to Step 1
                </Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location & About You
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New Delhi"
                  className="rounded-lg focus:border-purple-500"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Delhi"
                  className="rounded-lg focus:border-purple-500"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="India"
                  className="rounded-lg focus:border-purple-500"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your goals, and interests..."
                  className="rounded-lg min-h-[120px] resize-none focus:border-purple-500"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This helps us personalize your experience
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
            Step {currentStep} of {STEPS.length}: <span className="font-medium text-purple-600 dark:text-purple-400">{STEPS[currentStep - 1].title}</span>
          </p>
        </DialogHeader>

        {/* Improved Progress Bar */}
        <div className="flex items-center justify-between px-8 py-6 relative">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-emerald-200 dark:shadow-none scale-100'
                  : isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/40 shadow-purple-200 dark:shadow-none scale-110'
                    : 'bg-white dark:bg-gray-800 text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-3 font-semibold transition-colors duration-300 text-center ${isActive ? 'text-purple-600 dark:text-purple-400' :
                  isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                  }`}>
                  {step.title}
                </span>
              </div>
            );
          })}

          {/* Connecting Line - Background */}
          <div className="absolute top-[2.5rem] left-20 right-20 h-1 bg-gray-100 dark:bg-gray-800 -z-0 rounded-full" />

          {/* Connecting Line - Progress */}
          <div
            className="absolute top-[2.5rem] left-20 h-1 bg-gradient-to-r from-green-400 to-purple-500 -z-0 rounded-full transition-all duration-500"
            style={{
              width: `calc((100% - 160px) * ${(currentStep - 1) / (STEPS.length - 1)})`
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[320px] mb-8"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Skip for Now
            </Button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={`${BUTTON_STYLES.gradient} rounded-lg font-semibold shadow-lg shadow-purple-500/20`}
                  disabled={currentStep === 1 && !formData.visitorType}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className={`${BUTTON_STYLES.gradient} rounded-lg font-semibold min-w-[140px] shadow-lg shadow-purple-500/20`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
