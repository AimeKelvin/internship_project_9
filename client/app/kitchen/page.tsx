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

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    border: "border-l-gray-300",
    count: 0,
  },
  PREPARING: {
    label: "Preparing",
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-800 border-yellow-200",
    border: "border-l-yellow-400",
    count: 0,
  },
  READY: {
    label: "Ready",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-800 border-green-200",
    border: "border-l-green-500",
    count: 0,
  },
  SERVED: {
    label: "Served",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    border: "border-l-blue-400",
    count: 0,
  },
};

function elapsed(createdAt?: string) {
  if (!createdAt) return null;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

function ElapsedBadge({ createdAt }: { createdAt?: string }) {
  const [label, setLabel] = useState(elapsed(createdAt));
  useEffect(() => {
    const t = setInterval(() => setLabel(elapsed(createdAt)), 30000);
    return () => clearInterval(t);
  }, [createdAt]);
  if (!label) return null;
  return (
    <span className="text-xs text-gray-400 tabular-nums">{label}</span>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order["status"] | "ALL">("ALL");
  const socketRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sortOrders = (list: Order[]) => {
    const priority = { PENDING: 1, PREPARING: 2, READY: 3, SERVED: 4 };
    return [...list].sort(
      (a, b) =>
        priority[a.status] - priority[b.status] ||
        new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
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

    const loadInitial = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(sortOrders(res.data.filter((o: Order) => o.status !== "SERVED")));
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
        audioRef.current?.play().catch(() => {});
      }
    });

    socket.on("orderUpdated", (order: Order) => {
      upsertOrder(order);
    });

    return () => { socket.disconnect(); };
  }, []);

  async function changeStatus(id: number, status: Order["status"]) {
    upsertOrder({ ...(orders.find((o) => o.id === id) as Order), status });
    try {
      await api.patch(`/orders/${id}/status`, { status });
    } catch {
      const res = await api.get("/orders");
      setOrders(sortOrders(res.data.filter((o: Order) => o.status !== "SERVED")));
    }
  }

  const counts = orders.reduce(
    (acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <ProtectedRoute allowedRoles={["KITCHEN"]}>
      <audio ref={audioRef} src="/sounds/new-order.mp3" />

      <div className="min-h-screen bg-gray-50">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Kitchen Display</h1>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500">{orders.length} active order{orders.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["PENDING", "PREPARING", "READY"] as const).map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                    filter === s
                      ? STATUS_CONFIG[s].badge + " border-current"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => setFilter(filter === s ? "ALL" : s)}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                  <span className="font-bold">{counts[s] || 0}</span>
                </div>
              ))}
              {filter !== "ALL" && (
                <button
                  onClick={() => setFilter("ALL")}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No orders{filter !== "ALL" ? ` in ${STATUS_CONFIG[filter as Order["status"]].label}` : ""}</p>
              <p className="text-sm text-gray-400">New orders will appear here automatically</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((o) => {
                const totalItems = o.orderItems.reduce((s, i) => s + i.quantity, 0);
                const hasInstructions = o.orderItems.some((i) => i.specialInstructions);

                return (
                  <div
                    key={o.id}
                    className={`bg-white rounded-2xl border border-gray-200 border-l-4 flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md ${STATUS_CONFIG[o.status].border} m-5`}
                  >
                    {/* Card header */}
                    <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-base">Table {o.table.tableNumber}</span>
                            <span className="text-gray-300 text-sm">·</span>
                            <span className="text-sm text-gray-500">#{o.id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <ElapsedBadge createdAt={o.createdAt} />
                            {hasInstructions && (
                              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                Notes
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_CONFIG[o.status].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[o.status].dot}`} />
                          {STATUS_CONFIG[o.status].label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="px-5 py-4 flex-1 space-y-3">
                      {o.orderItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {item.menuItem.imageUrl ? (
                            <img
                              src={item.menuItem.imageUrl}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                              alt={item.menuItem.name}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.menuItem.name}</p>
                              <span className="shrink-0 text-sm font-bold text-gray-700 bg-gray-100 rounded-md px-1.5 py-0.5 tabular-nums">
                                ×{item.quantity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{item.menuItem.category}</p>
                            {item.specialInstructions && (
                              <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {(o.status === "PENDING" || o.status === "PREPARING") && (
                      <div className="px-5 pb-5 pt-1">
                        {o.status === "PENDING" && (
                          <button
                            onClick={() => changeStatus(o.id, "PREPARING")}
                            className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Start cooking
                          </button>
                        )}
                        {o.status === "PREPARING" && (
                          <button
                            onClick={() => changeStatus(o.id, "READY")}
                            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Mark ready
                          </button>
                        )}
                      </div>
                    )}

                    {o.status === "READY" && (
                      <div className="px-5 pb-5 pt-1">
                        <div className="w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium text-sm flex items-center justify-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Ready for pickup
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}