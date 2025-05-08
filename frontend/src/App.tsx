import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Navbar from "./components/Navbar.tsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Admin from "./pages/Admin.tsx";
import Footer from "./components/Footer.tsx";
import MesReservations from "./pages/MesReservations.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";

function App() {
  const { isAuthenticated, userRole } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {isAuthenticated ? <Home /> : <Navigate to="/login" />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {isAuthenticated ? <MesReservations /> : <Navigate to="/login" />}
            </ProtectedRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
