// src/auth/AuthProvider.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (userData, token) => {
        setLoading(true);
        try {
            if (userData && token) {
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("token", token);
                setUser(userData);
                // ⭐ This logs the user data being set. Check your browser console
                //    after login to see if 'profilePicture' is present here.
                console.log("AuthContext: User logged in, setting user state to:", userData);
            }
        } catch (error) {
            console.error("AuthContext: Failed to save user data to localStorage:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        console.log("AuthContext: User logged out, user state set to null.");
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        const storedToken = localStorage.getItem("token");
        const storedUserString = localStorage.getItem("user");

        let parsedUser = null;

        if (storedToken && storedToken !== "undefined" && storedUserString && storedUserString !== "undefined") {
            try {
                parsedUser = JSON.parse(storedUserString);
                setUser(parsedUser);
                // ⭐ This logs the user data from localStorage. Check if 'profilePicture' is here
                //    when the page loads if you were already logged in.
                console.log("AuthContext: Initial load, user and token found. Setting user state.");
            } catch (error) {
                console.error("AuthContext: Error parsing user data from localStorage:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
            }
        } else {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            console.log("AuthContext: Initial load, no valid user/token found in localStorage.");
        }

        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                // ⭐ Crucial: setUser must be exposed for other components to update user data
                setUser, // <--- Added setUser to the context value for direct updates
                isAuthenticated: user !== null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;