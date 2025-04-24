// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    userType: null,
    token: null,
  });

  // --- MODIFIED useEffect for Persistence ---
  useEffect(() => {
     console.log("AuthContext: useEffect trying to restore auth state...");
     const storedToken = localStorage.getItem('authToken');
     const storedUserString = localStorage.getItem('authUser'); // Get user string

     // highlight-start
     // Only proceed if BOTH token and user string exist
     if (storedToken && storedUserString) {
         console.log("AuthContext: Found token and user string in localStorage.");
         try {
             // 1. Decode Token
             const decodedPayload = jwtDecode(storedToken);
             console.log("AuthContext: Decoded Token Payload:", decodedPayload);

             // 2. Check Token Expiration (Very Important!)
             const currentTime = Date.now() / 1000; // JWT 'exp' is in seconds
             if (decodedPayload.exp < currentTime) {
                 console.warn("AuthContext: Stored token has expired.");
                 // Don't set auth state, clear storage instead
                 logout(); // Use logout function to clear storage and state
                 return; // Stop processing
             }

             // 3. Parse User Data
             const storedUser = JSON.parse(storedUserString);
             console.log("AuthContext: Parsed Stored User Data:", storedUser);

             // 4. Set Authenticated State (if token is valid and user data parsed)
             setAuthState({
                 isAuthenticated: true,
                 user: { // Reconstruct user object carefully
                     id: storedUser?.id || decodedPayload?.sub || null, // Use stored ID or fallback to token subject
                     name: storedUser?.name || null,
                     identifier: storedUser?.identifier || decodedPayload?.sub || null, // Use stored identifier or fallback
                     roles: storedUser?.roles || decodedPayload?.roles || [], // Use stored roles or fallback
                 },
                 userType: storedUser?.userType || null, // Must get userType from stored data
                 token: storedToken,
             });
             console.log("AuthContext: Auth state successfully restored from localStorage.");
             // highlight-end

         } catch (e) {
             console.error("AuthContext: Error processing stored auth data:", e);
             // If decoding or parsing fails, clear invalid stored data
             logout(); // Use logout function to clear storage and state
         }
     } else {
         console.log("AuthContext: Token or user data missing in localStorage.");
         // Ensure state is logged out if nothing valid is found
         // Note: logout() also sets the state, so calling it here might be redundant
         // if the initial state is already logged-out, but it ensures storage is clear.
         // If you are certain the initial state handles this, you can remove this else block's logout()
         logout();
     }
     // Run only once on component mount
  }, []);


  const login = (userData, type) => {
    console.log("AuthContext: Storing login response", userData, "Type:", type);
    const token = userData?.token || null;

    if (token) {
        try {
            const decodedPayload = jwtDecode(token);
            console.log("AuthContext: Decoded Token Payload on Login:", decodedPayload);

            // Prepare user details from response AND potentially token
            const userDetails = {
              id: userData?.id || decodedPayload?.sub || null,
              name: userData?.name || null,
              identifier: userData?.identifier || decodedPayload?.sub || null,
              roles: userData?.roles || decodedPayload?.roles || [],
            };

            setAuthState({
                isAuthenticated: true,
                user: userDetails,
                userType: type,
                token: token,
            });

            // Store both token and user details (including type)
            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify({...userDetails, userType: type })); // Include userType
            console.log("AuthContext: Saved token and user data to localStorage.");

        } catch (error) {
            console.error("AuthContext: Error decoding token during login:", error);
            logout(); // Log out if token is invalid on login
        }
    } else {
        console.error("AuthContext: Login response missing token!", userData);
        logout();
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out and clearing storage.");
    setAuthState({
      isAuthenticated: false,
      user: null,
      userType: null,
      token: null,
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Make sure the value includes the latest authState
  const value = {
    authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};