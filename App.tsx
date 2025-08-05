import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './context/AppContext';
import { ReactNode, useEffect } from 'react';

// Pages
import Calendar from './pages/Calendar';
import Maintenance from './pages/Maintenance';
import Cleaning from './pages/Cleaning';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';

// Protected route wrapper
interface ProtectedRouteProps {
  children: ReactNode;
}

// All components that use useAppContext must be inside AppRoutes
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { getCurrentUser } = useAppContext();
  const location = useLocation();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// This is now a component inside the App function to ensure correct context usage
const RouteSetup = () => {
  const { getCurrentUser } = useAppContext();
  const currentUser = getCurrentUser();
  
  // Check if user has a temporary password that needs to be changed
  useEffect(() => {
    if (currentUser?.tempPassword && window.location.pathname !== '/set-password') {
      window.location.href = '/set-password';
    }
  }, [currentUser]);
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes that require authentication */}
      <Route path="/set-password" element={
        <ProtectedRoute>
          <SetPassword />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      } />
      
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Maintenance />
        </ProtectedRoute>
      } />
      
      <Route path="/cleaning" element={
        <ProtectedRoute>
          <Cleaning />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

// Important: The component hierarchy must be:
// 1. QueryClientProvider
// 2. AppProvider 
// 3. BrowserRouter
// 4. Components that use useAppContext

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <RouteSetup />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
