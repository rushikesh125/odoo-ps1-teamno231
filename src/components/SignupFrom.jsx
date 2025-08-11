// components/signup/SignupForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Upload, Building, UserCircle, Eye, EyeOff } from 'lucide-react';
import { createUser } from '@/firebase/user/write';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { useDispatch } from 'react-redux';
import { addUser } from '@/store/userSlice';

const SignupForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    avatar: null,
    avatarPreview: null
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email is too long';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password is too long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    } else if (!['user', 'facility_owner'].includes(formData.role)) {
      newErrors.role = 'Invalid role selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
      
      setFormData(prev => ({
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

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      let avatarUrl = '';
      
      // Upload avatar if provided
      if (formData.avatar) {
        const uploadResult = await uploadImageToImgBB(formData.avatar);
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload avatar');
        }
      }
      
      // Create user in Firebase
      const result = await createUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        avatarUrl,
        role: formData.role
      });
      
      if (result.success) {
        dispatch(addUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role:result.user.role,
          emailVerified: result.user.emailVerified
        }));
        
        toast.success('Account created successfully');
        router.push('/dashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-purple">Create Account</h2>
        <p className="mt-2 text-gray-600">Join our community today</p>
      </div>
      
      <form onSubmit={handleSignup} className="mt-8 space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-theme-purple focus:border-theme-purple`}
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-theme-purple focus:border-theme-purple`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-theme-purple focus:border-theme-purple`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>
        
        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-theme-purple focus:border-theme-purple`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          <div className="mt-1 flex items-center">
            <div className="flex-shrink-0">
              {formData.avatarPreview ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={formData.avatarPreview}
                  alt="Avatar preview"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-5 rounded-md shadow-sm">
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
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple"
                >
                  <Upload className="mr-2 h-5 w-5 text-gray-500" />
                  Upload
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
              className={`relative inline-flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                formData.role === 'user'
                  ? 'border-theme-purple bg-theme-purple/10 text-theme-purple'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="mr-2 h-5 w-5" />
              User
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'facility_owner' }))}
              className={`relative inline-flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                formData.role === 'facility_owner'
                  ? 'border-theme-purple bg-theme-purple/10 text-theme-purple'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building className="mr-2 h-5 w-5" />
              Facility Owner
            </button>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-theme-purple hover:bg-theme-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="font-medium text-theme-purple hover:text-theme-purple/80"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;