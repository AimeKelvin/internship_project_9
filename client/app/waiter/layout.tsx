"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";

type TabType = "new-order" | "recent-orders";

export default function Layout({ children }: { children: ReactNode }) {
const pathname = usePathname();
const router = useRouter();

// Determine active tab
const activeTab: TabType =
pathname?.includes("recent-orders") || pathname?.includes("/recents")
? "recent-orders"
: "new-order";

// BottomNav internal component
const BottomNav = () => {
const items: { key: TabType; icon: any; label: string; href: string }[] = [
{ key: "new-order", icon: ShoppingCart, label: "New Order", href: "/waiter/new-order" },
{ key: "recent-orders", icon: Clock, label: "Recent Orders", href: "/waiter/recents" },
];


const handleLogout = () => {
  localStorage.removeItem("token"); // Clear token/session
  router.push("/login");
};

return (
  <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-2xl border-t border-gray-200 z-50 shadow-2xl">
    <div className="relative flex justify-around items-center h-20 px-4">
      {/* Active Indicator Background */}
      <motion.div
        layoutId="activeTabBackground"
        className="absolute inset-x-4 top-3 h-12  rounded-3xl -z-10"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;

        return (
          <motion.button
            key={item.key}
            onClick={() => router.push(item.href)}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full"
            whileTap={{ scale: 0.95 }}
          >
            {/* Icon bounce */}
            <motion.div
              animate={{ y: isActive ? -6 : 0, scale: isActive ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Icon
                size={28}
                strokeWidth={isActive ? 2.8 : 2}
                className={`transition-colors duration-300 ${
                  isActive ? "text-green-700" : "text-gray-500"
                }`}
              />
            </motion.div>

            {/* Label */}
            <span
              className={`text-xs font-medium transition-all duration-300 ${
                isActive ? "text-green-700 font-bold" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>

            {/* Small active dot */}
            {isActive && (
              <motion.div
                className="absolute -top-1 w-2 h-2 bg-green-600 rounded-full shadow-md"
                layoutId="activeDotIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>

    <div className="h-safe pb-safe" />
    <style jsx>{`
      .h-safe {
        height: env(safe-area-inset-bottom);
      }
      .pb-safe {
        padding-bottom: env(safe-area-inset-bottom);
      }
    `}</style>
  </nav>
);

};

return ( <div className="flex flex-col min-h-screen pb-20 lg:pb-0"> <main className="flex-1">{children}</main> <BottomNav /> </div>
);
}
