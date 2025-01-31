import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Handle user-fetching errors

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Ensure loading state is accurate
      setError(null);   // Clear previous errors

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: userData.displayName || currentUser.displayName,
            });
            setRole(userData.role || "user"); // default to "user" if no role
            console.log("✅ Authenticated user:", {
              uid: currentUser.uid,
              email: currentUser.email,
              role: userData.role,
            });
          } else {
            console.warn(
              "⚠️ User document does not exist in Firestore. Creating a new one..."
            );

            // Automatically create a Firestore entry for this new user
            const newUser = {
              email: currentUser.email,
              role: "user", // default role for newly created users
              createdAt: new Date().toISOString(),
            };

            await setDoc(userRef, newUser);
            console.log("✅ New user document created in Firestore:", newUser);

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || "",
            });
            setRole("user");
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          setError("Failed to fetch user data. Please try again later.");
        }
      } else {
        console.log("ℹ️ No user is logged in.");
        setUser(null);
        setRole(null);
      }

      setLoading(false); // Stop loading after processing
    });

    return () => unsubscribe();
  }, []);

  // Renamed from 'logout' to 'signOutUser' for clarity & consistency
  const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("✅ User logged out successfully.");
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  if (loading) {
    return <div>Loading user data. Please wait...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <AuthContext.Provider value={{ user, role, signOutUser, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export { AuthContext };
