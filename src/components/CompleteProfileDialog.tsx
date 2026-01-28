import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BUTTON_STYLES } from "../constants";
import { User, Phone, Briefcase, MapPin } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import userService from "@/services/user.service";
import { UpdateProfileDto } from "@/types/user";

interface CompleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export function CompleteProfileDialog({ isOpen, onClose, onSkip }: CompleteProfileDialogProps) {
  const [loading, setLoading] = useState(false);
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
      await userService.updateProfile(formData);
      
      // Update user in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch event to update UI
        const event = new CustomEvent('loginSuccess', { detail: { user: updatedUser } });
        window.dispatchEvent(event);
      }

      notification.success('Profile completed!', 'Your information has been saved successfully.');
      onClose();
    } catch (err: any) {
      notification.error('Update failed', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Complete Your Profile
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Help us personalize your learning experience
          </p>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
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
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                    className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPosition">Current Position</Label>
                  <Input
                    id="currentPosition"
                    type="text"
                    placeholder="Software Developer"
                    className="rounded-lg"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({...formData, currentPosition: e.target.value})}
                  />
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

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="NY"
                    className="rounded-lg"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
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

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your goals, and what you hope to learn..."
                className="rounded-lg min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
                className="w-full sm:w-auto rounded-lg"
                disabled={loading}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full sm:flex-1 ${BUTTON_STYLES.gradient} rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
