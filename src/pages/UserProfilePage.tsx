import { useState, useEffect } from 'react';
import { User, UpdateProfileDto } from '@/types/user';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { GRADIENTS } from '@/constants';
import {
  Camera,
  User as UserIcon,
  Phone,
  MapPin,
  Edit3,
  GraduationCap,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Mail,
  Building2,
  Trophy,
  History,
  Share2,
  Link,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3H21.017V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3 21L3 18C3 16.8954 3.89543 16 5 16H8C8.55228 16 9 15.5523 9 15V9C9 8.44772 8.55228 8 8 8H5C3.89543 8 3 7.10457 3 6V3H10V15C10 18.3137 7.31371 21 4 21H3Z" />
  </svg>
);

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'social'>('profile');
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
    visitorType: undefined,
    university: '',
    degree: '',
    major: '',
    graduationYear: undefined,
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
      setUser(userData);

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
      notification.error('Failed to load profile', err.message || 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'age' || name === 'graduationYear' || name === 'teachingExperience'
          ? (value ? Number(value) : undefined)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      notification.success('Success!', 'Your professional identity has been updated');
    } catch (err: any) {
      notification.error('Update failed', err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notification.error('File too large', 'File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const updatedUser = await userService.uploadProfilePicture(file);
      setUser(updatedUser);
      notification.success('Success!', 'Profile picture updated');
    } catch (err: any) {
      notification.error('Upload failed', err.message || 'Unable to update photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const ProfilePicture = ({ showUpload = false }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const imageUrl = user?.profilePicture?.startsWith('http')
      ? user.profilePicture
      : `${baseUrl}${user?.profilePicture}`;

    return (
      <div className="relative group">
        <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover:scale-105">
          {user?.profilePicture ? (
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${GRADIENTS.gradientPrimary}`}>
              <UserIcon className="w-16 h-16 text-white opacity-40 capitalize" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {showUpload && !uploading && (
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all border-2 border-white dark:border-slate-800">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
          </label>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronizing Profile</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 lg:pt-10 relative z-10">
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* Sidebar / Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none p-6 lg:p-10 border border-white dark:border-slate-800 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

              <ProfilePicture showUpload={isEditing} />

              <div className="mt-8">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-slate-500 font-bold flex items-center justify-center gap-2 mt-2 text-xs lg:text-sm truncate px-4">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {user?.email}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-600/30 uppercase tracking-widest ring-4 ring-blue-600/10">
                    {user?.visitorType || 'Member'}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-widest ring-4 ring-amber-500/10">
                      Staff
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 space-y-2.5">
                {[
                  { id: 'profile', label: 'Basic Info', icon: UserIcon },
                  { id: 'academic', label: user?.visitorType === 'teacher' ? 'Teaching' : 'Academic', icon: GraduationCap },
                  { id: 'social', label: 'Connections', icon: Globe },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-5 lg:px-6 py-3.5 lg:py-4 rounded-2xl lg:rounded-[1.5rem] transition-all duration-300 font-bold text-sm group ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1 ring-2 ring-blue-600/5'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`} />
                      {tab.label}
                    </div>
                    {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                <div className="flex items-center gap-2"><History className="w-3.5 h-3.5" /> Est. {new Date(user!.createdAt).getFullYear()}</div>
                <div>Hash: {user?._id.slice(-6)}</div>
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full h-16 rounded-[2rem] bg-slate-900 dark:bg-blue-600 text-white shadow-2xl hover:scale-[1.02] transition-all font-black text-lg uppercase tracking-widest"
              >
                <Edit3 className="w-5 h-5 mr-3" /> Edit Personal Data
              </Button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (isEditing ? '-edit' : '-view')}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800/50 overflow-hidden"
              >
                <div className="p-6 lg:p-14">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 lg:mb-16 pb-6 lg:pb-8 border-b border-slate-50 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 font-black text-sm">
                          {activeTab === 'profile' && <UserIcon className="w-4 h-4" />}
                          {activeTab === 'academic' && <GraduationCap className="w-4 h-4" />}
                          {activeTab === 'social' && <Globe className="w-4 h-4" />}
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {activeTab === 'profile' && 'Identity & Personal'}
                          {activeTab === 'academic' && 'Professional Track'}
                          {activeTab === 'social' && 'Global Networking'}
                        </h2>
                      </div>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        {isEditing ? 'Modification Protocol' : 'Verified Information'}
                      </p>
                    </div>
                    {isEditing && (
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl px-6 h-12 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 w-full sm:w-auto order-2 sm:order-1">Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving} className={`rounded-2xl px-10 h-12 ${GRADIENTS.gradientPrimary} text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/30 w-full sm:w-auto order-1 sm:order-2`}>
                          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Changes'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'profile' && (
                    <div className="space-y-12">
                      <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                        {[
                          { name: 'firstName', label: 'Legal First Name', val: user?.firstName },
                          { name: 'lastName', label: 'Legal Last Name', val: user?.lastName },
                          { name: 'phoneNumber', label: 'Communication Line', val: user?.phoneNumber, icon: Phone },
                          { name: 'dateOfBirth', label: 'Temporal Entry (DOB)', val: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '--', type: 'date' },
                          { name: 'gender', label: 'Gender Identity', val: user?.gender, type: 'select', opts: ['male', 'female', 'other'] },
                          { name: 'age', label: 'Chronological Age', val: user?.age, type: 'number' },
                        ].map((field) => (
                          <div key={field.name} className="space-y-3 relative">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                              {field.label}
                            </Label>
                            {isEditing ? (
                              field.type === 'select' ? (
                                <select
                                  name={field.name}
                                  value={(formData as any)[field.name]}
                                  onChange={handleInputChange}
                                  className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm appearance-none cursor-pointer"
                                >
                                  <option value="">Choose...</option>
                                  {field.opts?.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                                </select>
                              ) : (
                                <Input
                                  name={field.name}
                                  type={field.type || 'text'}
                                  value={(formData as any)[field.name]}
                                  onChange={handleInputChange}
                                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm"
                                />
                              )
                            ) : (
                              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 group relative border border-slate-100/50 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg">
                                {field.val || field.val === 0 ? (field.val) : '--'}
                                {field.icon && <field.icon className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />}
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="md:col-span-2 space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Geographical Anchor</Label>
                          {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <Input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              <Input name="state" placeholder="State/Prov" value={formData.state} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              <Input name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                            </div>
                          ) : (
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 border border-slate-100/50 dark:border-slate-800 flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-500/60" />
                              {user?.city}{user?.city && (user?.state || user?.country) ? ', ' : ''}{user?.state}{user?.state && user?.country ? ', ' : ''}{user?.country}
                              {!user?.city && !user?.state && !user?.country && '--'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 pt-10 border-t border-slate-50 dark:border-slate-800">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Personal Narrative (Bio)</Label>
                        {isEditing ? (
                          <div className="relative">
                            <Textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              placeholder="Define your trajectory..."
                              className="h-44 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold p-8 resize-none leading-relaxed text-sm"
                            />
                            <div className="absolute right-4 bottom-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{formData.bio?.length || 0}/500</div>
                          </div>
                        ) : (
                          <div className="p-6 lg:p-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] lg:rounded-[2.5rem] text-slate-500 dark:text-slate-400 leading-[1.8] font-medium italic text-base lg:text-lg relative group border border-slate-100 dark:border-slate-800/50">
                            <div className="absolute top-0 left-0 w-8 h-8 opacity-10 p-1"><QuoteIcon /></div>
                            {user?.bio || 'Professional summary pending initialization.'}
                            <div className="absolute bottom-4 right-8 w-12 h-1 bg-blue-600/20 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'academic' && (
                    <div className="space-y-12">
                      <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
                        {user?.visitorType === 'student' ? (
                          <>
                            <div className="space-y-3 md:col-span-2">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Educational Institution</Label>
                              {isEditing ? (
                                <div className="relative">
                                  <Input name="university" value={formData.university} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-12 text-sm" />
                                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                </div>
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 border border-slate-100/50 flex items-center gap-4">
                                  <Building2 className="w-5 h-5 text-blue-500/50" />
                                  {user?.university || '--'}
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Degree Program</Label>
                              {isEditing ? (
                                <Input name="degree" value={formData.degree} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200">{user?.degree || '--'}</div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Major Specialization</Label>
                              {isEditing ? (
                                <Input name="major" value={formData.major} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200">{user?.major || '--'}</div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Graduation Horizon</Label>
                              {isEditing ? (
                                <Input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200">{user?.graduationYear || '--'} Candidate</div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Designation</Label>
                              {isEditing ? (
                                <Input name="designation" value={formData.designation} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200">{user?.designation || '--'}</div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Department Cluster</Label>
                              {isEditing ? (
                                <Input name="department" value={formData.department} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200">{user?.department || '--'}</div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Experiential Tenure (Yrs)</Label>
                              {isEditing ? (
                                <Input type="number" name="teachingExperience" value={formData.teachingExperience} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                              ) : (
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                                  <span>{user?.teachingExperience || '0'} Years</span>
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Specialization Matrix</Label>
                              {isEditing ? (
                                <Input
                                  placeholder="AI, ML, DBMS (Split by comma)"
                                  value={formData.specialization?.join(', ')}
                                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value.split(',').map(s => s.trim()) }))}
                                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm"
                                />
                              ) : (
                                <div className="flex flex-wrap gap-2.5">
                                  {user?.specialization?.map(s => (
                                    <span key={s} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-black rounded-lg border border-blue-100/50 dark:border-blue-900 shadow-sm uppercase tracking-tighter">
                                      {s}
                                    </span>
                                  )) || '--'}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="pt-10 border-t border-slate-50 dark:border-slate-800 grid md:grid-cols-2 gap-x-10 gap-y-10">
                        <div className="space-y-3 md:col-span-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 ml-1">Professional Identity</Label>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Current Position</Label>
                          {isEditing ? (
                            <Input name="currentPosition" value={formData.currentPosition} onChange={handleInputChange} placeholder="e.g. Lead Researcher" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                          ) : (
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 flex items-center gap-3">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              {user?.currentPosition || '--'}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Active Organization</Label>
                          {isEditing ? (
                            <Input name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g. University of Washington" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-6 text-sm" />
                          ) : (
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl font-black text-slate-700 dark:text-slate-200 flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              {user?.company || '--'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'social' && (
                    <div className="space-y-10 max-w-2xl">
                      <div className="grid gap-10">
                        {[
                          { name: 'linkedinProfile', label: 'LinkedIn Professional URL', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-900/20' },
                          { name: 'githubProfile', label: 'GitHub Intelligence URL', icon: Github, color: 'text-slate-900', darkColor: 'text-white', bg: 'bg-slate-100', darkBg: 'bg-slate-800' },
                          { name: 'website', label: 'Personal Portfolio Nexus', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-900/20' },
                        ].map((link) => (
                          <div key={link.name} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 group text-center sm:text-left">
                            <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] ${link.bg} dark:${link.darkBg} flex items-center justify-center ${link.color} dark:${link.darkColor || link.color} border border-transparent dark:border-slate-800 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                              <link.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                            </div>
                            <div className="flex-1 space-y-2 mt-1">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 leading-none">{link.label}</Label>
                              {isEditing ? (
                                <div className="relative">
                                  <Input
                                    name={link.name}
                                    value={(formData as any)[link.name]}
                                    onChange={handleInputChange}
                                    placeholder="https://"
                                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold px-12 text-sm"
                                  />
                                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                </div>
                              ) : (
                                <a
                                  href={(user as any)[link.name]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block font-black text-sm transition-all truncate hover:translate-x-1 ${(user as any)[link.name] ? 'text-blue-600 hover:text-blue-700 underline underline-offset-4' : 'text-slate-300 pointer-events-none'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {(user as any)[link.name] || 'Pending link registration'}
                                    {(user as any)[link.name] && <Share2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                  </div>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}