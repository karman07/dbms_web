import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
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
          <Button onClick={loadProfile} className={BUTTON_STYLES.gradient}>
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

          {/* Content Grid */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                      {user.isEmailVerified && <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />}
                    </div>
                  </div>

                  {user.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.phoneNumber}</p>
                        {user.isPhoneVerified && <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />}
                      </div>
                    </div>
                  )}

                  {user.age && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.age} years old</p>
                      </div>
                    </div>
                  )}

                  {user.gender && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{user.gender}</p>
                      </div>
                    </div>
                  )}

                  {user.dateOfBirth && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CakeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(user.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Professional
                </h3>
                
                <div className="space-y-4">
                  {user.currentPosition && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.currentPosition}</p>
                      </div>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.company}</p>
                      </div>
                    </div>
                  )}

                  {user.linkedinProfile && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Linkedin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                        <a 
                          href={user.linkedinProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                        >
                          {user.linkedinProfile}
                        </a>
                      </div>
                    </div>
                  )}

                  {user.githubProfile && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Github className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">GitHub</p>
                        <a 
                          href={user.githubProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                        >
                          {user.githubProfile}
                        </a>
                      </div>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                        >
                          {user.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location
                </h3>
                
                <div className="space-y-4">
                  {user.city && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.city}</p>
                      </div>
                    </div>
                  )}

                  {user.state && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">State</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.state}</p>
                      </div>
                    </div>
                  )}

                  {user.country && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-red-500" />
                  About Me
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-900 dark:text-white leading-relaxed">{user.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              Account Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
                <span className={`flex items-center gap-2 font-medium ${
                  user.isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {user.isEmailVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Phone Verified</span>
                <span className={`flex items-center gap-2 font-medium ${
                  user.isPhoneVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {user.isPhoneVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {user.isPhoneVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Google Signup</span>
                <span className={`flex items-center gap-2 font-medium ${
                  user.isGoogleSignup ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {user.isGoogleSignup ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                <span className={`flex items-center gap-2 font-medium ${
                  user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {user.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

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
      </div>
    </div>
  );
}