import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../config";

export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
};


export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};