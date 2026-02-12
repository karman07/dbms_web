import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BUTTON_STYLES } from "../constants";
import { User, Phone, Briefcase, MapPin, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import userService from "@/services/user.service";
import { UpdateProfileDto } from "@/types/user";

interface CompleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'About You', icon: User },
];

export function CompleteProfileDialog({ isOpen, onClose, onSkip }: CompleteProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const notification = useNotification();
  const [formData, setFormData] = useState<UpdateProfileDto>({
    phoneNumber: '',
    age: undefined,
    gender: undefined,
    currentPosition: '',
    company: '',
    city: '',
    state: '',
    country: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await userService.updateProfile(formData);
      
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
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 rounded-lg"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  className="rounded-lg"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: e.target.value ? Number(e.target.value) : undefined})}
                  min={1}
                  max={150}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
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
      
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPosition"
                    type="text"
                    placeholder="Software Developer"
                    className="pl-10 rounded-lg"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({...formData, currentPosition: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Tech Corp"
                  className="rounded-lg"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  className="rounded-lg"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  className="rounded-lg"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="USA"
                  className="rounded-lg"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-purple-600" />
              About You
            </h3>
            
            <div className="space-y-3">
              <Label htmlFor="bio">Tell us about yourself</Label>
              <Textarea
                id="bio"
                placeholder="Share your goals, interests, and what you hope to achieve..."
                className="rounded-lg min-h-[150px] resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This helps us personalize your experience
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
            Step {currentStep} of {STEPS.length}
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center justify-between px-6 mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/30' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <form onSubmit={handleSubmit} className="px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[280px] mb-6"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 pb-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                  className="rounded-lg"
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
                  className={`${BUTTON_STYLES.gradient} rounded-lg font-semibold`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className={`${BUTTON_STYLES.gradient} rounded-lg font-semibold min-w-[120px]`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Complete
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
