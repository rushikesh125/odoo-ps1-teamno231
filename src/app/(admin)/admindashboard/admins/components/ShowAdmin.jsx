"use client";
import React, { useState } from "react";
import { EditIcon, TrashIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAdmins } from "@/firebase/admins/read";
import { deleteAdmin } from "@/firebase/admins/delete";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

const ShowAdmin = () => {
  const { data: admins, error, isLoading } = useAdmins();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardBody className="text-center py-10">
          <div className="text-red-500 font-medium">Error Occurred</div>
          <p className="text-gray-500 mt-2">Failed to load admin data</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
              <p className="text-gray-500 text-sm">Manage system administrators</p>
            </div>
            <Chip className="bg-purple-100 text-purple-800">
              {admins?.length || 0} Admins
            </Chip>
          </div>
        </CardHeader>
        
        <CardBody className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins?.map((item, index) => (
                  <AdminRow item={item} index={index} key={index} />
                ))}
              </tbody>
            </table>
          </div>
          
          {!admins?.length && (
            <div className="text-center py-10">
              <div className="text-gray-400">No admins found</div>
              <p className="text-gray-500 mt-1">Create your first admin to get started</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ShowAdmin;

const AdminRow = ({ item, index }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      setIsLoading(true);
      await deleteAdmin({ id: `${item?.adminEmail}` });
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to delete admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    router.push(`/admindashboard/admins?id=${item?.adminEmail}`);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <Avatar 
              name={item?.adminName} 
              className="bg-purple-100 text-purple-800"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item?.adminName}</div>
            <div className="text-sm text-gray-500">Admin</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{item?.adminEmail}</div>
        <div className="text-sm text-gray-500">Active</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Button
            isIconOnly
            onPress={handleUpdate}
            className="bg-blue-50 hover:bg-blue-100 p-2 rounded-lg"
            aria-label="Edit admin"
          >
            <EditIcon className="text-blue-600 h-4 w-4" />
          </Button>
          <Button
            isIconOnly
            onClick={handleDelete}
            isLoading={isLoading}
            className="bg-red-50 hover:bg-red-100 p-2 rounded-lg"
            aria-label="Delete admin"
          >
            <TrashIcon className="text-red-600 h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};