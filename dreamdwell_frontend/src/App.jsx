// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routers/AppRouter.jsx";
import Navbar from "./layouts/navbar.jsx";
import Footer from "./layouts/footer.jsx";
import AuthContextProvider from "./auth/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

// Create a single instance of the QueryClient to be used throughout the app.
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>

            <AuthContextProvider>
                <Router>
                    <Navbar />
                    <div className="pt-[70px]">
                        <AppRoutes />
                    </div>
                    <Footer/>
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
            </AuthContextProvider>
        </QueryClientProvider>
    );
}

export default App;