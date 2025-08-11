"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  // Data-driven footer sections for easier updates
  const links = {
    quickLinks: [
      { name: "Home", href: "/" },
      { name: "Venues", href: "/venues" },
      { name: "Bookings", href: "/my-bookings" },
      { name: "Contact", href: "/contact" },
    ],
    socialLinks: [
      { icon: Facebook, href: "https://facebook.com" },
      { icon: Twitter, href: "https://twitter.com" },
      { icon: Instagram, href: "https://instagram.com" },
    ],
    contact: {
      email: "support@quickcourt.com",
      phone: "+91 98765 43210",
    },
  };

  return (
     <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QUICKCOURT</h3>
              <p className="text-gray-600">
                Find players & venues nearby for your favorite sports.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Solutions</h4>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Booking</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Facilities</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h4>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-theme-purple">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500">&copy; 2023 QUICKCOURT. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
