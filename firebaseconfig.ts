import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWm0Lph02tPmzAHv8tXJKpkZtaWf-0syQ",
  authDomain: "wroscorerapp.firebaseapp.com",
  projectId: "wroscorerapp",
  storageBucket: "wroscorerapp.firebasestorage.app",
  messagingSenderId: "988238835754",
  appId: "1:988238835754:web:9da67287494ca4ffc51353",
  measurementId: "G-SJEGPJLT80"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP); // memory-only
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
