// firebase/user/read.js
import { doc, getDoc, onSnapshot ,collection, query, limit, startAfter, orderBy, where} from 'firebase/firestore';
import { db } from '../config';
import useSWRSubscription from 'swr/subscription';

export const getUserById = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
};

export const checkIfUserExists = async (email) => {
  try {
    // In a real app, you might want to query users by email
    // For now, we'll just return false as Firebase handles email uniqueness
    return { success: true, exists: false };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { success: false, error: error.message };
  }
};
export const getUserRole = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { success: true, role: userData.role || 'user' };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return { success: false, error: error.message };
  }
};

export function useUser({ uid }) {
  // Subscribe to Firestore collection using SWRSubscription
  const { data, error } = useSWRSubscription(
    ["users", uid], // Key to identify this subscription
    ([path, uid], { next }) => {
      // Define Firestore collection reference
      const ref = doc(db, `users/${uid}`);
      // Setup Firestore listener
      const unsub = onSnapshot(
        ref,
        (snapshot) => next(null, snapshot.exists() ? snapshot.data() : null),
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined,
  };
}



// // import { collection, query, limit, startAfter, onSnapshot, where, orderBy } from "firebase/firestore";
// import { db } from "@/firebase/config"; // Adjust path as needed
// import useSWRSubscription from 'swr/subscription';

export const useAllUsers = ({ pageLimit, lastSnapDoc, role = 'all', searchTerm = '' }) => {
  const { data, error } = useSWRSubscription(
    ["users", pageLimit, lastSnapDoc, role, searchTerm],
    ([_, pageLimit, lastSnapDoc, role, searchTerm], { next }) => {
      const ref = collection(db, "users");
      let q = query(ref);

      if (searchTerm) {
        q = query(q, orderBy('email'));
        q = query(q, where('email', '>=', searchTerm));
        q = query(q, where('email', '<=', searchTerm + '\uf8ff'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (role && role !== 'all') {
        q = query(q, where('role', '==', role));
      }

      q = query(q, limit(pageLimit ?? 10));

      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, {
            list:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs.map((snap) => ({
                    id: snap.id,
                    ...snap.data(),
                  })),
            lastSnapDoc:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs[snapshot.docs.length - 1],
          });
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );

  return {
    data: data?.list || [],
    lastSnapDoc: data?.lastSnapDoc || null,
    error: error?.message || null,
    isLoading: data === undefined,
  };
};