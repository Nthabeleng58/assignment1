import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey:  "AIzaSyC656id1gN5P7lsON1F5QAg-yOfkSX84uc",
    authDomain:  "assignment-8fe3b.firebaseapp.com",
    projectId: "assignment-8fe3b",
    storageBucket: "assignment-8fe3b.firebasestorage.app",
    messagingSenderId:"666268748756",
    appId: "1:666268748756:web:6e0a40155c3d512904a441",
    measurementId: "G-4DBWZ3BJ7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };