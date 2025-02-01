# Toolify – Project Diary

This diary captures the progress, decisions, and milestones in developing **Toolify**, a construction inventory management application. It provides an overview of each development stage, highlights key challenges, and outlines areas for future work.

---

## Project Overview

**Toolify** streamlines tool tracking for construction teams by enabling:

- **Real-Time Tool Status** – See which tools are available or checked out.  
- **Check-Out & Check-In** – Track usage durations, job sites, and return deadlines.  
- **Admin Oversight** – Manage tools, review logs, and receive notifications of overdue items.  

---

## Milestones

### 1. Initial Setup
- **Task:** Establish the foundational React application.  
- **Actions Taken:**
  - Created a React project via `Create React App`.
  - Configured `firebaseConfig.js` to connect with Firestore.
- **Challenges:**  
  - Avoiding configuration conflicts.  
  - Ensuring correct versions between Firebase and React.

### 2. Upload Tools to Firestore
- **Task:** Populate the database with tool inventory.  
- **Actions Taken:**
  - Implemented `uploadTools.js` to batch-import tools.
  - Standardized fields: `availability`, `checkedOutBy`, `jobSite`, `returnDate`.
- **Challenges:**  
  - Maintaining consistent data structures.  
  - Debugging Firestore permission settings.

### 3. Tool List UI
- **Task:** Present current tools and availability in `ToolList`.  
- **Actions Taken:**
  - Fetched tools via Firestore’s real-time `onSnapshot`.  
  - Displayed “Check Out” buttons only for `availability: true`.
- **Challenges:**  
  - Ensuring the UI auto-refreshes upon data changes.

### 4. Check-Out Functionality
- **Task:** Allow users to check out tools.  
- **Actions Taken:**
  - Built `CheckOutTool.js` to capture user name, job site, duration, and return date.  
  - Updated Firestore to record tool usage details.
- **Challenges:**  
  - Initially, the form rendered incorrectly at the bottom of the page.

### 5. Check-In Functionality
- **Task:** Let users return tools to inventory.  
- **Actions Taken:**
  - Created `CheckInTool.js` to reset fields and mark the tool available again.  
  - Added “Check In” buttons for any currently checked-out tool.
- **Challenges:**  
  - Matching form placement with the selected tool for clarity.

### 6. Admin Panel
- **Task:** Develop an interface for tool and inventory management.  
- **Actions Taken:**
  - Created `AdminPanel.js` for CRUD operations, including:
    - Viewing all tools.
    - Adding and editing tool information.
    - Deleting or restoring tools.
  - Added separate routing for admins vs. regular users.
- **Challenges:**  
  - Configuring Firestore rules for admin privileges.  
  - Enabling restoration of deleted tools from a “Removed Tools” list.

---

## Key Challenges & Resolutions

1. **Firestore Permission Errors**  
   - **Issue:** `FirebaseError: Missing or insufficient permissions`.  
   - **Resolution:** Refined Firestore security rules, allowing admin-only writes while restricting standard users.

2. **Real-Time Sync**  
   - **Issue:** Ensuring immediate UI reflection of any database changes.  
   - **Resolution:** Used Firestore’s `onSnapshot` to auto-update the React components.

3. **Form Placement**  
   - **Issue:** Check-out/in forms appeared at the bottom of the screen.  
   - **Resolution:** Adjusted each form to render directly underneath the specific tool card.

---

## Remaining Tasks

1. **Overdue Notifications**  
   - Send reminders (via Firebase Cloud Functions) when tools exceed their return date.  
2. **Admin Panel Refinements**  
   - Add filters for checked-out or overdue tools.  
   - Implement direct user notifications from the Admin Panel.  
3. **Enhanced Styling**  
   - Refine UI/UX for a more intuitive layout and branding.  
4. **Testing & Deployment**  
   - Establish end-to-end tests (e.g., Jest, Cypress).  
   - Consider a staging environment before pushing to production.

---

## Conclusion

Over the course of developing **Toolify**, we implemented **real-time** tool tracking, user-friendly check-out/in workflows, and an **Admin Panel** for comprehensive tool management. While the fundamental features are complete, additional improvements—such as automated overdue notifications and more advanced testing—will strengthen the system in future releases.

**End of Project Diary**
