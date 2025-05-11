import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import { createClient } from "@supabase/supabase-js";
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

// Initialize Firebase - fixed version
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const supabaseUrl = "";
const supabaseKey = "";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
export default firebase;
