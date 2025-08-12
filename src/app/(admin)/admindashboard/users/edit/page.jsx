"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase/user/read';
import { updateUser } from '@/firebase/user/update';
import { toast } from 'react-hot-toast';
import { Loader2, Save, ArrowLeft, User, Image, Key, ChevronDown, XCircle } from 'lucide-react';
import Link from 'next/link';

const EditUser = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { data: user, isLoading: isUserLoading } = useUser({ uid: id });
  const [formData, setFormData] = useState({
    displayName: '',
    fullName: '',
    avatarUrl: '',
    role: 'user',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        fullName: user.fullName || '',
        avatarUrl: user.avatarUrl || '',
        role: user.role || 'user',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }

    if (formData.avatarUrl && !/^https?:\/\/.*/.test(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Please provide a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(id, formData);
      toast.success('User details updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Edit User</h1>
            <Link href="/admindashboard/users" className="flex items-center text-white hover:text-indigo-200 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </div>
          <p className="mt-2 text-indigo-100 text-sm">Update user details for ID: {id}</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                      placeholder="Enter display name"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.displayName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="h-4 w-4 mr-1">⚠</span> {errors.displayName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                      placeholder="Enter full name"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="h-4 w-4 mr-1">⚠</span> {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="avatarUrl"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.avatarUrl ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <Image className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.avatarUrl && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="h-4 w-4 mr-1">⚠</span> {errors.avatarUrl}
                    </p>
                  )}
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar Preview"
                      className="mt-3 h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      onError={(e) => (e.target.src = '/placeholder-avatar.png')} // Fallback image
                    />
                  ) : (
                    <div className="mt-3 h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none"
                    >
                      <option value="user">User</option>
                      <option value="facility_owner">Facility Owner</option>
                      <option value="ban">Banned</option>
                    </select>
                    <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admindashboard/users')}
                disabled={isSaving}
                className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all shadow-md"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-md"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;