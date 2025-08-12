// components/user/UserProfile.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Edit3, Save, X, Eye, EyeOff, Calendar, Camera } from 'lucide-react';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { uploadImageToImgBB } from '@/lib/imgbb';

const UserProfile = () => {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    avatar: null,
    avatarPreview: null,
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
        avatarPreview: user.photoURL || null
      }));
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (profileData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (profileData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(profileData.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }
    
    // Email validation
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    // Old password validation
    if (profileData.newPassword || profileData.confirmNewPassword) {
      if (!profileData.oldPassword) {
        newErrors.oldPassword = 'Current password is required to change password';
      }
      
      // New password validation
      if (profileData.newPassword) {
        if (profileData.newPassword.length < 8) {
          newErrors.newPassword = 'New password must be at least 8 characters';
        } else if (profileData.newPassword.length > 128) {
          newErrors.newPassword = 'New password is too long';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(profileData.newPassword)) {
          newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
        }
      }
      
      // Confirm password validation
      if (profileData.newPassword !== profileData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      }));
      
      if (errors.avatar) {
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  const reauthenticateUser = async (password) => {
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return { success: true };
    } catch (error) {
      console.error('Reauthentication error:', error);
      return { success: false, error: 'Current password is incorrect' };
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm() || !validatePasswordForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      let avatarUrl = profileData.avatarPreview;
      
      // Upload new avatar if provided
      if (profileData.avatar) {
        const uploadResult = await uploadImageToImgBB(profileData.avatar);
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload avatar');
        }
      }
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.fullName,
        photoURL: avatarUrl
      });
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName: profileData.fullName,
        avatarUrl: avatarUrl || ''
      });
      
      // Update email if changed (requires reauthentication)
      if (profileData.email !== user.email) {
        if (!profileData.oldPassword) {
          throw new Error('Current password is required to change email');
        }
        
        const reauthResult = await reauthenticateUser(profileData.oldPassword);
        if (!reauthResult.success) {
          throw new Error(reauthResult.error);
        }
        
        await updateEmail(auth.currentUser, profileData.email);
        
        // Update email in Firestore
        await updateDoc(userDocRef, {
          email: profileData.email
        });
      }
      
      // Update password if provided (requires reauthentication)
      if (profileData.newPassword) {
        if (!profileData.oldPassword) {
          throw new Error('Current password is required to change password');
        }
        
        // Reauthenticate again if not already done for email change
        if (profileData.email === user.email) {
          const reauthResult = await reauthenticateUser(profileData.oldPassword);
          if (!reauthResult.success) {
            throw new Error(reauthResult.error);
          }
        }
        
        await updatePassword(auth.currentUser, profileData.newPassword);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Reset password fields
      setProfileData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
    } catch (error) {
      console.error('Profile update error:', error);
      let errorMessage = error.message || 'Failed to update profile';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to make these changes';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setProfileData(prev => ({
      ...prev,
      fullName: user.displayName || '',
      email: user.email || '',
      avatarPreview: user.photoURL || null,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }));
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Profile Header with Gradient */}
        <div className="bg-gradient-to-r from-theme-purple to-theme-purple px-6 py-8 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              {profileData.avatarPreview ? (
                <img
                  className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
                  src={profileData.avatarPreview}
                  alt="Profile"
                />
              ) : (
                <div className="bg-white/20 border-2 border-dashed border-white rounded-full w-28 h-28 flex items-center justify-center">
                  <User className="h-14 w-14 text-white" />
                </div>
              )}
              {isEditing && (
                <label 
                  htmlFor="avatar"
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Camera className="h-5 w-5 text-theme-purple" />
                </label>
              )}
            </div>
            
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl font-bold">{user.displayName || 'User'}</h1>
              <p className="text-lg opacity-90 mt-1">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start mt-3">
                <Calendar className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-sm opacity-80">
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-end">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-all shadow-md hover:shadow-lg"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-all shadow-sm"
                >
                  <X className="mr-2 h-5 w-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple disabled:opacity-75 transition-all shadow-md hover:shadow-lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 py-8">
          <div className="space-y-10">
            {/* Profile Information Card */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-theme-purple" />
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border ${
                          errors.fullName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-purple focus:border-theme-purple transition-all`}
                      />
                      {errors.fullName && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="w-5 h-5 mr-1">⚠</span> {errors.fullName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.displayName || 'Not set'}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 px-4 py-3 border ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-purple focus:border-theme-purple transition-all`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="w-5 h-5 mr-1">⚠</span> {errors.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {profileData.avatarPreview ? (
                          <img
                            className="h-16 w-16 rounded-full object-cover border-2 border-theme-purple"
                            src={profileData.avatarPreview}
                            alt="Avatar preview"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-5">
                        <div className="relative">
                          <input
                            id="avatar"
                            name="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="avatar"
                            className="cursor-pointer inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-all"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            Change Photo
                          </label>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          JPG, PNG, GIF or WEBP. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Password Section Card */}
            {isEditing && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Lock className="h-6 w-6 mr-3 text-theme-purple" />
                  Change Password
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Old Password */}
                  <div className="md:col-span-2">
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        id="oldPassword"
                        value={profileData.oldPassword}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.oldPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-purple focus:border-theme-purple transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-5 h-5 mr-1">⚠</span> {errors.oldPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        value={profileData.newPassword}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.newPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-purple focus:border-theme-purple transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-5 h-5 mr-1">⚠</span> {errors.newPassword}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  
                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        id="confirmNewPassword"
                        value={profileData.confirmNewPassword}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-purple focus:border-theme-purple transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmNewPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-5 h-5 mr-1">⚠</span> {errors.confirmNewPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;