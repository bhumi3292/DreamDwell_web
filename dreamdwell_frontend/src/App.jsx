import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routers/AppRouter.jsx"
import Navbar from "./layouts/navbar.jsx"; // Adjust path if necessary
import AuthContextProvider from "./auth/AuthProvider"; // Adjust path if necessary
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css"; // Your global CSS

const queryClient = new QueryClient();

function App() {
    return (
        <AuthContextProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Navbar />
                    <div className="pt-[70px]">
                        <AppRoutes /> {/* This is where all your routes are handled */}
                    </div>
                </Router>
                <ToastContainer
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </QueryClientProvider>
        </AuthContextProvider>
    );
}

export default App;