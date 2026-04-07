"use client";

import {
  LayoutDashboard,
  Users,
  Coffee,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import { TabType } from "@/app/admin/page";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const items = [
    { key: "dashboard" as TabType, icon: LayoutDashboard, label: "Home" },
    { key: "users" as TabType, icon: Users, label: "Staff" },
    { key: "menu" as TabType, icon: Coffee, label: "Menu" },
    { key: "tables" as TabType, icon: UtensilsCrossed, label: "Tables" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 pb-safe shadow-xl">
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>

      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <motion.button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label={item.label}
            >
              {/* Active background highlight */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-3 top-2 h-9 rounded-full -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
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
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-green-700 drop-shadow-sm"
                      : "text-gray-500"
                  }`}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight transition-all duration-300 ${
                  isActive ? "text-green-700 font-bold" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>

              {/* 🔥 Your animated dot (restored) */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 w-1.5 h-1.5 bg-green-700 rounded-full"
                  layoutId="activeDot"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
            </motion.button>
          );
        })}

        {/* LOGOUT BUTTON */}
        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full"
        >
          <LogOut size={24} className="text-red-500" />
          <span className="text-[11px] text-red-600 font-medium">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}
