import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyC2aNzt_bI0FsEDZ7QElMn9mMKqYNID8T0",
  authDomain: "whatsup-clone-14122.firebaseapp.com",
  databaseURL: "https://whatsup-clone-14122-default-rtdb.firebaseio.com",
  projectId: "whatsup-clone-14122",
  storageBucket: "whatsup-clone-14122.firebasestorage.app",
  messagingSenderId: "369849720139",
  appId: "1:369849720139:web:260562ab84c929fc009cce",
  measurementId: "G-89D3C5870Q",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export default firebase;

// Supabase configuration (just constants, no client)
export const SUPABASE_URL = "https://qqewhlksmtyuwgaanybi.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZXdobGtzbXR5dXdnYWFueWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5Mzc2MTIsImV4cCI6MjA2MjUxMzYxMn0.dgQ91Zp1uBBl1PXNQCAWKW1LfXx90UOhK-NUnYgrz8g";