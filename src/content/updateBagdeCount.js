import { db, auth } from "./firebase_config";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

