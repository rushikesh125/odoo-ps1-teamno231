import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config";
import { generateRandomId } from "@/lib/constant";

export const updateAdmin = async (data) => {
  if (!data.adminName) {
    throw new Error("Admin Name is required");
  }
  if (!data.adminEmail) {
    throw new Error("Admin Email is required");
  }
  if(!data.id){
    throw new Error("ID is Required")
  }
 const randID = data.id
  try {
    await updateDoc(doc(db, "admins", data.adminEmail), {
      adminName: data.adminName,
      adminEmail: data.adminEmail,
      id:randID,
    });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};