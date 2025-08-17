import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/home/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CartPage from "./pages/CartPage";
import { useUserStore } from "./stores/useUserStore.js";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CategoryPage from "./pages/CategoryPage.jsx";

function App() {
    const { user, loading, checkAuth } = useUserStore();
    useEffect(() => {
        checkAuth(); // Check if user is logged in on app load
    }, [checkAuth]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />

            {/* Content */}
            <div className="relative z-10 pt-20">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/login" element={user ? <Homepage /> : <LoginPage />} />
                    <Route path="/signup" element={user ? <Homepage /> : <SignupPage />} />
                    <Route
                        path="/admin-dashboard"
                        element={user?.role === "admin" ? <AdminDashboard /> : <LoginPage />}
                    />
                    <Route path="/cart" element={user ? <CartPage /> : <LoginPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
