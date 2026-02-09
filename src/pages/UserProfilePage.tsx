import { useState, useEffect } from 'react';
import { User, UpdateProfileDto } from '@/types/user';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { COLORS, GRADIENTS } from '@/constants';
import {
  Camera,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  XCircle,
  Heart,
  CakeIcon,
  Save,
  Edit3,
  X,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const notification = useNotification();

  // Professional Profile Picture Component
  const ProfilePicture: React.FC<{ showUpload?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ showUpload = false, size = 'lg' }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
      sm: 'w-20 h-20',
      md: 'w-32 h-32',
      lg: 'w-32 h-32 lg:w-40 lg:h-40'
    };

    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    // Get the base URL with fallback
    const getImageUrl = (imagePath: string) => {
      if (!imagePath) return '';

      // If it's already a full URL, use it as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // If it's a relative path, construct the full URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${imagePath}`;
      console.log('Constructed image URL:', fullUrl);
      return fullUrl;
    };

    // Reset loading state when user changes
    useEffect(() => {
      if (user?.profilePicture) {
        setImageLoading(true);
        setImageError(false);
      }
    }, [user?.profilePicture]);

    return (
      <div className={`relative ${showUpload ? 'group' : ''} flex-shrink-0`}>
        <div
          className={`${sizeClasses[size]} rounded-full p-1 shadow-lg`}
          style={{ background: GRADIENTS.primary.background }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-inner">
            {user?.profilePicture && !imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  style={{ display: imageLoading ? 'none' : 'block' }}
                  onLoad={() => {
                    if (user?.profilePicture) {
                      console.log('Profile image loaded successfully:', getImageUrl(user.profilePicture));
                    }
                    setImageLoading(false);
                    setImageError(false);
                  }}
                  onError={() => {
                    if (user?.profilePicture) {
                      console.error('Failed to load profile image:', getImageUrl(user.profilePicture));
                    }
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </>
            ) : (
              <div
                className={`rounded-full p-3 flex items-center justify-center ${GRADIENTS.gradientPrimary}`}
              >
                <UserIcon className={`${iconSizes[size]} text-white`} />
              </div>
            )}
          </div>
        </div>

        {/* Upload Overlay - Only show in edit mode */}
        {showUpload && (
          <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
            <div className="text-center text-white">
              <Camera className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">
                {uploading ? 'Uploading...' : user?.profilePicture ? 'Change Photo' : 'Add Photo'}
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
        )}
      </div>
    );
  };

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
    visitorType: undefined,
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getProfile();
      console.log('Profile data received:', userData);
      console.log('Profile picture path:', userData.profilePicture);
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
        visitorType: userData.visitorType,
        university: userData.university || '',
        degree: userData.degree || '',
        major: userData.major || '',
        graduationYear: userData.graduationYear,
        department: userData.department || '',
        designation: userData.designation || '',
        teachingExperience: userData.teachingExperience,
        specialization: userData.specialization || [],
      });
    } catch (err: any) {
      console.error('Failed to load profile:', err);
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
      // Clear the input
      e.target.value = '';
      return;
    }

    // Validate file size (5MB max as per API docs)
    if (file.size > 5 * 1024 * 1024) {
      notification.error('File too large', 'File size must be less than 5MB');
      // Clear the input
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);

      const updatedUser = await userService.uploadProfilePicture(file);
      setUser(updatedUser);
      notification.success('Profile picture updated!', 'Your new photo has been uploaded successfully');

      // Clear the input for future uploads
      e.target.value = '';
    } catch (err: any) {
      notification.error('Upload failed', err.message || 'Unable to upload profile picture');
      // Clear the input
      e.target.value = '';
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
          <Button onClick={loadProfile} className={GRADIENTS.gradientPrimary}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <UserIcon className="w-6 h-6" style={{ color: COLORS.primary }} />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? GRADIENTS.gradientAccent : GRADIENTS.gradientPrimary}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2 text-white" />
                  <span className="text-white">Cancel</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2 text-white" />
                  <span className="text-white">Edit Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Section 1: Personal Info */}
          <section id="personal-info" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Section Header */}
              <div className={`px-8 py-6 ${GRADIENTS.gradientPrimary}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Personal Info
                    </h2>
                    <p className="text-white/80 text-sm">Your basic personal information</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
                      {/* Profile Picture */}
                      <ProfilePicture showUpload={true} size="lg" />

                      {/* User Information */}
                      <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={formData.age?.toString() || ''}
                          onChange={handleInputChange}
                          min="1"
                          max="150"
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                          style={{
                            borderColor: formData.gender ? COLORS.primary : undefined
                          }}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
                      {/* Profile Picture */}
                      <ProfilePicture showUpload={false} size="lg" />

                      {/* User Information */}
                      <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>

                        {/* Status Badges */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${user.role === 'admin'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {user.role === 'admin' ? ' Administrator' : ' User'}
                          </span>
                          {user.isEmailVerified && (
                            <span className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              📧 Email Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Phone className="w-4 h-4" style={{ color: COLORS.accent }} />
                          {user.phoneNumber || 'Not provided'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CakeIcon className="w-4 h-4" style={{ color: COLORS.accent }} />
                          {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: COLORS.accent }} />
                          {user.age || 'Not provided'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 1.5: Role Information */}
          {user.visitorType && (
            <section id="role-info" className="scroll-mt-20">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Section Header */}
                <div className={`px-8 py-6 ${GRADIENTS.gradientPrimary}`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {user.visitorType === 'student' ? 'Academic Details' : 'Teaching Profile'}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {user.visitorType === 'student' ? 'Your educational background' : 'Your academic position and experience'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      {user.visitorType === 'student' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="university" className="text-sm font-medium">University/College</Label>
                            <Input
                              id="university"
                              name="university"
                              value={formData.university}
                              onChange={handleInputChange}
                              placeholder="e.g. MIT"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="degree" className="text-sm font-medium">Degree</Label>
                            <Input
                              id="degree"
                              name="degree"
                              value={formData.degree}
                              onChange={handleInputChange}
                              placeholder="e.g. B.Tech"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="major" className="text-sm font-medium">Major</Label>
                            <Input
                              id="major"
                              name="major"
                              value={formData.major}
                              onChange={handleInputChange}
                              placeholder="e.g. Computer Science"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="graduationYear" className="text-sm font-medium">Graduation Year</Label>
                            <Input
                              id="graduationYear"
                              name="graduationYear"
                              type="number"
                              value={formData.graduationYear || ''}
                              onChange={handleInputChange}
                              placeholder="e.g. 2026"
                              className="h-12 text-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                            <Input
                              id="department"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              placeholder="e.g. Computer Science"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="designation" className="text-sm font-medium">Designation</Label>
                            <Input
                              id="designation"
                              name="designation"
                              value={formData.designation}
                              onChange={handleInputChange}
                              placeholder="e.g. Professor"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teachingExperience" className="text-sm font-medium">Experience (Years)</Label>
                            <Input
                              id="teachingExperience"
                              name="teachingExperience"
                              type="number"
                              value={formData.teachingExperience || ''}
                              onChange={handleInputChange}
                              placeholder="e.g. 5"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="specialization" className="text-sm font-medium">Specialization (comma separated)</Label>
                            <Input
                              id="specialization"
                              name="specialization"
                              value={formData.specialization?.join(', ') || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specialization: e.target.value.split(',').map(s => s.trim())
                              }))}
                              placeholder="e.g. AI, ML, DBMS"
                              className="h-12 text-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.visitorType === 'student' ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">University</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.university || 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Degree</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.degree || 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Major</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.major || 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduation Year</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.graduationYear || 'Not specified'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.department || 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Designation</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.designation || 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.teachingExperience ? `${user.teachingExperience} years` : 'Not specified'}
                            </div>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Specialization</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.specialization && user.specialization.map((spec, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                  {spec}
                                </span>
                              ))}
                              {(!user.specialization || user.specialization.length === 0) && (
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">Not specified</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}



          {/* Section 3: Location */}
          <section id="location" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Section Header */}
              <div className={`px-8 py-6 ${GRADIENTS.gradientAccent}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Location</h2>
                    <p className="text-white/80 text-sm">Your location information</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. New York"
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g. NY, California"
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. United States"
                          className="h-12 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">City</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: COLORS.accent }} />
                        {user.city || 'Not specified'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">State/Province</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.state || 'Not specified'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Country</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.country || 'Not specified'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: About Me */}
          <section id="about-me" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Section Header */}
              <div className={`px-8 py-6 ${GRADIENTS.gradientPrimary}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">About Me</h2>
                    <p className="text-white/80 text-sm">Tell us about yourself</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={6}
                        className="text-lg resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {user.bio ? (
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          {user.bio}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.accent }} />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          No bio available. Click edit to add information about yourself.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="sticky bottom-8 z-40 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={`px-6 py-3 ${GRADIENTS.gradientAccent} text-white`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`px-8 py-3 text-lg font-semibold ${GRADIENTS.gradientPrimary} text-white min-w-[180px]`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}