"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { initSocket } from "@/lib/socket";
import Sidebar from "@/components/Dashboard/Sidebar";
import BottomNav from "@/components/Dashboard/BottomNav";
import AnalyticsDashboard from "@/components/Dashboard/AnalyticsDashboard";
import UserManagement from "@/components/Dashboard/UserManagement";
import MenuManagement from "@/components/Dashboard/MenuManagement";
import TableManagement from "@/components/Dashboard/TableManagement";
import { Loader2 } from "lucide-react";

export type TabType = "dashboard" | "users" | "menu" | "tables";

type User = { id: number; name: string; email: string; role: "ADMIN" | "WAITER" | "KITCHEN" };
type MenuItem = { id: number; name: string; category?: string; price?: number; isAvailable?: boolean; imageUrl?: string };
type Table = { id: number; tableNumber: number; capacity: number; section?: string };
type OrderItem = { id?: number; menuItem: { name: string; category?: string; price?: number }; quantity: number };
type Order = {
  id: number;
  status?: string;
  table?: { tableNumber?: number };
  waiter?: { name?: string };
  orderItems: OrderItem[];
  createdAt?: string | number;
};

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();

    const socket = initSocket();

    socket.on("orderCreated", (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("orderUpdated", (order: Order) => {
      setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    });

    socket.on("menuUpdated", () => loadMenu());
    socket.on("userUpdated", () => loadUsers());
    socket.on("tableUpdated", () => loadTables());

    return () => {
      try {
        socket.off("orderCreated");
        socket.off("orderUpdated");
        socket.off("menuUpdated");
        socket.off("userUpdated");
        socket.off("tableUpdated");
        socket.disconnect();
      } catch {}
    };
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      await Promise.all([loadUsers(), loadOrders(), loadMenu(), loadTables()]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("loadUsers error", err);
    }
  }

  async function loadOrders() {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("loadOrders error", err);
    }
  }

  async function loadMenu() {
    try {
      const res = await api.get("/menu-items");
      setMenu(res.data);
    } catch (err) {
      console.error("loadMenu error", err);
    }
  }

  async function loadTables() {
    try {
      const res = await api.get("/tables");
      setTables(res.data);
    } catch (err) {
      console.error("loadTables error", err);
    }
  }

  async function createUser(userData: { name: string; email: string; role: string; password: string }) {
    try {
      await api.post("/users", userData);
      await loadUsers();
    } catch (err) {
      console.error("createUser error", err);
      throw err;
    }
  }

  async function createMenuItem(menuItemData: { name: string; category: string; price: number; imageUrl?: string }) {
    try {
      await api.post("/menu-items", { ...menuItemData, isAvailable: true });
      await loadMenu();
    } catch (err) {
      console.error("createMenuItem error", err);
      throw err;
    }
  }

  async function createTable(tableData: { tableNumber: number; capacity: number; section?: string }) {
    try {
      await api.post("/tables", tableData);
      await loadTables();
    } catch (err) {
      console.error("createTable error", err);
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[##FFFDF8] min-h-screen relative">

     
      <div
        className={`hidden bg-[##FFFDF8] lg:block sticky top-0 h-screen shrink-0 ${
          sidebarOpen ? "w-60" : "w-20"
        } transition-width duration-300`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-6 bg-[#FFFDF8] pb-24 lg:pb-6">
        <div className="animate-fade-in space-y-6">
          {activeTab === "dashboard" && <AnalyticsDashboard users={users} orders={orders} />}
          {activeTab === "users" && (
            <UserManagement users={users} //@ts-ignore
              createUser={createUser}
            />
          )}
          {activeTab === "menu" && (
            <MenuManagement //@ts-ignore
              menuItems={menu}
              createMenuItem={createMenuItem}
            />
          )}
          {activeTab === "tables" && (
            <TableManagement tables={tables} //@ts-ignore
              createTable={createTable}
            />
          )}
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;
