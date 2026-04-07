"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Clock, CheckCircle2, AlertCircle, ChefHat, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type OrderItem = {
  id: number;
  menuItem: {
    name: string;
    category: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
};

type Order = {
  id: number;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  table: { tableNumber: number };
  orderItems: OrderItem[];
  createdAt: string;
};

export default function RecentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingServeOrder, setPendingServeOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    try {
      const res = await api.get("/orders");
      const sorted = (res.data as Order[]).sort((a, b) => {
        const priority = { READY: 1, PREPARING: 2, PENDING: 3, SERVED: 4 };
        return priority[a.status] - priority[b.status];
      });
      setOrders(sorted);
    } catch {
      console.error("Failed to load orders");
    }
  }

async function handleServe(orderId: number) {
  try {
    await api.patch(`/orders/${orderId}/status`, {
      status: "SERVED",
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "SERVED" } : o
      )
    );

    setPendingServeOrder(null);
  } catch (err) {
    console.error(err);
    alert("Failed to mark as served");
  }
}

  const statusMap = {
    PENDING: {
      label: "Pending",
      color: "bg-gray-100 text-gray-700",
      icon: Clock,
    },
    PREPARING: {
      label: "Cooking",
      color: "bg-yellow-100 text-yellow-700",
      icon: ChefHat,
    },
    READY: {
      label: "Ready",
      color: "bg-green-100 text-green-700",
      icon: AlertCircle,
    },
    SERVED: {
      label: "Served",
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle2,
    },
  };

  const readyCount = orders.filter((o) => o.status === "READY").length;

  return (
    <ProtectedRoute allowedRoles={["WAITER"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-40">
          <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kitchen Orders
              </h1>
              <p className="text-sm text-gray-500">
                Live updates • every 8 seconds
              </p>
            </div>

            {readyCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-semibold shadow">
                {readyCount} Ready
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No active orders</p>
              <p className="text-sm">You're all caught up</p>
            </div>
          ) : (
            orders.map((order) => {
              const total = order.orderItems.reduce(
                (sum, i) => sum + i.menuItem.price * i.quantity,
                0
              );

              const status = statusMap[order.status];
              const Icon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl border shadow-sm ${
                    order.status === "READY"
                      ? "border-green-400 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    {/* Top */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Table {order.table.tableNumber} •{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {status.label}
                        </div>

                        {order.status === "READY" && (
                          <button
                            onClick={() => setPendingServeOrder(order)}
                            className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900"
                          >
                            Serve
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.menuItem.imageUrl ? (
                              <img
                                src={item.menuItem.imageUrl}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                            )}
                            <div>
                              <p className="font-medium">
                                {item.quantity} × {item.menuItem.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.menuItem.category}
                              </p>
                            </div>
                          </div>

                          <p className="font-semibold text-gray-800">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    {order.status === "SERVED" && (
                      <div className="pt-4 mt-4 border-t flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {pendingServeOrder && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setPendingServeOrder(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed z-50 inset-0 flex items-center justify-center px-4"
              >
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                  <div className="flex justify-between mb-4">
                    <h2 className="font-bold text-lg">Confirm Serve</h2>
                    <button onClick={() => setPendingServeOrder(null)}>
                      <X />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Serve Order #{pendingServeOrder.id} (Table{" "}
                    {pendingServeOrder.table.tableNumber})?
                  </p>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-2 rounded-lg bg-gray-100"
                      onClick={() => setPendingServeOrder(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-2 rounded-lg bg-black text-white"
                      onClick={() => handleServe(pendingServeOrder.id)}
                    >
                      Serve
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}