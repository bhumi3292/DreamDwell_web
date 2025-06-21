// Inside src/auth/authProvider.jsx

import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Handles user login: sets user data and token in state and localStorage
    const login = (userData, token) => {
        setLoading(true);
        try {
            // Ensure userData passed here *already contains* the fullName property from your backend
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", token);
            setUser(userData); // This is where the user state is updated
            console.log("AuthContext: User logged in, setting user state to:", userData); // Debugging log
        } catch (error) {
            console.error("AuthContext: Failed to save user data to localStorage:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handles user logout
    const logout = () => {
        setLoading(true);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        console.log("AuthContext: User logged out, user state set to null."); // Debugging log
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        const storedToken = localStorage.getItem("token");
        const storedUserString = localStorage.getItem("user");

        let parsedUser = null;

        if (storedUserString && storedUserString !== "undefined") {
            try {
                parsedUser = JSON.parse(storedUserString);
                console.log("AuthContext: Initial load, parsed user from localStorage:", parsedUser); // Debugging log
            } catch (error) {

                console.error("AuthContext: Error parsing user data from localStorage:", error);
                localStorage.removeItem("user");
            }
        }

        if (storedToken && storedToken !== "undefined" && parsedUser) {
            setUser(parsedUser);
            console.log("AuthContext: Initial load, user and token found. Setting user state."); // Debugging log
        } else {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            console.log("AuthContext: Initial load, no valid user/token found in localStorage."); // Debugging log
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
                isAuthenticated: user !== null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;