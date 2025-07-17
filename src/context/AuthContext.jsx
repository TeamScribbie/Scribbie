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
    loading: true, // <-- Add loading state, default to true
  });

  useEffect(() => {
     console.log("AuthContext: useEffect trying to restore auth state...");
     const storedToken = localStorage.getItem('authToken');
     const storedUserString = localStorage.getItem('authUser');

     if (storedToken && storedUserString) {
         try {
             const decodedPayload = jwtDecode(storedToken);
             const currentTime = Date.now() / 1000;

             if (decodedPayload.exp < currentTime) {
                 console.warn("AuthContext: Stored token has expired.");
                 localStorage.removeItem('authToken');
                 localStorage.removeItem('authUser');
                 setAuthState({ isAuthenticated: false, user: null, userType: null, token: null, loading: false }); // <-- Set loading to false
                 return;
             }

             const storedUser = JSON.parse(storedUserString);
             console.log("AuthContext: Parsed Stored User Data:", storedUser);

             const roles = storedUser?.roles || decodedPayload?.roles || [];
             let determinedUserType = storedUser?.userType;
             if (!determinedUserType && roles.length > 0) {
                if (roles.includes("ROLE_STUDENT")) determinedUserType = "Student";
                else if (roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN") || roles.includes("ROLE_SUPERADMIN")) determinedUserType = "Teacher";
             }

             setAuthState({
                 isAuthenticated: true,
                 user: {
                     id: storedUser?.id || decodedPayload?.sub,
                     name: storedUser?.name || decodedPayload?.name,
                     identifier: storedUser?.identifier || decodedPayload?.sub,
                     roles: roles,
                 },
                 userType: determinedUserType,
                 token: storedToken,
                 loading: false, // <-- Set loading to false after successful restore
             });
             console.log("AuthContext: Auth state successfully restored from localStorage.");
         } catch (e) {
             console.error("AuthContext: Error processing stored auth data:", e);
             localStorage.removeItem('authToken');
             localStorage.removeItem('authUser');
             setAuthState({ isAuthenticated: false, user: null, userType: null, token: null, loading: false }); // <-- Set loading to false
         }
     } else {
         console.log("AuthContext: Token or user data missing in localStorage.");
         setAuthState({ isAuthenticated: false, user: null, userType: null, token: null, loading: false }); // <-- Set loading to false
     }
  }, []);


  const login = (loginResponseData, type) => {
    console.log("AuthContext: Storing login response", loginResponseData, "Type:", type);
    const token = loginResponseData?.token;

    if (token) {
        try {
            const userDetails = {
              id: loginResponseData.id,
              name: loginResponseData.name,
              identifier: loginResponseData.identifier,
              roles: loginResponseData.roles || [],
            };

            setAuthState({
                isAuthenticated: true,
                user: userDetails,
                userType: type,
                token: token,
                loading: false, // <-- Set loading to false on login
            });

            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify({...userDetails, userType: type }));
            console.log("AuthContext: Saved token and user data (with roles) to localStorage.");

        } catch (error) {
            console.error("AuthContext: Error processing login data:", error);
            logout();
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
      loading: false, // <-- Set loading to false on logout
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