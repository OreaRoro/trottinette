import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout, userRole } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <nav className="bg-white shadow-md px-4 py-2 border-b border-gray-200 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Titre masqué en mobile */}
        <h1 className="text-2xl font-semibold tracking-wider hidden md:block">
          Location de Trottinette
        </h1>

        {/* Hamburger bouton (mobile) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-2xl focus:outline-none cursor-pointer"
        >
          <FiMenu />
        </button>

        {/* Menu horizontal (desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          {userRole === "admin" ? (
            <>
              <Link to="/" className="hover:underline">
                Voir le site
              </Link>
              <Link to="/admin" className="hover:underline">
                Administration
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:underline">
                Accueil
              </Link>
              <Link to="/profile" className="hover:underline">
                Mes Réservations
              </Link>
            </>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-md bg-blue-300 text-white hover:bg-blue-500"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant du haut */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-transparent bg-opacity-40 z-40"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-full bg-white shadow-md z-50 animate-slide-down">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Location de Trottinette</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-2xl cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-4">
              {userRole === "admin" ? (
                <>
                  <Link to="/" onClick={() => setMenuOpen(false)}>
                    Voir le site
                  </Link>
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    Administration
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => setMenuOpen(false)}>
                    Accueil
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>
                    Mes Réservations
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 rounded bg-blue-300 text-white hover:bg-blue-500 cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
