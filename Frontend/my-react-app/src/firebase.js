import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "./assets/firebaseConfig.json";


const app = getApps().length ? getApp() : initializeApp(config);

export const db = getFirestore(app);