// generateBarcodes.js

const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid"); // For random unique barcodes

// 1) Initialize Admin SDK with service account
// Ensure serviceAccountKey.json is in the same folder as this script.
// If it's elsewhere, update the path accordingly (e.g. "../serviceAccountKey.json").
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // If using Firestore databaseURL, specify here:
  // databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();

// 2) Main function to generate or assign barcodes
async function generateBarcodes() {
  try {
    // Grab all tool docs from 'tools' collection
    const snapshot = await db.collection("tools").get();
    if (snapshot.empty) {
      console.log("No tools found in Firestore.");
      return;
    }

    // Iterate over each doc
    for (const docSnap of snapshot.docs) {
      const docData = docSnap.data();
      // If there's already a barcode, skip
      if (docData.barcode) {
        console.log(
          `Skipping '${docSnap.id}'; already has barcode: ${docData.barcode}`
        );
        continue;
      }

      // Otherwise, generate a new unique string
      const newBarcode = uuidv4();

      // Update Firestore with the new barcode
      await docSnap.ref.update({ barcode: newBarcode });
      console.log(
        `Assigned barcode '${newBarcode}' to tool '${docSnap.id}'.`
      );
    }

    console.log("All done!");
  } catch (error) {
    console.error("Error generating barcodes:", error);
  }
}

// 3) Run the function
generateBarcodes();
