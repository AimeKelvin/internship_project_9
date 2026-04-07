"use client";
import React from "react";
import {
  ShoppingBag,
  Clock,
  Users as UsersIcon,
  ArrowUp,
  DollarSign,
} from "lucide-react";

// -----------------------------
// TYPES & HELPERS (unchanged)
// -----------------------------
type MenuItem = { id?: number; name?: string; category?: string; price?: number };
type OrderItem = { id?: number; menuItem: MenuItem; quantity?: number };
type Order = {
  id: number;
  status?: string;
  table?: { tableNumber?: number };
  waiter?: { name?: string };
  orderItems: OrderItem[];
  createdAt?: string | number;
};
type User = { id: number; name?: string; role?: string };

interface AnalyticsDashboardProps {
  users: User[];
  orders: Order[];
}

const safeNum = (v: any) => (typeof v === "number" ? v : 0);
const fmt = (v: number) => `$${v.toFixed(2)}`;


const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ users = [], orders = [] }) => {

  const ordersPerWaiter = users
    .filter((u) => u.role === "WAITER")
    .map((u) => ({
      ...u,
      orderCount: orders.filter((o) => o.waiter?.name === u.name).length,
    }))
    .sort((a, b) => b.orderCount - a.orderCount);

  const maxWaiterCount = Math.max(1, ...ordersPerWaiter.map((w) => w.orderCount));

  const itemTotals: Record<string, number> = {};
  orders.forEach((o) => {
    (o.orderItems || []).forEach((it) => {
      const name = it?.menuItem?.name || "Unknown";
      itemTotals[name] = (itemTotals[name] || 0) + safeNum(it.quantity);
    });
  });

  const sortedItems = Object.entries(itemTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxItemCount = Math.max(1, ...sortedItems.map((i) => i[1]));

  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = (order.orderItems || []).reduce(
      (t, it) => t + safeNum(it.quantity) * safeNum(it.menuItem?.price),
      0
    );
    return sum + orderTotal;
  }, 0);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const todayDate = start.getTime();
  const yesterdayDate = todayDate - 86400000;

  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt || "").getTime() >= todayDate)
    .reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce(
        (t, it) => t + safeNum(it.quantity) * safeNum(it.menuItem?.price),
        0
      );
      return sum + orderTotal;
    }, 0);

  const yesterdayRevenue = orders
    .filter((o) => {
      const t = new Date(o.createdAt || "").getTime();
      return t >= yesterdayDate && t < todayDate;
    })
    .reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce(
        (t, it) => t + safeNum(it.quantity) * safeNum(it.menuItem?.price),
        0
      );
      return sum + orderTotal;
    }, 0);

  const revenueGrowth =
    yesterdayRevenue > 0
      ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
      : "0";

  const pendingOrders = orders.filter((o) => (o.status || "").toUpperCase() === "PENDING").length;
  const inProgressOrders = orders.filter((o) => (o.status || "").toUpperCase() === "IN_PROGRESS").length;
  const completedOrders = orders.filter((o) => ["COMPLETED", "SERVED"].includes((o.status || "").toUpperCase())).length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      change: `+${revenueGrowth}% today`,
      icon: ShoppingBag,
      color: "bg-blue-600",
    },
    {
      title: "Revenue",
      value: fmt(totalRevenue),
      change: `+${revenueGrowth}% vs yesterday`,
      icon: DollarSign,
      color: "bg-green-700",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      change: `${inProgressOrders} in progress`,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Staff Members",
      value: users.length,
      change: `${users.filter((u) => u.role === "WAITER").length} waiters`,
      icon: UsersIcon,
      color: "bg-purple-600",
    },
  ];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Your restaurant performance overview
            </p>
          </div>

          <div className="text-right sm:text-left">
            <p className="text-xs text-gray-500">Today</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">{todayStr}</p>
          </div>
        </div>

        {/* Stats Grid - 1→2→4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
               
              </div>
            </div>
          ))}
        </div>

        {/* Waiters + Items - Stack on mobile, side-by-side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Waiters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
              Top Performing Waiters
            </h3>

            <div className="space-y-4">
              {ordersPerWaiter.length > 0 ? (
                ordersPerWaiter.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-green-900 flex items-center justify-center font-bold text-green-900 text-sm sm:text-base">
                        {u.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{u.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{u.orderCount} orders</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-green-700 to-green-900 transition-all duration-700"
                        style={{ width: `${(u.orderCount / maxWaiterCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No waiters found</p>
              )}
            </div>
          </div>

          {/* Most Ordered Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
              Most Ordered Items
            </h3>

            <div className="space-y-4">
              {sortedItems.length > 0 ? (
                sortedItems.map(([name, qty], index) => (
                  <div
                    key={name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full  border-2 border-green-900 flex items-center justify-center font-bold text-green-900 text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                        {name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="font-bold text-gray-700 text-sm">{qty}×</span>
                      <div className="flex-1 sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-700 to-green-900 transition-all duration-700"
                          style={{ width: `${(qty / maxItemCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No item data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;