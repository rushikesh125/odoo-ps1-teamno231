"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, Search } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, addUser } from "@/store/userSlice";
import UserDropdown from "./UserDropdown";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let tempuser = {
          uid: user?.uid,
          displayName: user?.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: user.role
        };
        dispatch(addUser(tempuser));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Facilities", href: "/facilities" },
    { name: "Bookings", href: "/bookings" },
  ];

  const isActive = (path) => pathname === path;
  
  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-lg border-b border-slate-700/[0.10] ${
        isScrolled ? "bg-white/90 py-2 shadow-sm" : "bg-white/80 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl flex items-center font-bold text-theme-purple"
            >
              <h1 className="text-xl md:text-2xl font-bold">
                QUICKCOURT
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
            <div className="flex items-center space-x-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-white bg-theme-purple shadow-md hover:shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side items: Search & Login */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-4 pr-10 py-2 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-theme-purple border border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-theme-purple"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Login Link */}
            {!user ? (
              <Link
                href="/login"
                className="cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-full text-base font-medium text-white bg-theme-purple hover:shadow-lg transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            ) : (
              <UserDropdown user={user} />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            {!user ? (
              <Link
                href="/login"
                className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-white bg-theme-purple hover:shadow-lg transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            ) : (
              <UserDropdown user={user} />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3 bg-white/90 backdrop-blur-md">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-4 pr-10 py-2 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-theme-purple border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-theme-purple"
            >
              <Search size={18} />
            </button>
          </form>

          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-4 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? "text-white bg-theme-purple shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;