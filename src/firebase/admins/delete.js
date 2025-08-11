import { db } from "../config";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export const deleteAdmin = async ({ id }) => {
  if (!id) {
    toast.error("ID is Required");
    return "id required";
  }
  
  try {
    // Use doc() to get the reference to the document you want to delete
    const docRef = doc(db, "admins", id);
    await deleteDoc(docRef); // Delete the document
    
    toast.success("Admin deleted successfully");
    return "deleted";
  } catch (error) {
    console.error("Error deleting document:", error);
    toast.error("Failed to delete Admin");
    return "error";
  }
};
