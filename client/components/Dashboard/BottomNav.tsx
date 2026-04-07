"use client";

import { useMemo } from "react";
import { LayoutDashboard, Users, Coffee, UtensilsCrossed, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { TabType } from "@/app/admin/page";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

interface NavItem {
  key: TabType;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  color?: string; // optional per-item color
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const items: NavItem[] = useMemo(
    () => [
      { key: "dashboard", icon: LayoutDashboard, label: "Home", color: "text-[#0A3D2F]" },
      { key: "users", icon: Users, label: "Staff", color: "text-[#0A3D2F]" },
      { key: "menu", icon: Coffee, label: "Menu", color: "text-[#0A3D2F]" },
      { key: "tables", icon: UtensilsCrossed, label: "Tables", color: "text-[#0A3D2F]" },
    ],
    []
  );

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <style>{`.pb-safe { padding-bottom: env(safe-area-inset-bottom); }`}</style>

      <div className="flex justify-around items-center h-20 px-3 pb-safe">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <motion.button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl -all duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active background highlight */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-3 top-2 h-10 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon animation */}
              <motion.div
                animate={{
                  y: isActive ? -4 : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${isActive ? item.color : "text-gray-400"}`}
                />
              </motion.div>

              {/* Active dot */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 w-1.5 h-1.5 bg-[#0A3D2F] rounded-full"
                  layoutId="activeDot"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}

              <span
                className={`text-[11px] font-medium transition-colors duration-300 ${
                  isActive ? item.color : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}

      
        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-all duration-300"
          aria-label="Logout"
        >
          <LogOut size={24} className="text-red-700" />
          <span className="text-[11px] text-red-700 font-medium">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}