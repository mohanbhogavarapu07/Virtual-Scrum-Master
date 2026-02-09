import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Minimal AppContext - data now comes from API hooks (useApiHooks.ts)
interface AppContextType {
  userRole: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={{ userRole: "ADMIN" }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
