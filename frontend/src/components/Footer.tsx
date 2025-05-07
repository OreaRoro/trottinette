import React from "react";
import { useAuth } from "../context/AuthContext.tsx";

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 border-t mt-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Trottinettes Électriques. Tous
          droits réservés.
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-black transition">
            Mentions légales
          </a>
          <a href="#" className="hover:text-black transition">
            Conditions
          </a>
          <a href="#" className="hover:text-black transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
