import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomTabs } from "./MobileBottomTabs";
import { useIsMobile } from "@/hooks/useMobile";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - completely hidden on mobile */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Header - simplified on mobile with safe area */}
          <header className={`flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm ${
            isMobile ? 'h-16 pt-safe-area-inset-top' : 'h-16'
          }`}>
            <div className="flex items-center px-4 lg:px-6">
              <SidebarTrigger className="lg:hidden" />
            </div>
            <div className="flex items-center gap-4 px-4 lg:px-6">
              {/* Settings icon for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="p-2 lg:hidden"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className={`flex-1 overflow-auto ${isMobile ? 'p-4 pb-bottom-nav' : 'p-6'}`}>
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Tabs - only show on mobile */}
      <div className="lg:hidden">
        <MobileBottomTabs />
      </div>
    </SidebarProvider>
  );
}