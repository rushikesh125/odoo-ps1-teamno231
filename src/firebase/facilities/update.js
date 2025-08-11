import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config';

export const updateFacility = async (facilityId, updateData) => {
  try {
    // Process sports data to ensure proper structure
    const processedSports = updateData.sports ? updateData.sports.map(sport => ({
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
    })) : updateData.sports;

    const facilityRef = doc(db, 'facilities', facilityId);
    await updateDoc(facilityRef, {
      ...updateData,
      sports: processedSports,
      updatedAt: Timestamp.now()
    });
    
    return { id: facilityId, ...updateData };
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};