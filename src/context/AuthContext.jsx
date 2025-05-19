// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure this is installed or handle token inspection differently

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null, // Will store { id, name, identifier, roles: [] }
    userType: null, // 'Student', 'Teacher' (this might become redundant if roles are comprehensive)
    token: null,
  });

  useEffect(() => {
     console.log("AuthContext: useEffect trying to restore auth state...");
     const storedToken = localStorage.getItem('authToken');
     const storedUserString = localStorage.getItem('authUser');

     if (storedToken && storedUserString) {
         console.log("AuthContext: Found token and user string in localStorage.");
         try {
             const decodedPayload = jwtDecode(storedToken); // Use jwt-decode
             const currentTime = Date.now() / 1000;

             if (decodedPayload.exp < currentTime) {
                 console.warn("AuthContext: Stored token has expired.");
                 localStorage.removeItem('authToken');
                 localStorage.removeItem('authUser');
                 setAuthState({ isAuthenticated: false, user: null, userType: null, token: null }); // Explicitly clear state
                 return;
             }

             const storedUser = JSON.parse(storedUserString);
             console.log("AuthContext: Parsed Stored User Data:", storedUser);

             // Ensure roles are part of the storedUser, or fallback to decoded token if available (though backend login response is better source)
             const roles = storedUser?.roles || decodedPayload?.roles || [];
             // Determine userType based on roles for consistency if possible, or use stored userType
             let determinedUserType = storedUser?.userType;
             if (!determinedUserType && roles.length > 0) {
                if (roles.includes("ROLE_STUDENT")) determinedUserType = "Student";
                else if (roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN") || roles.includes("ROLE_SUPERADMIN")) determinedUserType = "Teacher"; // Or more specific if needed by UI
             }


             setAuthState({
                 isAuthenticated: true,
                 user: { // Reconstruct user object carefully
                     id: storedUser?.id || decodedPayload?.sub,
                     name: storedUser?.name || decodedPayload?.name, // Assuming name is in token or storedUser
                     identifier: storedUser?.identifier || decodedPayload?.sub,
                     roles: roles, // ✨ Store roles
                 },
                 userType: determinedUserType, // 'Student' or 'Teacher' (can be refined)
                 token: storedToken,
             });
             console.log("AuthContext: Auth state successfully restored from localStorage.");
         } catch (e) {
             console.error("AuthContext: Error processing stored auth data:", e);
             localStorage.removeItem('authToken');
             localStorage.removeItem('authUser');
             setAuthState({ isAuthenticated: false, user: null, userType: null, token: null });
         }
     } else {
         console.log("AuthContext: Token or user data missing in localStorage.");
         // Ensure state is fully logged out if nothing valid is found
         setAuthState({ isAuthenticated: false, user: null, userType: null, token: null });
     }
  }, []);


  const login = (loginResponseData, type) => { // loginResponseData is the direct body from backend
    console.log("AuthContext: Storing login response", loginResponseData, "Type:", type);
    const token = loginResponseData?.token;

    if (token) {
        try {
            // The backend LoginResponse DTO already includes id, identifier, name, and roles.
            // No need to decode JWT here for these details if backend provides them.
            // const decodedPayload = jwtDecode(token); // Optional: if you need 'exp' or other JWT claims not in response body

            const userDetails = {
              id: loginResponseData.id,
              name: loginResponseData.name,
              identifier: loginResponseData.identifier,
              roles: loginResponseData.roles || [], // ✨ Get roles from loginResponseData
            };

            setAuthState({
                isAuthenticated: true,
                user: userDetails,
                userType: type, // 'Student' or 'Teacher' (for general UI distinction)
                token: token,
            });

            localStorage.setItem('authToken', token);
            // Store userDetails (which includes roles) and userType
            localStorage.setItem('authUser', JSON.stringify({...userDetails, userType: type }));
            console.log("AuthContext: Saved token and user data (with roles) to localStorage.");

        } catch (error) {
            console.error("AuthContext: Error processing login data:", error);
            logout(); // Log out if there's an issue
        }
    } else {
        console.error("AuthContext: Login response missing token!", loginResponseData);
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