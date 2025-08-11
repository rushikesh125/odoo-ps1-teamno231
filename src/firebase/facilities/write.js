import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config';

export const createFacility = async (facilityData) => {
  try {
    // Process sports data to ensure proper structure
    const processedSports = facilityData.sports.map(sport => ({
      ...sport,
      courts: sport.courts || [],
      weeklySchedule: sport.weeklySchedule || {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '21:00', isOpen: true },
        saturday: { open: '08:00', close: '22:00', isOpen: true },
        sunday: { open: '08:00', close: '20:00', isOpen: true }
      }
    }));

    const facilitiesRef = collection(db, 'facilities');
    const docRef = await addDoc(facilitiesRef, {
      ...facilityData,
      sports: processedSports,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { id: docRef.id, ...facilityData };
  } catch (error) {
    console.error('Error creating facility:', error);
    throw error;
  }
};