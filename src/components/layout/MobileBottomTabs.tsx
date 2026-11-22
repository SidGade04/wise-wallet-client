import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Building2,
  CreditCard,
  Bot,
  LineChart
} from "lucide-react";
import { useAuth } from "@/store/useAuth";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Banks", url: "/banks", icon: Building2 },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
  { title: "Investments", url: "/investments", icon: LineChart },
  { title: "AI Assistant", url: "/assistant", icon: Bot },
];

export function MobileBottomTabs() {
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border/50 backdrop-blur-md z-50 lg:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg transition-all duration-200 touch-target ${
                isActive
                  ? "text-primary-foreground bg-primary shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-accent/50 active:bg-accent/70"
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium leading-tight">{item.title}</span>
          </NavLink>
        ))}
      </div>
      
      {/* Safe area for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-background/95" />
    </div>
  );
}
