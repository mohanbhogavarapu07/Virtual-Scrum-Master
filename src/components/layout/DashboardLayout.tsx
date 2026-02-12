import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};
