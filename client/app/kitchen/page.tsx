"use client";

import React, { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { initSocket } from "@/lib/socket";

type OrderItem = {
  id: number;
  menuItem: { name: string; category: string; imageUrl?: string };
  quantity: number;
  specialInstructions?: string | null;
};

type Order = {
  id: number;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  table: { tableNumber: number };
  orderItems: OrderItem[];
  createdAt?: string;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Stable sorting (no UI jumping)
  const sortOrders = (list: Order[]) => {
    const priority = { PENDING: 1, PREPARING: 2, READY: 3 };
    return [...list].sort(
      (a, b) =>
        priority[a.status] - priority[b.status] ||
        new Date(a.createdAt || "").getTime() -
          new Date(b.createdAt || "").getTime()
    );
  };

  const upsertOrder = (order: Order) => {
    setOrders((prev) => {
      let updated;

      if (order.status === "SERVED") {
        updated = prev.filter((o) => o.id !== order.id);
      } else {
        const exists = prev.some((o) => o.id === order.id);
        updated = exists
          ? prev.map((o) => (o.id === order.id ? order : o))
          : [order, ...prev];
      }

      return sortOrders(updated);
    });
  };

  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    // ✅ Only load ONCE
    const loadInitial = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(
          sortOrders(res.data.filter((o: Order) => o.status !== "SERVED"))
        );
      } catch {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();

    socket.emit("joinRoom", "kitchen");

    socket.on("orderCreated", (order: Order) => {
      if (order.status !== "SERVED") {
        upsertOrder(order);

        // 🔊 instant feedback
        audioRef.current?.play().catch(() => {});
      }
    });

    socket.on("orderUpdated", (order: Order) => {
      upsertOrder(order);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function changeStatus(id: number, status: Order["status"]) {
    // ✅ optimistic update
    upsertOrder({ ...(orders.find((o) => o.id === id) as Order), status });

    try {
      await api.patch(`/orders/${id}/status`, { status });
    } catch {
      // rollback
      const res = await api.get("/orders");
      setOrders(
        sortOrders(res.data.filter((o: Order) => o.status !== "SERVED"))
      );
    }
  }

  return (
    <ProtectedRoute allowedRoles={["KITCHEN"]}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <audio ref={audioRef} src="/sounds/new-order.mp3" />

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kitchen</h1>
          <span className="text-sm text-gray-500">
            {orders.length} active orders
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No active orders
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {orders.map((o) => (
              <div
                key={o.id}
                className={`rounded-xl border bg-white flex flex-col ${
                  o.status === "READY"
                    ? "border-green-400"
                    : o.status === "PREPARING"
                    ? "border-yellow-400"
                    : "border-gray-200"
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b">
                  <h2 className="font-semibold">
                    Order #{o.id} • Table {o.table.tableNumber}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {o.createdAt &&
                      new Date(o.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3 flex-1">
                  {o.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      {item.menuItem.imageUrl ? (
                        <img
                          src={item.menuItem.imageUrl}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md" />
                      )}

                      <div className="flex-1 text-sm">
                        <p className="font-medium">
                          {item.quantity} × {item.menuItem.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.menuItem.category}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-red-500">
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 border-t space-y-2">
                  {o.status === "PENDING" && (
                    <button
                      onClick={() => changeStatus(o.id, "PREPARING")}
                      className="w-full py-2 rounded-lg bg-yellow-500 text-white font-medium"
                    >
                      Start Cooking
                    </button>
                  )}

                  {o.status === "PREPARING" && (
                    <button
                      onClick={() => changeStatus(o.id, "READY")}
                      className="w-full py-2 rounded-lg bg-green-600 text-white font-medium"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}