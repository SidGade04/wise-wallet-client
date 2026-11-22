import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/ui/page-transition";
import { PageLoading } from "@/components/ui/loading";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Banks from "./pages/Banks";
import Subscriptions from "./pages/Subscriptions";
import Assistant from "./pages/Assistant";
import Upgrade from "./pages/Upgrade";
import Investments from "./pages/Investments";
import NotFound from "./pages/NotFound";
import { PaymentDebugTool } from '@/components/debug/PaymentDebugTool';
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 2,
    },
  },
});

// Inner component with routes and animations
const AppContent = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiresBankConnection={true}>
            <AppLayout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute requiresBankConnection={true}>
            <AppLayout>
              <PageTransition>
                <Transactions />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/banks" element={
          <ProtectedRoute requiresBankConnection={true}>
            <AppLayout>
              <PageTransition>
                <Banks />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/subscriptions" element={
          <ProtectedRoute requiresBankConnection={true} requiresSubscription={true}>
            <AppLayout>
              <PageTransition>
                <Subscriptions />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/investments" element={
          <ProtectedRoute requiresBankConnection={true} requiresSubscription={true}>
            <AppLayout>
              <PageTransition>
                <Investments />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/assistant" element={
          <ProtectedRoute requiresBankConnection={true} requiresSubscription={true}>
            <AppLayout>
              <PageTransition>
                <Assistant />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/upgrade" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition>
                <Upgrade />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/debug-payment" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition>
                <PaymentDebugTool />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition>
                <SettingsPage />
              </PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;