import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  Camera, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar,
  Link as LinkIcon,
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
  Settings
} from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (err: any) {
      notification.error('Failed to load profile', err.message || 'Please try again later');
    } finally {
      setLoading(false);
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
          <Button onClick={loadProfile} className={BUTTON_STYLES.primary}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Complete overview of your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12 text-white relative">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-white/80" />
                  )}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <div className="text-center">
                    <Camera className="w-6 h-6 mx-auto mb-1" />
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
                <h2 className="text-3xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-white/90 text-lg mb-2">{user.email}</p>
                {user.currentPosition && (
                  <p className="text-white/80 flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-4 h-4" />
                    {user.currentPosition}{user.company && ` at ${user.company}`}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, link }: { icon: any, label: string, value: string | undefined, link?: string }) => {
    if (!value) return null;
    
    const content = (
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700">
        <div className="p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex-shrink-0">
          <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
        {link && (
          <LinkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </div>
    );
    
    return link ? (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform">
        {content}
      </a>
    ) : content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">My Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
              {/* Profile Header with Gradient */}
              <div className="h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700"></div>
              
              {/* Profile Picture */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-16">
                  <div className="relative group">
                    <img
                      src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=200&background=667eea&color=fff`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover ring-4 ring-purple-100 dark:ring-purple-900/30"
                    />
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 rounded-full p-2.5 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-all transform hover:scale-110 ring-2 ring-purple-500"
                    >
                      <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                        disabled={uploading}
                      />
                    </label>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white text-center">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{user?.email}</p>
                  
                  {/* Status Badges */}
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      user?.role === 'admin' 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user?.role?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      user?.isEmailVerified 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                        : 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md'
                    }`}>
                      {user?.isEmailVerified ? '✓ Verified' : '⚠ Unverified'}
                    </span>
                  </div>

                  {/* Bio */}
                  {user?.bio && !isEditing && (
                    <div className="mt-6 w-full p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Account Info */}
                  <div className="mt-6 w-full space-y-3">
                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Member since
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    {user?.lastLoginAt && (
                      <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          Last active
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {new Date(user.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Information & Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Bar */}
            <div className="flex justify-end">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setIsEditing(false); loadProfile(); }}
                    variant="outline"
                    className="px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 border-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <>
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={Mail} label="Email" value={user?.email} />
                    <InfoItem icon={Phone} label="Phone" value={user?.phoneNumber} />
                    <InfoItem icon={Calendar} label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : undefined} />
                    <InfoItem icon={UserIcon} label="Age" value={user?.age?.toString()} />
                    <InfoItem icon={UserIcon} label="Gender" value={user?.gender} />
                  </div>
                </div>

                {/* Professional Information */}
                {(user?.currentPosition || user?.company) && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      Professional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem icon={Briefcase} label="Position" value={user?.currentPosition} />
                      <InfoItem icon={Briefcase} label="Company" value={user?.company} />
                    </div>
                  </div>
                )}

                {/* Location */}
                {(user?.city || user?.state || user?.country) && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoItem icon={MapPin} label="City" value={user?.city} />
                      <InfoItem icon={MapPin} label="State" value={user?.state} />
                      <InfoItem icon={MapPin} label="Country" value={user?.country} />
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(user?.linkedinProfile || user?.githubProfile || user?.website) && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-purple-600" />
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <InfoItem icon={Linkedin} label="LinkedIn" value={user?.linkedinProfile} link={user?.linkedinProfile} />
                      <InfoItem icon={Github} label="GitHub" value={user?.githubProfile} link={user?.githubProfile} />
                      <InfoItem icon={Globe} label="Website" value={user?.website} link={user?.website} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={handleInputChange}
                      min={1}
                      max={150}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                      placeholder="Software Developer"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Tech Corp"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="USA"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                    <Input
                      id="linkedinProfile"
                      name="linkedinProfile"
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubProfile">GitHub Profile</Label>
                    <Input
                      id="githubProfile"
                      name="githubProfile"
                      type="url"
                      value={formData.githubProfile}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About Me</h3>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={5}
                  className="resize-none"
                />
              </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
