/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Example Cloud Function to use onRequest and logger
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {
    structuredData: true, // Breaking this line to satisfy lint rule
  });
  response.send("Hello from Firebase!");
});
