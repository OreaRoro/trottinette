import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";

const Login: React.FC = () => {
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Connexion</h2>
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Votre e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Se connecte
        </button>
      </form>
    </div>
  );
};

export default Login;
