import React, { Suspense } from "react";
import CreateAdmin from "./components/CreateAdmin";
import ShowAdmin from "./components/ShowAdmin";

const AdminsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <CreateAdmin />
          </Suspense>
        </div>
        
        <div className="w-full lg:w-2/3">
          <ShowAdmin />
        </div>
      </div>
    </div>
  );
};

export default AdminsPage;