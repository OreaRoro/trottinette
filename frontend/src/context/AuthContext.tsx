import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  userEmail: string | null;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Vérifie localStorage au chargement
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    if (email && role) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserRole(role);
    }
  }, []);

  const login = (email: string) => {
    const role = email === "admin@mail.com" ? "admin" : "user";
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setUserEmail(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, userEmail, userRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
