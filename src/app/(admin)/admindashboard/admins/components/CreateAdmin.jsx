"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdmins } from "@/firebase/admins/read_server";
import { updateAdmin } from "@/firebase/admins/update";
import { createAdmin } from "@/firebase/admins/write";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { User, Mail } from "lucide-react";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    adminName: "",
    adminEmail: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const idFromParams = searchParams.get("id");
    if (idFromParams) {
      setId(idFromParams);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fetchAdmins = async () => {
    try {
      const res = await getAdmins({ id });
      if (!res) {
        toast.error("Failed to fetch admin details");
      } else {
        setFormData(res);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdmins();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    // e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await updateAdmin(formData);
        toast.success("Admin updated successfully!");
      } else {
        await createAdmin(formData);
        toast.success("Admin created successfully!");
      }
      setFormData({ adminName: "", adminEmail: "" });
      setId();
      router.push("/admindashboard/admins");
    } catch (error) {
      toast.error(error.message || "Failed to process the request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-0 pt-6 px-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {id ? "Update Admin" : "Create New Admin"}
          </h2>
          {/* <p className="text-gray-500 text-sm">
            {id ? "Modify admin details" : "Add a new administrator"}
          </p> */}
        </CardHeader>
        
        <CardBody className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="adminName" className="text-gray-700 text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  placeholder="Enter admin name"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="pl-10 h-12 w-full border-gray-300 rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="adminEmail" className="text-gray-700 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  placeholder="Enter admin email"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="pl-10 h-12 w-full border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </form>
        </CardBody>
        
        <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            onPress={handleSubmit}
            className="w-full bg-theme-purple text-white rounded-lg hover:opacity-90 transition-opacity h-12"
          >
            {id ? "Update Admin" : "Create Admin"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdmin;