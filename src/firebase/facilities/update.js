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

// firebase/facilities/update.js

/**
 * Updates the status of a facility document.
 * @param {string} facilityId - The ID of the facility document.
 * @param {string} newStatus - The new status ('approved', 'rejected', 'pending').
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
export const updateFacilityStatus = async (facilityId, newStatus) => {
  if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
    throw new Error('Invalid status provided.');
  }

  const facilityRef = doc(db, 'facilities', facilityId);

  try {
    await updateDoc(facilityRef, {
      status: newStatus,
      updatedAt: Timestamp.now(), // Update the timestamp
    });
    console.log(`Facility ${facilityId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating facility status:', error);
    throw error; // Re-throw to be caught by the component
  }
};

// ... other update functions like updateFacility