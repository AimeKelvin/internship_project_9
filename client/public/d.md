"use client";
import React, { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import Menu from "@/components/Waiter/Menu";
import Cart from "@/components/Waiter/Cart";
import OrderList from "@/components/Waiter/OrderList";

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
};

export type CartItem = {
  menuItemId: number;
  quantity: number;
  specialInstructions?: string;
};

export type OrderItem = {
  id: number;
  menuItem: { name: string; category: string; price: number; imageUrl?: string };
  quantity: number;
  specialInstructions?: string;
};

export type Order = {
  id: number;
  status: string;
  table: { tableNumber: number };
  waiter?: { name: string };
  orderItems: OrderItem[];
  createdAt: Date;
};

const WaiterPage: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableNumber, setTableNumber] = useState<number | "">("");
  const [showServeModal, setShowServeModal] = useState(false);
  const [pendingServeOrder, setPendingServeOrder] = useState<Order | null>(null);

  // -------------------------
  // Cart Functions
  // -------------------------
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

  const removeFromCart = (menuItemId: number) =>
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(menuItemId);
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const submitOrder = () => {
    if (!tableNumber || cart.length === 0) {
      alert("Please select a table and add items to cart");
      return;
    }
    const newOrder: Order = {
      id: orders.length + 1,
      status: "PENDING",
      table: { tableNumber: Number(tableNumber) },
      waiter: { name: "Current Waiter" },
      orderItems: cart.map((c, index) => {
        const menuItem = menu.find((m) => m.id === c.menuItemId)!;
        return {
          id: index + 1,
          menuItem: { name: menuItem.name, category: menuItem.category, price: menuItem.price, imageUrl: menuItem.imageUrl },
          quantity: c.quantity,
          specialInstructions: c.specialInstructions,
        };
      }),
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setTableNumber("");
  };

  const confirmServe = (order: Order) => {
    setPendingServeOrder(order);
    setShowServeModal(true);
  };

  const markAsServed = (orderId: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "SERVED" } : o))
    );
    setPendingServeOrder(null);
    setShowServeModal(false);
  };

  // -------------------------
  // Categories for Menu Filter
  // -------------------------
  const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map((m) => m.category)))], [menu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
              W
            </div>
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Waiter Station</h1>
              <p className="text-sm text-orange-600">Take orders and manage service</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
            <LayoutDashboard size={18} /> Admin Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Menu menu={menu} addToCart={addToCart} />
        </div>
        <div className="lg:col-span-1">
          <Cart
            cart={cart}
            menu={menu}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            submitOrder={submitOrder}
          />
        </div>
        <div className="lg:col-span-3">
          <OrderList orders={orders} confirmServe={confirmServe} />
        </div>
      </div>

      {/* Serve Confirmation Modal */}
      {showServeModal && pendingServeOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Confirm Service</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to mark Order #{pendingServeOrder.id} for Table {pendingServeOrder.table.tableNumber} as served?
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setPendingServeOrder(null); setShowServeModal(false); }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => markAsServed(pendingServeOrder.id)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg"
              >
                Confirm Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterPage;
