// components/login/LoginForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { addUser } from '@/store/userSlice';
import { getUserById } from '@/firebase/user/read';

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getUserById(user.uid);
      
      if (userDoc.success) {
        dispatch(addUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role:user.role,
        }));
        
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message || 'Failed to login';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-purple">Sign In</h2>
        <p className="mt-2 text-gray-600">Welcome back! Please enter your details</p>
      </div>
      
      <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
        </div>
        
        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-sm font-medium text-theme-purple hover:text-theme-purple/80"
          >
            Forgot password?
          </button>
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-theme-purple hover:bg-theme-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="font-medium text-theme-purple hover:text-theme-purple/80"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;