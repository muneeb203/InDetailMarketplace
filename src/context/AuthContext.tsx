import { createContext, useContext, useState, ReactNode } from "react";
import type { Customer, Detailer } from "../types";

export type AppUser = ((Customer | Detailer) & { role: "client" | "detailer" }) | null;

interface AuthContextValue {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<AppUser>(null);

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserState(user);
  };

  const clearUser = () => {
    setCurrentUserState(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

