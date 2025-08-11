"use client";
import Link from "next/link";
import React from "react";

import { useSelector } from "react-redux";

const UserLayout = ({ children }) => {
  const user = useSelector((state) => state.user);
  if (!user) {
    return (
      <div className="h-screen w-screen flex justify-center items-center gap-2 flex-col text-2xl text-accent-color">
       <div className="text-center"> Your Are not Logged In , Login in Please</div>
       {/* <Link href={`/login`} className="bg-slate-100 hover:bg-slate-200 rounded-md py-1 px-2">Login</Link> */}
      </div>
    );
  }
  return (
    <>
      <main>{children}</main>
    </>
  );
};

export default UserLayout;