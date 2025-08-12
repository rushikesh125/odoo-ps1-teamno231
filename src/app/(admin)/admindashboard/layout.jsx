'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  User,
  Layers,
  Shield,
  ShieldUser,
  UserCheckIcon,
  UserCog,
  UserStar,
  SquareChartGantt,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import UserDropdown from '@/components/UserDropdown';
import { onAuthStateChanged } from 'firebase/auth';
import { addUser, clearUser } from '@/store/userSlice';
import Link from 'next/link';

export default function OwnerDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const user = useSelector((state) => state.user);

  const handleLogout = () => {
    try {
      // dispatch(logout());
      // toast.success('Logged out successfully');
      // router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { name: 'Admin Dashboard', icon: ShieldUser, href: '/admindashboard' },
    { name: 'Admins ', icon: Users, href: '/admindashboard/admins' },
    { name: 'Facilities', icon: SquareChartGantt, href: '/admindashboard/facilities' },
    { name: 'Reviews', icon: UserStar, href: '/admindashboard/reviews' },
    { name: 'Customer Bookings', icon: UserCheckIcon, href: '/admindashboard/bookings' },
    { name: 'Users', icon: UserCog, href: '/admindashboard/users' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //  useEffect(() => {
  //         const unsubscribe = onAuthStateChanged(auth, (user) => {
  //             if (user) {
  //                 let tempuser = {
  //                     uid: user?.uid,
  //                     displayName: user?.displayName,
  //                     email: user.email,
  //                     photoURL: user.photoURL,
  //                     role: user.role
  //                 };
  //                 dispatch(addUser(tempuser));
  //             } else {
  //                 dispatch(clearUser());
  //             }
  //         });
  //         return () => unsubscribe();
  //     }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:w-60`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Layers className="text-theme-purple" size={24} />
            </div>
            <Link href={`/`} className="text-xl font-semibold text-theme-purple tracking-tight">QUICKCOURT</Link>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center p-3 rounded-xl text-gray-600 0 hover:text-theme-purple transition-all duration-200 group"
                >
                  <item.icon
                    size={20}
                    className="mr-3 text-gray-500 group-hover:text-indigo-600"
                  />
                  <span className="font-medium">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name || 'Owner'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@quickcourt.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu Toggle */}
            <div className="flex items-center">
              <button
                className="mr-3 text-gray-600 lg:hidden hover:text-indigo-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Bar (Medium+ screens) */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-56 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300 text-sm transition-all"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="ml-2">
                <UserDropdown user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}