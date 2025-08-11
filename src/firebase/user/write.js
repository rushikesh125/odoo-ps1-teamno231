// firebase/user/write.js
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config';


export const createUser = async (userData) => {
  try {
    const { email, password, fullName, avatarUrl, role } = userData;
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name and photo URL
    await updateProfile(user, {
      displayName: fullName,
      photoURL: avatarUrl
    });
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: email,
      fullName: fullName,
      avatarUrl: avatarUrl || '',
      role: role,
      createdAt:Timestamp.now(),
    });
    
 
    
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};