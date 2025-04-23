// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,         // Stores { id, name, identifier, roles }
    userType: null,     // 'Student' or 'Teacher'
    token: null,        // Store the JWT token here
  });

  // --- Optional: Check localStorage on initial load ---
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Restoring auth state from localStorage", parsedUser);
        setAuthState({
          isAuthenticated: true,
          user: { // Reconstruct user object
              id: parsedUser?.id,
              name: parsedUser?.name,
              identifier: parsedUser?.identifier,
              roles: parsedUser?.roles,
          },
          userType: parsedUser?.userType, // Get stored user type
          token: storedToken,
        });
      } catch (e) {
        console.error("Error parsing stored user data", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);
   // --- End Optional ---


  const login = (userData, type) => { // userData here is the LoginResponse object
    console.log("AuthContext: Storing login response", userData, "Type:", type);

    // Extract details based on LoginResponse.java
    const userDetails = {
      id: userData?.id || null,
      name: userData?.name || null,
      identifier: userData?.identifier || null,
      roles: userData?.roles || [], // Store roles
    };

    const token = userData?.token || null; // Extract the token

    if (token) { // Only authenticate if token exists
        setAuthState({
            isAuthenticated: true,
            user: userDetails,
            userType: type,
            token: token,
        });

        // --- Optional: Store token/user in localStorage for persistence ---
        // Note: Storing sensitive info like full user object might have security implications.
        // Storing only the token and fetching user details on reload might be safer.
        localStorage.setItem('authToken', token);
        // Store essential user info needed for restore (add userType)
        localStorage.setItem('authUser', JSON.stringify({...userDetails, userType: type }));
        // --- End Optional ---

    } else {
        console.error("Login response missing token!", userData);
        // Handle error - perhaps logout or set error state
        logout(); // Clear any partial state if token is missing
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    setAuthState({
      isAuthenticated: false,
      user: null,
      userType: null,
      token: null,
    });
    // --- Optional: Clear token/user from localStorage ---
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // --- End Optional ---
  };

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