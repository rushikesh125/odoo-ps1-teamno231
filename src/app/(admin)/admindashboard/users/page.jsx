"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAllUsers } from '@/firebase/user/read';
import { updateUserRole } from '@/firebase/user/update'; // Adjust path as needed
import { toast } from 'react-hot-toast';
import { Edit, Ban, UserPlus, Loader2, ChevronLeft, ChevronRight, UserCircle, Search } from 'lucide-react';

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 30];
const ROLE_OPTIONS = ['all', 'user', 'facility_owner', 'ban'];

const AdminUsersPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [lastSnapDocStack, setLastSnapDocStack] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isUpdatingRole, setIsUpdatingRole] = useState({});
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');

  const currentLastSnapDoc = currentPageIndex === 0 ? null : lastSnapDocStack[currentPageIndex - 1];

  const {
    data: users,
    lastSnapDoc: newLastSnapDoc,
    error,
    isLoading: isInitialLoading,
  } = useAllUsers({ pageLimit: itemsPerPage, lastSnapDoc: currentLastSnapDoc, role: selectedRole, searchTerm: searchEmail });

  const handleNextPage = () => {
    if (newLastSnapDoc) {
      setLastSnapDocStack(prev => [...prev, newLastSnapDoc]);
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setLastSnapDocStack(prev => prev.slice(0, -1));
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    setLastSnapDocStack([]);
    setCurrentPageIndex(0);
  }, [itemsPerPage, selectedRole, searchEmail]);

  const handleRoleChange = async (userId, newRole) => {
    if (isUpdatingRole[userId]) return;

    setIsUpdatingRole(prev => ({ ...prev, [userId]: true }));
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role.');
    } finally {
      setIsUpdatingRole(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  if (isInitialLoading && (!users || users.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  const hasNextPage = users && users.length === itemsPerPage && newLastSnapDoc !== null;
  const hasPreviousPage = currentPageIndex > 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-theme-purple px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Manage Users</h1>
            <p className="mt-2 text-indigo-100">
              View and manage users and facility owners.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-600 text-sm">Filter by role:</span>
            <select
              className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200 flex-1"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isInitialLoading}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by email..."
              className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200 pl-8 w-full"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              disabled={isInitialLoading}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="px-6 py-8">
          {users && users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={user.avatarUrl || '/placeholder-avatar.jpg'} alt="" className="h-8 w-8 rounded-full object-cover" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.displayName || user.fullName || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${user.role === 'facility_owner' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'ban' ? 'bg-red-100 text-red-800' :
                              user.role === 'user' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/admindashboard/users/edit?id=${user.id}`}
                              className="text-theme-purple hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>

                            {user.role !== 'ban' && (
                              <button
                                onClick={() => handleRoleChange(user.id, 'ban')}
                                disabled={isInitialLoading || isUpdatingRole[user.id]}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Ban User"
                                aria-label={`Ban ${user.displayName || 'user'}`}
                              >
                                {isUpdatingRole[user.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </button>
                            )}

                            {user.role === 'user' && (
                              <button
                                onClick={() => handleRoleChange(user.id, 'facility_owner')}
                                disabled={isInitialLoading || isUpdatingRole[user.id]}
                                className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                                title="Convert to Facility Owner"
                                aria-label={`Convert ${user.displayName || 'user'} to facility owner`}
                              >
                                {isUpdatingRole[user.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Items per page:</span>
                  <select
                    className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                    disabled={isInitialLoading}
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                      <option key={num} value={num}>{num} items</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage || isInitialLoading}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isInitialLoading}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{isInitialLoading ? 'Loading...' : 'No users found.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;