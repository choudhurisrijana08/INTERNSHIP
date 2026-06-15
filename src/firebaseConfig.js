import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfxuRvibC2Bd4DdqAuOd_Mj-wKya3K1rg",
  authDomain: "e-commerce-a1ffe.firebaseapp.com",
  projectId: "e-commerce-a1ffe",
  storageBucket: "e-commerce-a1ffe.firebasestorage.app",
  messagingSenderId: "521505164838",
  appId: "1:521505164838:web:ef67e98567a3d549c960e7",
  measurementId: "G-EYTTTBCLV7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
