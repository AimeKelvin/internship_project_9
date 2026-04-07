"use client";

import React, { useEffect, useState } from "react";
import { TabType } from "@/app/admin/page";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coffee,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(
    null
  );

  const decodeToken = (token: string) => {
    try {
      const base64 = token.split(".")[1];
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({ name: decoded.name, role: decoded.role });
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
    { key: "users", label: "Staff", icon: <Users size={22} /> },
    { key: "menu", label: "Menu", icon: <Coffee size={22} /> },
    { key: "tables", label: "Tables", icon: <UtensilsCrossed size={22} /> },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR (lg and up) */}
      <aside
        className={`hidden lg:flex flex-col h-full w-64 transition-all duration-300 shadow-lg
        bg-slate-50  text-[#1F2937]`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Platr OS Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-black">Platr OS</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3  space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200
                ${
                  activeTab === item.key
                    ? "bg-green-100 shadow-md"
                    : "hover:bg-green-50"
                }`}
              onClick={() => setActiveTab(item.key as TabType)}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold text-white shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {user?.name || "Admin User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.role || "ADMIN"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-lg bg-red-500 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
