// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  // For demo purposes, these are placeholder values
  // In production, get these from Firebase Console
  apiKey: "demo-api-key",
  authDomain: "tesla-track-demo.firebaseapp.com",
  projectId: "tesla-track-demo",
  storageBucket: "tesla-track-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Authentication Functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signUpWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

// User Profile Functions
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    try {
      await setDoc(userRef, {
        displayName: displayName || email.split('@')[0],
        email,
        photoURL: photoURL || null,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
  
  return userRef;
};

export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Vehicle Functions
export const addUserVehicle = async (userId, vehicleData) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const vehicleRef = collection(db, 'users', userId, 'vehicles');
    const docRef = await addDoc(vehicleRef, {
      ...vehicleData,
      createdAt: new Date(),
      isActive: true
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

export const getUserVehicles = async (userId) => {
  if (!userId) return [];
  
  try {
    const vehiclesRef = collection(db, 'users', userId, 'vehicles');
    const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return [];
  }
};

export const updateUserVehicle = async (userId, vehicleId, updateData) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const vehicleRef = doc(db, 'users', userId, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteUserVehicle = async (userId, vehicleId) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const vehicleRef = doc(db, 'users', userId, 'vehicles', vehicleId);
    await deleteDoc(vehicleRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// Visit Functions
export const addUserVisit = async (userId, visitData) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const visitsRef = collection(db, 'users', userId, 'visits');
    const docRef = await addDoc(visitsRef, {
      ...visitData,
      createdAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding visit:', error);
    throw error;
  }
};

export const getUserVisits = async (userId) => {
  if (!userId) return [];
  
  try {
    const visitsRef = collection(db, 'users', userId, 'visits');
    const q = query(visitsRef, orderBy('visitDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting visits:', error);
    return [];
  }
};

export const updateUserVisit = async (userId, visitId, updateData) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const visitRef = doc(db, 'users', userId, 'visits', visitId);
    await updateDoc(visitRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating visit:', error);
    throw error;
  }
};

export const deleteUserVisit = async (userId, visitId) => {
  if (!userId) throw new Error('User must be authenticated');
  
  try {
    const visitRef = doc(db, 'users', userId, 'visits', visitId);
    await deleteDoc(visitRef);
  } catch (error) {
    console.error('Error deleting visit:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
