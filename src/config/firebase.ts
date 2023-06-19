import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { getEnvironmentVariable } from '.';

const firebaseConfig = {
  apiKey: getEnvironmentVariable('FIREBASE_API_KEY'),
  authDomain: getEnvironmentVariable('FIREBASE_DOMAIN'),
  projectId: getEnvironmentVariable('FIREBASE_PROJECT_ID'),
  storageBucket: getEnvironmentVariable('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvironmentVariable('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvironmentVariable('FIREBASE_APP_ID')
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth();

export const firestoreInstance = getFirestore();
