import React, { useEffect } from "react";
import { db } from "./firebaseConfig.js"; // No need for firebaseApp here
import { collection, getDocs } from "firebase/firestore";

const FirebaseTestComponent = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reference Firestore collection and fetch documents
        const querySnapshot = await getDocs(collection(db, "testCollection")); // Ensure collection exists
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data());
        });
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchData();
  }, []);

  return <h2>Firestore Test: Check the console for logs!</h2>;
};

export default FirebaseTestComponent;
