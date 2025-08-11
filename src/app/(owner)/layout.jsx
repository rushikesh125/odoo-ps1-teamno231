// components/layout/RootUserLayout.jsx
"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserRole } from '@/firebase/user/read';
import { toast } from 'react-hot-toast';
import CircularLoader from "@/app/loading";
// import OwnerDashboard from "@/components/OwnerDashboard";
// import UserDashboard from "@/components/UserDashboard";
// import OwnerDashboardLayout from "@/components/OwnerDashboard";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { addUser, clearUser } from "@/store/userSlice";
// import { NavBar } from "@/components/Navbar"
import { useRouter } from "next/navigation";
import NavBar from "@/components/Navbar";
import OwnerDashboardLayout from "@/components/OwnerDashboard";

const RootUserLayout = ({ children }) => {
    const user = useSelector((state) => state.user);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const router = useRouter()

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user || !user.uid) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const result = await getUserRole(user.uid);

                if (result.success) {
                    setRole(result.role);
                } else {
                    setError(result.error);
                    toast.error('Failed to load user role');
                }
            } catch (err) {
                console.error('Error fetching user role:', err);
                setError('Failed to load user information');
                toast.error('Failed to load user information');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user)
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

  

    // Show error if failed to fetch role
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

    // Render role-specific dashboard
    if (role === 'facility_owner') {
        return (
            <OwnerDashboardLayout>
                {children}
            </OwnerDashboardLayout>
        );
    }


    return (
        <>
            <NavBar />
            <div className="py-20 h-screen w-screen flex justify-center items-center gap-2 flex-col text-2xl text-accent-color">

                <div className="text-center">You are not logged in as Facility Owner.</div>
            </div>
        </>
    )
};

export default RootUserLayout;