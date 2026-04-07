"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X, Home, ChefHat, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function decodeToken(token: string) {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const decoded = decodeToken(token);
    if (decoded) {
      setUser({
        name: decoded.name || decoded.sub,
        role: decoded.role,
      });
    }
  }, []);

  const logout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const navItems = [
    { href: "/waiter/new-order", label: "Waiter", icon: ChefHat, roles: ["WAITER", "ADMIN"] },
    { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["KITCHEN", "ADMIN"] },
    { href: "/admin", label: "Admin", icon: Settings, roles: ["ADMIN"] },
  ];

  const visibleItems = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/waiter" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/icon.png"
                  alt="Platr OS"
                  className="w-10 h-10 object-contain rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
                />
                <motion.div
                  className="absolute inset-0 bg-black/5 rounded-xl blur-xl scale-0 group-hover:scale-100 transition-transform"
                  initial={false}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                Platr OS
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group px-5 py-3 rounded-2xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-black" : "text-gray-500"}`} />
                      <span className={`font-medium transition-colors ${isActive ? "text-black" : "text-gray-600"}`}>
                        {item.label}
                      </span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="navbarActiveTab"
                        className="absolute inset-0 bg-black/5 rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Hover Glow */}
                    <motion.div
                      className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 -z-10 transition-opacity"
                      initial={false}
                    />
                  </Link>
                );
              })}
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm border border-gray-300">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-200 z-50 shadow-2xl">
          <div className="flex justify-around items-center h-20 px-4">
            {visibleItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full"
                >
                  <motion.div
                    animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon
                      className={`w-7 h-7 transition-all duration-300 ${
                        isActive ? "text-black" : "text-gray-500"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs mt-1 font-medium transition-all ${
                      isActive ? "text-black font-bold" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Mobile Logout */}
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center flex-1 h-full text-red-600"
            >
              <LogOut className="w-7 h-7" />
              <span className="text-xs mt-1 font-medium">Logout</span>
            </button>
          </div>
          <div className="h-safe" />
          <style jsx>{`
            .h-safe { height: env(safe-area-inset-bottom); }
          `}</style>
        </div>
      </nav>

      {/* Mobile Menu Toggle (Top-right) */}
      <div className="md:hidden fixed top-4 right-5 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {user && (
                <div className="mb-8 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 transition"
                    >
                      <Icon className="w-6 h-6 text-gray-700" />
                      <span className="text-lg font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-10 pt-10 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}