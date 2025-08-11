"use client";
import { db } from "../config";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
  orderBy
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

/**
 * Hook to fetch paginated facilities with real-time updates
 * @param {Object} options - Configuration options
 * @param {number} options.pageLimit - Number of facilities per page
 * @param {Object} options.lastSnapDoc - Last document snapshot for pagination
 * @param {string} options.status - Filter by facility status (approved, pending, etc.)
 * @param {string} options.ownerId - Filter by facility owner
 */
export function useFacilities({ pageLimit, lastSnapDoc, status, ownerId }) {
  const { data, error } = useSWRSubscription(
    ["facilities", pageLimit, lastSnapDoc, status, ownerId],
    ([path, pageLimit, lastSnapDoc, status, ownerId], { next }) => {
      const ref = collection(db, path);
      let q = query(ref, orderBy("createdAt", "desc"), limit(pageLimit ?? 10));
      
      // Apply status filter if provided
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      // Apply owner filter if provided
      if (ownerId) {
        q = query(q, where("ownerId", "==", ownerId));
      }
      
      // Apply pagination if last document exists
      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, {
            list:
              snapshot.docs.length === 0
                ? []
                : snapshot.docs.map((snap) => ({
                    id: snap.id,
                    ...snap.data()
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
  console.log(data)

  return {
    data: data?.list,
    lastSnapDoc: data?.lastSnapDoc,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}

/**
 * Hook to fetch a single facility by ID with real-time updates
 * @param {Object} options - Configuration options
 * @param {string} options.facilityId - ID of the facility to fetch
 */
export function useFacility({ facilityId }) {
  const { data, error } = useSWRSubscription(
    ["facilities", facilityId],
    ([path, facilityId], { next }) => {
      if (!facilityId) {
        next(null, null);
        return () => {};
      }

      const ref = doc(db, `facilities`,facilityId);
      
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            next(null, {
              id: snapshot.id,
              ...snapshot.data()
            });
          } else {
            next(null, null);
          }
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );
console.log(data)
  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}

/**
 * Hook to fetch multiple facilities by their IDs with real-time updates
 * @param {Object} options - Configuration options
 * @param {string[]} options.facilityIds - Array of facility IDs to fetch
 */
export function useFacilitiesByIds({ facilityIds }) {
  const { data, error } = useSWRSubscription(
    ["facilities", facilityIds],
    ([path, facilityIds], { next }) => {
      if (!facilityIds || facilityIds.length === 0) {
        next(null, []);
        return () => {};
      }

      // Firestore 'in' query supports maximum 10 items
      if (facilityIds.length > 10) {
        console.warn("Firebase 'in' query supports maximum 10 items. Truncating to first 10.");
      }
      
      const idsToQuery = facilityIds.slice(0, 10);
      const ref = collection(db, path);
      const q = query(ref, where("id", "in", idsToQuery));
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null,
            snapshot.docs.length === 0 
              ? [] 
              : snapshot.docs.map(snap => ({
                  id: snap.id,
                  ...snap.data()
                }))
          );
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );
  console.log(data)
  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}

/**
 * Hook to fetch facilities by owner ID with real-time updates
 * @param {Object} options - Configuration options
 * @param {string} options.ownerId - ID of the facility owner
 */
export function useFacilitiesByOwner({ ownerId }) {
  const { data, error } = useSWRSubscription(
    ["facilities", "owner", ownerId],
    ([path, type, ownerId], { next }) => {
      if (!ownerId) {
        next(null, []);
        return () => {};
      }

      const ref = collection(db, path);
      const q = query(ref, where("ownerId", "==", ownerId));
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null,
            snapshot.docs.length === 0 
              ? [] 
              : snapshot.docs.map(snap => ({
                  id: snap.id,
                  ...snap.data()
                }))
          );
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}

/**
 * Hook to fetch approved facilities with real-time updates
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum number of facilities to fetch
 */
export function useApprovedFacilities({ limit: limitCount = 20 }) {
  const { data, error } = useSWRSubscription(
    ["facilities", "approved", limitCount],
    ([path, status, limitCount], { next }) => {
      const ref = collection(db, path);
      const q = query(
        ref, 
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null,
            snapshot.docs.length === 0 
              ? [] 
              : snapshot.docs.map(snap => ({
                  id: snap.id,
                  ...snap.data()
                }))
          );
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}

/**
 * Hook to fetch facilities by sport type with real-time updates
 * @param {Object} options - Configuration options
 * @param {string} options.sportType - Sport type to filter by
 * @param {number} options.limit - Maximum number of facilities to fetch
 */
export function useFacilitiesBySport({ sportType, limit: limitCount = 20 }) {
  const { data, error } = useSWRSubscription(
    ["facilities", "sport", sportType, limitCount],
    ([path, filterType, sportType, limitCount], { next }) => {
      if (!sportType) {
        next(null, []);
        return () => {};
      }

      const ref = collection(db, path);
      const q = query(
        ref, 
        where("sports", "array-contains", sportType),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null,
            snapshot.docs.length === 0 
              ? [] 
              : snapshot.docs.map(snap => ({
                  id: snap.id,
                  ...snap.data()
                }))
          );
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}