import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "project-b8d32487-011b-4770-b3d",
  appId: "1:808692297135:web:72ffe4cb8649c1fde4535a",
  apiKey: "AIzaSyAqfpXCiRE-KZksUp7otUzB7603VjrlIp4",
  authDomain: "project-b8d32487-011b-4770-b3d.firebaseapp.com",
  storageBucket: "project-b8d32487-011b-4770-b3d.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-manuelfranciscof-6d836636-f963-417e-9d87-7a5df6c1337d");

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn('Firebase persistence not supported by browser');
  }
});

export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
