import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config';

export const deleteFacility = async (facilityId) => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    await deleteDoc(facilityRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};