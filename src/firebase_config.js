import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxjSuK0YNMTksUNgQAPZBf5Tw0P70hCPE",
  authDomain: "taskforge-ec08f.firebaseapp.com",
  projectId: "taskforge-ec08f",
  storageBucket: "taskforge-ec08f.appspot.com",
  messagingSenderId: "113569006809",
  appId: "1:113569006809:web:01d5b5c063fe8f01c5eac8",
  measurementId: "G-V9LD8S38G1",
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);


