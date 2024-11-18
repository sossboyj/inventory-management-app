import { db } from "../firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

const tools = [
  { name: "Dewalt Table Saw", model: "DWE 7485", serialNumber: "Ser2021-27DU", price: 550, status: "Available", checkedOutBy: null },
  { name: "Ridgid Miter Saw", model: "DWS 713", serialNumber: "Ser350463", price: 450, status: "Available", checkedOutBy: null },
  { name: "Makita Jack Hammer", model: "HR4002", serialNumber: "Ser192018", price: 700, status: "Available", checkedOutBy: null },
  { name: "Makita Jack Hammer Heavy Duty", model: null, price: null, status: "Available", checkedOutBy: null },
  { name: "Dewalt Table Saw", model: "DWE 7491", serialNumber: "Ser865310", price: 500, status: "Available", checkedOutBy: null },
  { name: "Dewalt Miter Saw", model: "10-inch", serialNumber: null, price: null, status: "Available", checkedOutBy: null },
  { name: "Makita 7” Angle Grinder", model: "Corded", price: 275, status: "Available", checkedOutBy: null },
  { name: "Makita 4-1/2” Angle Grinder", model: "Corded", price: 500, sets: 3, status: "Available", checkedOutBy: null },
  { name: "Makita 4-1/2” Angle Grinder", model: "Battery", price: 400, sets: 2, status: "Available", checkedOutBy: null },
  { name: "Bosch Laser", model: null, serialNumber: "Ser132015313", price: 250, status: "Available", checkedOutBy: null },
  { name: "Makita Multitool", model: "TM3010C", serialNumber: "Ser366581", price: 140, status: "Available", checkedOutBy: null },
  { name: "Makita 3/4” Hammer Drill", model: "HP2050", price: 175, status: "Available", checkedOutBy: null },
  { name: "Makita Compact Screw Driver Drills", model: "Battery Powered", sets: 4, price: 1300, status: "Available", checkedOutBy: null },
  { name: "Bosch Jigsaw", model: "JS470E", price: 175, status: "Available", checkedOutBy: null },
  { name: "Ridgid Mud Mixer", model: "R7122VN", serialNumber: "NC21434N679658", price: 179, status: "Available", checkedOutBy: null },
  { name: "Bosch Jack Hammer", model: null, price: null, status: "Available", checkedOutBy: null },
  { name: "Ridgid Wet Tile Saw", model: "5700 rpm", serialNumber: "cs19132dk10137", price: 600, status: "Available", checkedOutBy: null },
  { name: "Air Compressor Dewalt", model: null, price: 150, status: "Available", checkedOutBy: null },
  { name: "Circular Saw", model: "Corded and Battery", price: 160, status: "Available", checkedOutBy: null },
  { name: "Drywall Sander with Vacuum", model: "ZL225-CL", price: 300, status: "Available", checkedOutBy: null },
  { name: "Floor Sander", model: null, price: 900, status: "Available", checkedOutBy: null },
  { name: "8-ft Ladder", model: null, price: 300, inventoryCount: 5, status: "Available", checkedOutBy: null },
  { name: "22-ft Extension Ladder", model: null, price: 1000, inventoryCount: 4, status: "Available", checkedOutBy: null },
  { name: "Makita Recipro Saw", model: "JR3051T", price: null, status: "Available", checkedOutBy: null },
  { name: "Milwaukee Roofing Nailer", model: null, serialNumber: "G99A9", price: 240, status: "Available", checkedOutBy: null },
  { name: "Rotary Hammer", model: "HR2641H1", price: 275, status: "Available", checkedOutBy: null },
  { name: "Champion Generator", model: "8000 Watts Dual Fuel", price: 975, status: "Available", checkedOutBy: null },
];

const uploadTools = async () => {
  try {
    const toolsCollection = collection(db, "tools");

    for (const tool of tools) {
      await addDoc(toolsCollection, tool);
      console.log(`Tool ${tool.name} added successfully.`);
    }

    console.log("All tools have been uploaded successfully.");
  } catch (error) {
    console.error("Error uploading tools:", error);
  }
};

uploadTools();
