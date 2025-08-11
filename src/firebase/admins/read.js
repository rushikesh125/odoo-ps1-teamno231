"use client";
import { db } from "../config"; // Adjust this path based on your project structure
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import useSWRSubscription from "swr/subscription";

export function useAdmins() {
  // Subscribe to Firestore collection using SWRSubscription
  const { data, error } = useSWRSubscription(
    ["admins"], // Key to identify this subscription
    ([path], { next }) => {
      // Define Firestore collection reference
      const ref = collection(db, path);

      // Setup Firestore listener
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          // If the collection is empty, return null; otherwise, map documents
          next(
            null,
            snapshot.docs.length === 0
              ? null
              : snapshot.docs.map((snap) => snap.data())
          );
        },
        (err) => next(err, null) // Pass errors to SWR
      );

      // Return unsubscribe function to clean up the listener
      return () => unsubscribe();
    }
  );

  return {
    data,
    error,
    isLoading: data === undefined, // Define a loading state
  };
}
export function useAdmin({ email }) {
  // if (email) {
  //   // toast.error("email required");
  //   return null;
  // }
  // Subscribe to Firestore collection using SWRSubscription
  const { data, error } = useSWRSubscription(
    ["admins", email], // Key to identify this subscription
    ([path, email], { next }) => {
      // Define Firestore collection reference
      const ref = doc(db, `admins/${email}`);

      // Setup Firestore listener
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => next(null, snapshot.exists() ? snapshot.data() : null),
        (err) => next(err, null) // Pass errors to SWR
      );

      // Return unsubscribe function to clean up the listener
      return () => unsubscribe();
    }
  );

  return {
    data,
    error,
    isLoading: data === undefined, // Define a loading state
  };
}

export const isAdminExits = async (email) => {
  try {
    const ref = doc(db, `admins`, email);
    const result = await getDoc(ref);
    return result.exists();
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return false;
  }
};

