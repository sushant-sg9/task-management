import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCz4Xmr8kc-Bwo0e8AXJantpdmTaqzaCTg",
  authDomain: "task-management-b5308.firebaseapp.com",
  projectId: "task-management-b5308",
  storageBucket: "task-management-b5308.appspot.com",
  messagingSenderId: "441224205555",
  appId: "1:441224205555:web:3d75a2e37ad88324f51386",
  measurementId: "G-YLJMYDR2RP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();