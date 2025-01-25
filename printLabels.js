// printLabels.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const bwipjs = require("bwip-js");
const fs = require("fs");

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function printLabels() {
  try {
    // Fetch all documents from "tools"
    const snapshot = await db.collection("tools").get();
    if (snapshot.empty) {
      console.log("No tools found in Firestore.");
      return;
    }

    for (const docSnap of snapshot.docs) {
      const toolData = docSnap.data();

      // Only generate images for docs that actually have a barcode
      if (!toolData.barcode) {
        console.log(`Skipping '${docSnap.id}' — no barcode field.`);
        continue;
      }

      // Generate a barcode image with bwip-js
      try {
        const pngBuffer = await bwipjs.toBuffer({
          bcid: "code128", // Barcode type (could be 'code128', 'ean13', etc.)
          text: toolData.barcode, // The actual barcode text
          scale: 3, // 3x scaling
          height: 10, // Barcode height in millimeters
          includetext: true, // Show human-readable text
          textxalign: "center",
        });

        // Build a file name using either the tool name or doc ID
        // e.g.: 'Hammer-abc123.png'
        const fileName = `${(toolData.name || "tool")}-${docSnap.id}.png`;

        // Write the PNG buffer to a file
        fs.writeFileSync(fileName, pngBuffer);
        console.log(`Saved ${fileName}`);
      } catch (err) {
        console.error(
          `Error generating barcode for doc '${docSnap.id}':`,
          err
        );
      }
    }

    console.log("All done generating barcode images!");
  } catch (error) {
    console.error("Error in printLabels:", error);
  }
}

printLabels();
