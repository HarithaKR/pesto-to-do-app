// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWm0ks7K5_3QCBZK6MA4_HcZNYtscuWc4",
  authDomain: "pestotodo-e090a.firebaseapp.com",
  projectId: "pestotodo-e090a",
  storageBucket: "pestotodo-e090a.appspot.com",
  messagingSenderId: "960275981360",
  appId: "1:960275981360:web:d6d38a83edeb35ab07f9f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);