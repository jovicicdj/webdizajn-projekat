import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcGb0E0lSuVPBH_PxDBVLsYT86A5_D5zw",
  authDomain: "knjige-rs.firebaseapp.com",
  databaseURL: "https://knjige-rs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "knjige-rs",
  storageBucket: "knjige-rs.firebasestorage.app",
  messagingSenderId: "383916477809",
  appId: "1:383916477809:web:1adc049b4d27b15d0efad0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);