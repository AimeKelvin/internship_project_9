"use client";

import React, { useState, useMemo } from "react";
import { Coffee, Tag, DollarSign, Image, Plus, Search, X } from "lucide-react";
import Modal from "../ui/Modal";

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
  createMenuItem: (menuItemData: {
    name: string;
    category: string;
    price: number;
    imageUrl?: string;
  }) => Promise<void>;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, createMenuItem }) => {
  const [menuName, setMenuName] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuPrice, setMenuPrice] = useState(0);
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createMenuItem({
        name: menuName,
        category: menuCategory,
        price: menuPrice,
        imageUrl: menuImageUrl || undefined,
      });

      setMenuName("");
      setMenuCategory("");
      setMenuPrice(0);
      setMenuImageUrl("");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(menuItems.map((i) => i.category))), [menuItems]);

  const menuByCategory = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header + Controls */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Menu Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage your restaurant's delicious offerings
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#adf760] hover:bg-[#98fd39] text-[#0A3D2F] font-medium px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-green-800 outline-none transition text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-green-900 outline-none transition text-base appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-8">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Coffee className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700">No menu items found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm || categoryFilter
                  ? "Try adjusting your search or filter"
                  : "Start by adding your first delicious item!"}
              </p>
            </div>
          ) : (
            Object.entries(menuByCategory).map(([category, items]) => (
              <section key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-700 rounded-full"></span>
                    {category}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                      >
                        {item.imageUrl ? (
                          <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Coffee className="w-16 h-16 text-gray-300" />
                          </div>
                        )}

                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 text-lg line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-9
                            00">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.isAvailable ? (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* Add Menu Item Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Menu Item">
        <form onSubmit={handleSubmit} className="space-y-5 p-1">
          <div className="relative">
            <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Dish Name"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Category (e.g. Appetizers, Mains)"
              value={menuCategory}
              onChange={(e) => setMenuCategory(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              min={0}
              value={menuPrice || ""}
              onChange={(e) => setMenuPrice(Number(e.target.value))}
              required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="relative">
            <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Image URL (optional)"
              value={menuImageUrl}
              onChange={(e) => setMenuImageUrl(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="order-2 sm:order-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 px-6 py-3.5 bg-[#adf760] hover:bg-[#98fd39] text-[#0A3D2F] diabled:gray-300 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Adding Item..."
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Menu
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManagement;