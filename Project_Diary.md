# **Construction Inventory Management App - Project Diary**

This diary documents the progress, decisions, and changes made during the development of the **Construction Inventory Management App**. It serves as a log to understand the project evolution and provides context for future development.

---

## **Project Overview**

The Construction Inventory Management App aims to streamline tool tracking for construction companies. It allows employees to:
- View available tools.
- Check out tools for specific job sites and durations.
- Check tools back into the inventory.
- Enable admins to manage tools, monitor checked-out and overdue items, and notify users about deadlines.

---

## **Milestones**

### **1. Initial Setup**
- **Task:** Create the initial React app structure.
- **Steps Taken:**
  - Used `Create React App` to initialize the project.
  - Configured `firebaseConfig.js` to connect the app to the Firestore database.
- **Challenges:**
  - Setting up the correct `firebaseConfig.js` file without overwriting existing configurations.
  - Ensuring compatibility between Firebase version and the app.

---

### **2. Upload Tools to Firestore**
- **Task:** Populate the database with tool inventory.
- **Steps Taken:**
  - Wrote `uploadTools.js` utility to batch-upload tools to Firestore.
  - Ensured every tool had fields like `availability`, `checkedOutBy`, `jobSite`, and `returnDate`.
- **Challenges:**
  - Ensuring data structure consistency for all tools.
  - Debugging permissions issues in Firestore rules.
- **Outcome:**
  - Tools were successfully uploaded to Firestore.

---

### **3. Tool List UI**
- **Task:** Create a `ToolList` component to display tools and their availability.
- **Steps Taken:**
  - Fetched tools dynamically from Firestore using `onSnapshot`.
  - Added conditional rendering to show "Check Out" buttons for available tools.
- **Challenges:**
  - Handling real-time updates to tool availability in the UI.

---

### **4. Check-Out Functionality**
- **Task:** Enable users to check out tools.
- **Steps Taken:**
  - Created `CheckOutTool.js` to handle user input for `userName`, `jobSite`, `duration`, and `returnDate`.
  - Updated Firestore with tool check-out details.
  - Added error handling for missing or invalid fields.
- **Challenges:**
  - Debugging why the "Check Out" form initially appeared at the bottom of the page.
  - Fixed by rendering the form beneath the selected tool.

---

### **5. Check-In Functionality**
- **Task:** Enable users to check tools back into the inventory.
- **Steps Taken:**
  - Created `CheckInTool.js` to reset `availability` and clear check-out details.
  - Updated the `ToolList.js` component to include "Check In" buttons for checked-out tools.
- **Challenges:**
  - Debugging the display of the "Check In" form beneath the selected tool.

---

### **6. Admin Panel**
- **Task:** Create an admin interface for managing tools.
- **Steps Taken:**
  - Created `AdminPanel.js` with features to:
    - View all tools.
    - Add new tools.
    - Edit existing tools.
    - Delete tools and move them to a "Removed Tools" section.
  - Added routing to navigate between the `ToolList` and `AdminPanel`.
- **Challenges:**
  - Resolving Firestore permission errors for admin operations.
  - Ensuring removed tools could be restored from the "Removed Tools" section.
- **Outcome:**
  - Admin panel fully functional with CRUD capabilities and tool recovery options.

---

## **Key Challenges and Resolutions**

### **1. Firestore Permission Issues**
- **Problem:** `FirebaseError: Missing or insufficient permissions`.
- **Solution:** Updated Firestore security rules to allow specific operations for authenticated users and admins.

### **2. Real-Time Updates**
- **Problem:** Ensuring UI updated dynamically with Firestore changes.
- **Solution:** Used Firestore's `onSnapshot` for real-time data fetching and updates.

### **3. Form Placement**
- **Problem:** Check-out and check-in forms appeared at the bottom of the page.
- **Solution:** Adjusted component structure to render forms beneath the respective tools.

---

## **Remaining Tasks**
1. **Notifications for Overdue Tools (Future Plan)**
   - Implement Firebase Cloud Functions to notify users about overdue tools.
2. **Refinement of Admin Panel**
   - Add filtering options to view only checked-out or overdue tools.
   - Add notification features to directly alert users from the admin panel.
3. **Styling**
   - Improve UI/UX for better user experience.
4. **Testing and Deployment**
   - Conduct end-to-end testing before deploying the app.
