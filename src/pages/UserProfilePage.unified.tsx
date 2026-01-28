import { useState, useEffect } from 'react';
import { User, UpdateProfileDto } from '@/types/user';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { BUTTON_STYLES } from '@/constants';
import { 
  Camera, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar,
  Shield,
  Clock,
  Github,
  Linkedin,
  Globe,
  CheckCircle,
  XCircle,
  Heart,
  Building2,
  CakeIcon,
  UserCheck,
  Save,
  Edit3,
  X
} from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const notification = useNotification();
  
  const [formData, setFormData] = useState<UpdateProfileDto>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    age: undefined,
    gender: undefined,
    currentPosition: '',
    company: '',
    city: '',
    state: '',
    country: '',
    bio: '',
    dateOfBirth: '',
    linkedinProfile: '',
    githubProfile: '',
    website: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getProfile();
      setUser(userData);
      
      // Populate form with existing data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        age: userData.age,
        gender: userData.gender,
        currentPosition: userData.currentPosition || '',
        company: userData.company || '',
        city: userData.city || '',
        state: userData.state || '',
        country: userData.country || '',
        bio: userData.bio || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        linkedinProfile: userData.linkedinProfile || '',
        githubProfile: userData.githubProfile || '',
        website: userData.website || '',
      });
    } catch (err: any) {
      notification.error('Failed to load profile', err.message || 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      notification.success('Profile updated!', 'Your changes have been saved successfully');
    } catch (err: any) {
      notification.error('Update failed', err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      notification.error('Invalid file type', 'Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      notification.error('File too large', 'File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const updatedUser = await userService.uploadProfilePicture(file);
      setUser(updatedUser);
      notification.success('Profile picture updated!', 'Your new photo has been uploaded');
    } catch (err: any) {
      notification.error('Upload failed', err.message || 'Unable to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Unable to load your profile information.</p>
          <Button onClick={loadProfile} className={BUTTON_STYLES.gradient}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                User Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and settings</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center gap-3 px-6 py-3 text-lg"
              size="lg"
            >
              {isEditing ? (
                <>
                  <X className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-12">

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-12">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-16 text-white relative">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm border-6 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-24 h-24 text-white/80" />
                  )}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <div className="text-center">
                    <Camera className="w-10 h-10 mx-auto mb-2" />
                    <span className="text-xs font-medium">
                      {uploading ? 'Uploading...' : 'Change'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-bold mb-4">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-white/90 text-2xl mb-4">{user.email}</p>
                {user.currentPosition && (
                  <p className="text-white/80 flex items-center justify-center md:justify-start gap-3 text-xl">
                    <Briefcase className="w-6 h-6" />
                    {user.currentPosition}{user.company && ` at ${user.company}`}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                  <span className={`px-4 py-2 rounded-full text-lg font-medium ${
                    user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-200' : 'bg-blue-500/20 text-blue-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isActive ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        {/* Section 2: Main Information */}
        <section className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {isEditing ? '✏️ Edit Profile Information' : '📋 Profile Information'}
                  </h3>
                  <p className="text-white/80">
                    {isEditing ? 'Update your personal and professional details' : 'Your personal and professional details'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-12 py-12">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  
                  {/* Personal Information Form */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-purple-600" />
                      Personal Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="firstName" className="text-lg font-medium">First Name *</Label>
                          <Input
                            id="firstName"
                            className="h-12 text-lg"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="lastName" className="text-lg font-medium">Last Name *</Label>
                          <Input
                            id="lastName"
                            className="h-12 text-lg"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phoneNumber" className="text-lg font-medium">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          className="h-12 text-lg"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="age" className="text-lg font-medium">Age</Label>
                          <Input
                            id="age"
                            className="h-12 text-lg"
                            name="age"
                            type="number"
                            value={formData.age?.toString() || ''}
                            onChange={handleInputChange}
                            min="1"
                            max="150"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="gender" className="text-lg font-medium">Gender</Label>
                          <select
                            id="gender"
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            className="w-full h-12 text-lg px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="dateOfBirth" className="text-lg font-medium">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          className="h-12 text-lg"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Form */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                      Professional
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="currentPosition" className="text-lg font-medium">Current Position</Label>
                        <Input
                          id="currentPosition"
                          className="h-12 text-lg"
                          name="currentPosition"
                          type="text"
                          value={formData.currentPosition}
                          onChange={handleInputChange}
                          placeholder="e.g. Software Engineer"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-lg font-medium">Company</Label>
                        <Input
                          id="company"
                          className="h-12 text-lg"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="e.g. Tech Corp"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                        <Input
                          id="linkedinProfile"
                          name="linkedinProfile"
                          type="url"
                          value={formData.linkedinProfile}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="githubProfile">GitHub Profile</Label>
                        <Input
                          id="githubProfile"
                          name="githubProfile"
                          type="url"
                          value={formData.githubProfile}
                          onChange={handleInputChange}
                          placeholder="https://github.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information Form */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-green-600" />
                      Location
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-lg font-medium">City</Label>
                        <Input
                          id="city"
                          className="h-12 text-lg"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. San Francisco"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="state" className="text-lg font-medium">State</Label>
                        <Input
                          id="state"
                          className="h-12 text-lg"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g. California"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-lg font-medium">Country</Label>
                        <Input
                          id="country"
                          className="h-12 text-lg"
                          name="country"
                          type="text"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. United States"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    About Me
                  </h3>
                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-lg font-medium">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Tell us about yourself..."
                      className="resize-none text-lg p-4"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={saving}
                    size="lg"
                    className={`${BUTTON_STYLES.gradient} flex items-center gap-3 px-8 py-4 text-lg`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-3 px-8 py-4 text-lg"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              // Display Mode
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                
                {/* Personal Information Display */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <InfoField label="Email" value={user.email} icon={<Mail className="w-4 h-4" />} verified={user.isEmailVerified} />
                    <InfoField label="Phone" value={user.phoneNumber || 'Not provided'} icon={<Phone className="w-4 h-4" />} verified={user.isPhoneVerified} />
                    <InfoField label="Age" value={user.age ? `${user.age} years old` : 'Not provided'} icon={<Calendar className="w-4 h-4" />} />
                    <InfoField label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'} icon={<UserCheck className="w-4 h-4" />} />
                    <InfoField label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'} icon={<CakeIcon className="w-4 h-4" />} />
                  </div>
                </div>

                {/* Professional Information Display */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Professional
                  </h3>
                  
                  <div className="space-y-4">
                    <InfoField label="Position" value={user.currentPosition || 'Not provided'} icon={<Briefcase className="w-4 h-4" />} />
                    <InfoField label="Company" value={user.company || 'Not provided'} icon={<Building2 className="w-4 h-4" />} />
                    <InfoField 
                      label="LinkedIn" 
                      value={user.linkedinProfile || 'Not provided'} 
                      icon={<Linkedin className="w-4 h-4" />}
                      isLink={!!user.linkedinProfile}
                    />
                    <InfoField 
                      label="GitHub" 
                      value={user.githubProfile || 'Not provided'} 
                      icon={<Github className="w-4 h-4" />}
                      isLink={!!user.githubProfile}
                    />
                    <InfoField 
                      label="Website" 
                      value={user.website || 'Not provided'} 
                      icon={<Globe className="w-4 h-4" />}
                      isLink={!!user.website}
                    />
                  </div>
                </div>

                {/* Location Information Display */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location
                  </h3>
                  
                  <div className="space-y-4">
                    <InfoField label="City" value={user.city || 'Not provided'} icon={<MapPin className="w-4 h-4" />} />
                    <InfoField label="State" value={user.state || 'Not provided'} icon={<MapPin className="w-4 h-4" />} />
                    <InfoField label="Country" value={user.country || 'Not provided'} icon={<MapPin className="w-4 h-4" />} />
                  </div>
                </div>
              </div>
            )}

            </div>
          </div>
        </section>

        {/* Section 3: About Me / Bio */}
        {((isEditing) || (!isEditing && user.bio)) && (
          <section className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-pink-500 to-red-500 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">💭 About Me</h3>
                    <p className="text-white/80">
                      {isEditing ? 'Share something about yourself' : 'Personal bio and introduction'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio Content */}
              <div className="px-12 py-12">
                {isEditing ? (
                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-lg font-medium">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Tell us about yourself..."
                      className="resize-none text-lg p-4"
                    />
                  </div>
                ) : (
                  user.bio && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8">
                      <p className="text-gray-900 dark:text-white leading-relaxed text-lg">{user.bio}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* Account Information (Display only - not editable) */}
        {!isEditing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                <Shield className="w-5 h-5 text-indigo-600" />
                Account Status
              </h3>
              
              <div className="space-y-4">
                <StatusBadge label="Email Verified" status={user.isEmailVerified} />
                <StatusBadge label="Phone Verified" status={user.isPhoneVerified} />
                <StatusBadge label="Account Active" status={user.isActive} />
                {user.referralSource && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Referral Source</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.referralSource}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-orange-600" />
                Activity
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(user.createdAt)}</p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(user.updatedAt)}</p>
                </div>

                {user.lastLoginAt && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(user.lastLoginAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function InfoField({ label, value, icon, isLink = false, verified }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  isLink?: boolean;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <div className="text-gray-500 dark:text-gray-400 text-xl">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex items-center gap-3">
          {isLink && value !== 'Not provided' ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate text-lg"
            >
              {value}
            </a>
          ) : (
            <p className="font-medium text-gray-900 dark:text-white text-lg">{value}</p>
          )}
          {verified && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, status }: { 
  label: string; 
  status: boolean; 
}) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <span className="text-gray-600 dark:text-gray-400 text-lg">{label}</span>
      <span className={`flex items-center gap-3 font-medium text-lg ${
        status ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {status ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        {status ? 'Yes' : 'No'}
      </span>
    </div>
  );
}