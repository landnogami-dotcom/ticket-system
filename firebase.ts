// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT8olVRBlMo2PtGp222kgZh0-xtccqgmo",
  authDomain: "ticket-system-d6b73.firebaseapp.com",
  projectId: "ticket-system-d6b73",
  storageBucket: "ticket-system-d6b73.firebasestorage.app",
  messagingSenderId: "897832508488",
  appId: "1:897832508488:web:b56969139cebb679618c7d",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

