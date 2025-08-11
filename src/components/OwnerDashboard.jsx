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
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';

export default function OwnerDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
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
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Users', icon: Users, href: '/dashboard/users' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Documents', icon: FileText, href: '/dashboard/documents' },
    { name: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { name: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Close sidebar when resizing to large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-gray-700 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">Dashboard</span>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center p-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              {user?.name?.charAt(0) || <User size={20} />}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 w-64 text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>

              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  {user?.name?.charAt(0) || <User size={18} />}
                </div>
                <span className="ml-2 hidden md:inline text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}