import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDt-Qt4jmqeJUJyit-lw3reHusIChp06yg",
  authDomain: "construction-inventory-app.firebaseapp.com",
  projectId: "construction-inventory-app",
  storageBucket: "construction-inventory-app.appspot.com",
  messagingSenderId: "843220190052",
  appId: "1:843220190052:web:ec18fe6e74ada270f6f071",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Export as named exports
export { firebaseApp, db };
