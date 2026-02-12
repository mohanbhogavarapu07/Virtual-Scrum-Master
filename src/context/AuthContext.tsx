import { authApi, clearToken, getToken, setToken } from "@/lib/api";
import { ApiUser } from "@/types";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role?: "ADMIN" | "EMPLOYEE") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authApi.me();
      setUser(userData);
      // Refresh token so JWT role matches DB (e.g. if role was changed in Supabase from EMPLOYEE to ADMIN)
      const refreshed = await authApi.refresh();
      setToken(refreshed.token);
      if (refreshed.user) setUser(refreshed.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (fullName: string, email: string, password: string, role: "ADMIN" | "EMPLOYEE" = "EMPLOYEE") => {
    const response = await authApi.register({ full_name: fullName, email, password, role });
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthState: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // During HMR or if tree is wrong, context can be undefined; return safe default so app doesn't crash
  if (context === undefined) {
    if (import.meta.env.DEV) {
      console.warn("useAuth called outside AuthProvider – ensure AuthProvider wraps your app.");
    }
    return defaultAuthState;
  }
  return context;
};
