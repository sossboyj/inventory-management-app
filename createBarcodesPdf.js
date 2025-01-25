// createBarcodesPdf.js

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Adjust these to tweak layout:
const PAGE_SIZE = "LETTER"; // 8.5in x 11in, 612 x 792 points
const BARCODE_COLS = 2;     // 2 columns
const BARCODE_ROWS = 2;     // 2 rows -> 4 barcodes per page
const MARGIN = 50;          // Page margin in points
const SPACING_X = 40;       // Horizontal spacing between columns
const SPACING_Y = 60;       // Vertical spacing between rows

// Label and image dimensions
const LABEL_HEIGHT = 20;    // Space for the tool name text
const BARCODE_WIDTH = 200;  // Width to fit each barcode
const BARCODE_HEIGHT = 100; // Height to fit each barcode

function createBarcodesPdf() {
  // 1) Create a PDFDocument
  const doc = new PDFDocument({ autoFirstPage: false, size: PAGE_SIZE });

  const outputFile = "all-barcodes.pdf";
  const writeStream = fs.createWriteStream(outputFile);
  doc.pipe(writeStream);

  // 2) Read the barcodes directory
  const barcodesDir = path.join(__dirname, "barcodes");
  if (!fs.existsSync(barcodesDir)) {
    console.error("No 'barcodes/' folder found. Please ensure your PNG files are there.");
    doc.end();
    return;
  }

  // Get all .png files
  const files = fs.readdirSync(barcodesDir).filter((f) => f.endsWith(".png"));
  if (files.length === 0) {
    console.log("No .png files found in 'barcodes/' folder.");
    doc.end();
    return;
  }

  // 3) Page & Layout Calculation
  // We'll place 4 barcodes per page: 2 columns × 2 rows
  // For each page, we have MARGIN on all sides and SPACING between columns/rows
  // We'll track how many barcodes we've placed on the current page.

  let barcodeIndex = 0; // which barcode we're on overall
  let pageIndex = 0;    // page counter

  // Each time we create a new page, we place up to 4 barcodes in a grid
  while (barcodeIndex < files.length) {
    pageIndex++;
    // Add a new page
    doc.addPage({ size: PAGE_SIZE });
    // The top-left corner for column/row 0 is at (MARGIN, MARGIN)

    for (let row = 0; row < BARCODE_ROWS; row++) {
      for (let col = 0; col < BARCODE_COLS; col++) {
        if (barcodeIndex >= files.length) break; // no more barcodes

        const file = files[barcodeIndex];
        barcodeIndex++;

        // Calculate X,Y for this cell
        const x = MARGIN + col * (BARCODE_WIDTH + SPACING_X);
        const y = MARGIN + row * (BARCODE_HEIGHT + LABEL_HEIGHT + SPACING_Y);

        // Draw the label (file name) above the barcode
        doc.fontSize(12).text(file, x, y, {
          width: BARCODE_WIDTH,
          align: "center",
        });

        // Position for the barcode image (below the label)
        const imageX = x;
        const imageY = y + LABEL_HEIGHT;
        const imagePath = path.join(barcodesDir, file);

        // Insert the PNG image, sized to fit
        doc.image(imagePath, imageX, imageY, {
          fit: [BARCODE_WIDTH, BARCODE_HEIGHT],
          align: "center",
          valign: "center",
        });
      }
    }
  }

  // 4) Finalize
  doc.end();
  writeStream.on("finish", () => {
    console.log(`Created '${outputFile}' with ${files.length} barcodes!`);
  });
}

createBarcodesPdf();
