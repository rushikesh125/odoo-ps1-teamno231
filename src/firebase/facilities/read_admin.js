// /firebase/facilities/read_admin.js
import useSWRSubscription from 'swr/subscription';
import { db } from '../config';

// hooks/useAllFacilities.js
// import { useSWRSubscription } from 'swr/subscription';
import { collection, query, limit, startAfter, onSnapshot, orderBy } from 'firebase/firestore';

/**
 * Custom hook to subscribe to a paginated list of all facilities from Firestore.
 * @param {Object} options - Configuration options.
 * @param {number} [options.pageLimit=10] - Number of documents to fetch per page.
 * @param {DocumentSnapshot} [options.lastSnapDoc=null] - The last document snapshot from the previous page for pagination.
 * @returns {Object} - Object containing data, lastSnapDoc, error, and isLoading states.
 */
export const useAllFacilities = ({ pageLimit, lastSnapDoc }) => {
  const { data, error } = useSWRSubscription(
    ['allFacilities', pageLimit, lastSnapDoc], // Unique key for the subscription
    ([_, pageLimit, lastSnapDoc], { next }) => {
      // Reference to the main 'facilities' collection
      const ref = collection(db, 'facilities');
      
      // Base query: order by createdAt descending, apply limit
      let q = query(ref, orderBy('createdAt', 'desc'), limit(pageLimit ?? 10));

      // If paginating, start after the last document of the previous page
      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }

      // Set up the real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Process the snapshot data
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Processed list in hook:", list);

          // Determine the last document for potential next pagination
          const newLastSnapDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

          // Pass data to SWR
          next(null, {
            list: list.length > 0 ? list : null,
            lastSnapDoc: newLastSnapDoc,
          });
        },
        (err) => {
          console.error('Error in useAllFacilities subscription:', err);
          next(err, null); // Pass error to SWR
        }
      );

      // Cleanup function to unsubscribe when the component unmounts or key changes
      return () => unsubscribe();
    }
  );

  // Return structured data for easy consumption
  return {
    data: data?.list || [], // Array of facility objects
    lastSnapDoc: data?.lastSnapDoc || null, // Last document snapshot for pagination
    error: error?.message || null, // Error message string or null
    isLoading: data === undefined && !error, // Loading state (data undefined but no error)
  };
};