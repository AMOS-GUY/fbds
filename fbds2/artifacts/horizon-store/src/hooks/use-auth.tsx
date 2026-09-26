import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("horizon_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("horizon_user");
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("horizon_user", JSON.stringify(newUser));
    toast({
      title: "Welcome back",
      description: `Logged in as ${newUser.firstName}`,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("horizon_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("horizon_user", JSON.stringify(updatedUser));
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  if (!isLoaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
