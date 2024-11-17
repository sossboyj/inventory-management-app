import { db } from "../firebaseConfig.js"; // Import Firestore instance
import { collection, addDoc } from "firebase/firestore"; // Firestore methods

// Tool inventory data
const toolsData = [
  {
    name: "Dewalt Table Saw 10”",
    model: "DWE 7485",
    serialNumber: "2021-27DU",
    price: 550,
    inventoryCount: 1,
  },
  {
    name: "Ridgid Miter Saw 10”",
    model: "DWS 713",
    serialNumber: "350463",
    price: 450,
    inventoryCount: 1,
  },
  {
    name: "Makita Jack Hammer",
    model: "HR4002",
    serialNumber: "192018",
    price: 700,
    inventoryCount: 1,
  },
  {
    name: "Makita Jack Hammer Heavy Duty",
    model: "N/A",
    serialNumber: "N/A",
    price: null,
    inventoryCount: 1,
  },
  {
    name: "Dewalt Table Saw 10”",
    model: "DWE 7491",
    serialNumber: "865310",
    price: 500,
    inventoryCount: 1,
  },
  {
    name: "Makita 7” Angle Grinder Corded",
    model: "N/A",
    serialNumber: "N/A",
    price: 275,
    inventoryCount: 1,
  },
  {
    name: "Makita 4-1/2” Angle Grinder Corded",
    model: "N/A",
    serialNumber: "N/A",
    price: 500,
    inventoryCount: 3,
  },
  {
    name: "Makita 4-1/2 Angle Grinder Battery",
    model: "N/A",
    serialNumber: "N/A",
    price: 400,
    inventoryCount: 2,
  },
  {
    name: "Bosch Laser",
    model: "N/A",
    serialNumber: "132015313",
    price: 250,
    inventoryCount: 1,
  },
  {
    name: "Makita Multitool Corded",
    model: "TM3010C",
    serialNumber: "366581",
    price: 140,
    inventoryCount: 1,
  },
  {
    name: "Makita 3/4” Hammer Drill",
    model: "HP2050",
    serialNumber: "N/A",
    price: 175,
    inventoryCount: 1,
  },
  {
    name: "Makita Compact Screwdriver Drills",
    model: "N/A",
    serialNumber: "N/A",
    price: 1300,
    inventoryCount: 4,
  },
  {
    name: "Bosch Jigsaw",
    model: "JS470E",
    serialNumber: "N/A",
    price: 175,
    inventoryCount: 1,
  },
  {
    name: "Ridgid 1/2” Spade Handle Mud Mixer",
    model: "R7122VN",
    serialNumber: "NC21434N679658",
    price: 179,
    inventoryCount: 1,
  },
  {
    name: "Ridgid Wet Tile Saw 7”",
    model: "N/A",
    serialNumber: "cs19132dk10137",
    price: 600,
    inventoryCount: 1,
  },
  {
    name: "Air Compressor Dewalt",
    model: "N/A",
    serialNumber: "N/A",
    price: 150,
    inventoryCount: 1,
  },
  {
    name: "Circular Saw Corded and Battery",
    model: "N/A",
    serialNumber: "N/A",
    price: 160,
    inventoryCount: 1,
  },
  {
    name: "Corded Drywall Sander with Vacuum",
    model: "ZL225-CL",
    serialNumber: "N/A",
    price: 300,
    inventoryCount: 1,
  },
  {
    name: "Floor Sander",
    model: "N/A",
    serialNumber: "N/A",
    price: 900,
    inventoryCount: 1,
  },
  {
    name: "8 Feet Ladder",
    model: "N/A",
    serialNumber: "N/A",
    price: 300,
    inventoryCount: 5,
  },
  {
    name: "22 Feet Extension Ladder",
    model: "N/A",
    serialNumber: "N/A",
    price: 1000,
    inventoryCount: 4,
  },
  {
    name: "Makita Recipro Saw 12 Amp",
    model: "JR3051T",
    serialNumber: "N/A",
    price: null,
    inventoryCount: 1,
  },
  {
    name: "Milwaukee Roofing Nailer",
    model: "N/A",
    serialNumber: "G99A9",
    price: 240,
    inventoryCount: 1,
  },
  {
    name: "Champion 8000Watts Dual Fuel Generator",
    model: "N/A",
    serialNumber: "N/A",
    price: 975,
    inventoryCount: 1,
  },
];

const uploadToolsData = async () => {
  const toolsCollection = collection(db, "tools");
  try {
    for (const tool of toolsData) {
      await addDoc(toolsCollection, tool);
      console.log(`Uploaded: ${tool.name}`);
    }
    console.log("All tools uploaded successfully!");
  } catch (error) {
    console.error("Error uploading tools:", error);
  }
};

uploadToolsData();
