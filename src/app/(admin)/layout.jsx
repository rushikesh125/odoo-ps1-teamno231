// components/layout/AdminLayout.jsx
"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-hot-toast';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { addUser, clearUser } from "@/store/userSlice";
import NavBar from "@/components/Navbar";
import { isAdminExits } from "@/firebase/admins/read";
import { useRouter } from "next/navigation";

const AdminLayout = ({ children }) => {
    const user = useSelector((state) => state.user);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authStateChecked, setAuthStateChecked] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const router = useRouter();

    // Handle Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                let tempuser = {
                    uid: firebaseUser?.uid,
                    displayName: firebaseUser?.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                };
                dispatch(addUser(tempuser));
            } else {
                dispatch(clearUser());
            }
            setAuthStateChecked(true);
        });
        return () => unsubscribe();
    }, [dispatch]);

    // Check if user is admin - only run after auth state is checked
    useEffect(() => {
        const checkAdminStatus = async () => {
            // Don't run until Firebase auth state is determined
            if (!authStateChecked) return;
            
            // If no user, they're not an admin
            if (!user || !user.email) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const adminExists = await isAdminExits(user.email);
                setIsAdmin(adminExists);
            } catch (err) {
                console.error('Error checking admin status:', err);
                setError('Failed to verify admin status');
                toast.error('Failed to verify admin status');
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user, authStateChecked]); // Depend on both user and authStateChecked

    // Show loading state while checking auth and admin status
    // if (loading || !authStateChecked) {
    //     return (
    //         <div className="h-screen w-screen flex justify-center items-center">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    //         </div>
    //     );
    // }

    // Show login prompt if user is not logged in
    if (!user) {
        return (
            <>
                <NavBar />
                <div className="py-20 h-screen w-screen flex justify-center items-center gap-2 flex-col text-2xl text-accent-color">
                    <div className="text-center">You are not logged in. Please login.</div>
                    <Link
                        href={`/login`}
                        className="bg-theme-purple text-white hover:bg-theme-purple/90 rounded-md py-2 px-4 mt-4 transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </>
        );
    }

    // Show error if failed to verify admin status
    if (error) {
        return (
            <div className="h-screen w-screen flex justify-center items-center gap-2 flex-col text-xl text-red-500">
                <div className="text-center">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-theme-purple text-white hover:bg-theme-purple/90 rounded-md py-2 px-4 mt-4 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Render admin content if user is admin
    if (isAdmin) {
        return (
            <div>
                {children}
            </div>
        );
    }

    // Show access denied for non-admin users
    return (
        <>
            <NavBar />
            <div className="py-20 h-screen w-screen flex justify-center items-center gap-2 flex-col text-2xl text-accent-color">
                <div className="text-center">You are not logged in as Admin</div>
                <Link
                    href={`/`}
                    className="bg-theme-purple text-white hover:bg-theme-purple/90 rounded-md py-2 px-4 mt-4 transition-colors"
                >
                    Go to Home
                </Link>
            </div>
        </>
    );
};

export default AdminLayout;