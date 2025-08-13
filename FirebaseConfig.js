// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyjrGt8J_HT8wmlVLtf-W1mxqI4PsdiRs",
  authDomain: "food-app-86651.firebaseapp.com",
  projectId: "food-app-86651",
  storageBucket: "food-app-86651.firebasestorage.app",
  messagingSenderId: "577937986681",
  appId: "1:577937986681:web:55fb64a16014949583b0a8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);