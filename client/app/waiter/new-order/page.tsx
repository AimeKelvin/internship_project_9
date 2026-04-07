"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Plus, Minus, Trash2, ShoppingCart, Search, X, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
};
type OrderItemInput = { menuItemId: number; quantity: number };

type Toast = {
  id: string;
  type: "success" | "error";
  message: string;
};

export default function NewOrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItemInput[]>([]);
  const [tableNumber, setTableNumber] = useState<number | "">("");
  const [menuSearch, setMenuSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const res = await api.get("/menu-items");
      setMenu(res.data);
    } catch (err) {
      console.error("Failed to load menu");
    }
  }

  const addToast = (type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (menuItemId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const menuItem = menu.find((m) => m.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
  }, [cart, menu]);

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  async function submitOrder() {
    if (!tableNumber || cart.length === 0) return;

    try {
      await api.post("/orders", { tableNumber, items: cart });
      setCart([]);
      setTableNumber("");
      addToast("success", `Order sent to kitchen • Table ${tableNumber}`);
    } catch (err) {
      addToast("error", "Failed to send order. Try again.");
    }
  }

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );

  const filteredMenu = useMemo(() => {
    return menu.filter(
      (item) =>
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) &&
        (categoryFilter === "All" || item.category === categoryFilter)
    );
  }, [menu, menuSearch, categoryFilter]);

  return (
    <ProtectedRoute allowedRoles={["WAITER"]}>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-gray-100">
          <div className="px-5 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
                <p className="text-sm text-gray-500 mt-1">Table {tableNumber || "-"}</p>
              </div>
              <div className="relative">
                <ShoppingCart className="w-7 h-7 text-gray-700" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-6 space-y-8">
          {/* Table Number */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <input
              type="number"
              min={1}
              placeholder="Table number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value ? Number(e.target.value) : "")}
              className="w-full text-2xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:text-xl placeholder:font-medium placeholder:tracking-tight [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
            />
          </div>

          {/* Cart */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-400"
                >
                  <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p>No items added yet</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {cart.map((c) => {
                    const item = menu.find((m) => m.id === c.menuItemId);
                    if (!item) return null;

                    return (
                      <motion.div
                        key={c.menuItemId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(c.menuItemId, -1)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition">
                            <Minus className="w-4 h-4 mx-auto" />
                          </button>
                          <span className="w-10 text-center font-semibold text-lg">{c.quantity}</span>
                          <button onClick={() => updateQuantity(c.menuItemId, 1)} className="w-9 h-9 rounded-full bg-black text-white hover:bg-gray-800 active:scale-95 transition">
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                          <button onClick={() => removeFromCart(c.menuItemId)} className="ml-2 text-red-500 hover:bg-red-50 rounded-lg p-2 active:scale-95 transition">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Total & Submit */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-6 mt-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Total</span>
                  <span className="text-3xl font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={!tableNumber}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    tableNumber
                      ? "bg-white text-black hover:bg-gray-100 active:scale-98"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Send to Kitchen
                </button>
              </motion.div>
            )}
          </div>

          {/* Menu */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
                {menuSearch && (
                  <button onClick={() => setMenuSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMenu.map((item) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => item.isAvailable && addToCart(item.id)}
                    disabled={!item.isAvailable}
                    className={`relative overflow-hidden rounded-2xl bg-white shadow-sm border ${
                      item.isAvailable
                        ? "border-gray-200 hover:shadow-lg active:shadow-md"
                        : "border-gray-200 opacity-60"
                    } transition-all`}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="p-4 text-left">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      <div className="flex justify-between items-end mt-3">
                        <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                        {!item.isAvailable && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Unavailable</span>
                        )}
                      </div>
                    </div>
                    {item.isAvailable && (
                      <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition pointer-events-none flex items-center justify-center">
                        <Plus className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {filteredMenu.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">No items found</p>
                <p className="text-sm mt-2">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
  {/* Toast Notifications — NOW FULLY VISIBLE */}
<div className="fixed inset-x-0 bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none px-5">
  <div className="flex flex-col items-center gap-3">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          layout
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <div
            className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-2xl border ${
              toast.type === "success"
                ? "bg-white/95 border-green-200"
                : "bg-white/95 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0" />
              )}
              <span className="font-medium text-gray-900 text-sm sm:text-base">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
</div>
      </div>
    </ProtectedRoute>
  );
}