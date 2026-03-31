import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AIAssistant } from "./components/ai/AIAssistant";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Performance from "./pages/Performance";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import SprintBoard from "./pages/SprintBoard";
import Tasks from "./pages/Tasks";

/** Admin must select a project first; redirect global routes to project list. */
const AdminProjectRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") return <>{children}</>;
  return <Navigate to="/projects" replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RootRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "ADMIN" ? "/projects" : "/dashboard"} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    {/* Admin: redirect global dashboard/tasks/performance/analytics to projects so they select a project first */}
    <Route path="/dashboard" element={<ProtectedRoute><AdminProjectRedirect><Dashboard /></AdminProjectRedirect></ProtectedRoute>} />
    <Route path="/tasks" element={<ProtectedRoute><AdminProjectRedirect><Tasks /></AdminProjectRedirect></ProtectedRoute>} />
    <Route path="/performance" element={<ProtectedRoute><AdminProjectRedirect><Performance /></AdminProjectRedirect></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AdminProjectRedirect><Analytics /></AdminProjectRedirect></ProtectedRoute>} />
    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
    <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
    <Route path="/project/:id/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/project/:id/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
    <Route path="/project/:id/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
    <Route path="/project/:id/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="/sprint/:id" element={<ProtectedRoute><SprintBoard /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <AppRoutes />
          <AIAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
