import { db } from "../firebaseConfig.js";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const resetAvailability = async () => {
  try {
    const toolsCollection = collection(db, "tools");
    const toolsSnapshot = await getDocs(toolsCollection);

    toolsSnapshot.forEach(async (toolDoc) => {
      const toolRef = doc(db, "tools", toolDoc.id);
      await updateDoc(toolRef, {
        availability: true, // Reset to available
      });
    });

    console.log("All tools have been reset to available.");
  } catch (error) {
    console.error("Error resetting tools:", error);
  }
};

resetAvailability();
