import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config';

export const getFacilityById = async (facilityId) => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    const facilitySnap = await getDoc(facilityRef);
    
    if (facilitySnap.exists()) {
      return { id: facilitySnap.id, ...facilitySnap.data() };
    } else {
      throw new Error('Facility not found');
    }
  } catch (error) {
    console.error('Error fetching facility:', error);
    throw error;
  }
};

export const getFacilitiesByOwnerId = async (ownerId) => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    const q = query(facilitiesRef, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
};

export const getAllApprovedFacilities = async () => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    const q = query(facilitiesRef, where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching approved facilities:', error);
    throw error;
  }
};