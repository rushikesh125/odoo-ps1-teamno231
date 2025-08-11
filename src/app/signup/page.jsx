// app/signup/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '@/components/SignupFrom';
import Image from 'next/image';
import { useSelector } from 'react-redux';

export default function SignupPage() {
  const router = useRouter();
  const user = useSelector(state=>state?.user)

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if ( user) {
      router.push('/dashboard');
    }
  }, [user, router]);

//   if (user == undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-purple"></div>
//       </div>
//     );
//   }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - SVG Image */}
      <div className="lg:w-1/2 relative hidden lg:flex items-center justify-center bg-theme-purple/5">
        <div className="w-3/4 h-3/4 relative">
          <Image
            src="/svg/login.svg"
            alt="Signup illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-theme-purple">Create Account</h1>
            <p className="mt-2 text-gray-600">Join our community today</p>
          </div>
          
          <SignupForm />
        </div>
      </div>
    </div>
  );
}