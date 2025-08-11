import { doc, setDoc } from "firebase/firestore";
import { db } from "../config";
import { generateRandomId } from "@/lib/constant";

export const createAdmin = async (data) => {
  if (!data.adminName) {
    throw new Error("Admin Name is required");
  }
  if (!data.adminEmail) {
    throw new Error("Admin Email is required");
  }
 const randID = generateRandomId()
  try {
    await setDoc(doc(db, "admins",  data.adminEmail), {
      adminName: data.adminName,
      adminEmail: data.adminEmail,
      id:randID
    });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};
