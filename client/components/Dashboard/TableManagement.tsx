"use client";
import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Users, MapPin, Plus } from "lucide-react";
import Modal from "../ui/Modal";
import api from "@/lib/api";

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  section?: string;
}

interface TableManagementProps {
  tables: Table[];
  reload: { tables: () => Promise<void>; all?: () => Promise<void> };
}

const TableManagement: React.FC<TableManagementProps> = ({ tables, reload }) => {
  const [tableNumber, setTableNumber] = useState(
    tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1
  );
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState("");
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync tableNumber when tables change
  useEffect(() => {
    if (tables.length > 0) {
      setTableNumber(Math.max(...tables.map(t => t.tableNumber)) + 1);
    } else {
      setTableNumber(1);
    }
  }, [tables]);

  async function handleCreate(e: React.FormEvent) {
  e.preventDefault();
  setCreating(true);
  try {
    await api.post("/tables", {
      tableNumber,
      capacity,
      section: section.trim() || null,
    });

    // reset inputs
    setTableNumber(prev => prev + 1);
    setCapacity(4);
    setSection("");
    setIsModalOpen(false);

    // ✅ safe reload
    if (reload?.tables) {
      await reload.tables();
    }
  } catch (err: any) {
    console.error("create table", err);
    alert(err?.response?.data?.message || "Failed to create table");
  } finally {
    setCreating(false);
  }
}

  const tablesBySection = tables.reduce((acc, table) => {
    const sec = table.section || "General";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const sortedSections = Object.keys(tablesBySection).sort();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Table Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Organize your restaurant floor plan
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-3.5 rounded-xl shadow-md transition text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            Add Table
          </button>
        </div>

        {/* Visual Floor Layout */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6" />
            Floor Plan
          </h3>

          {tables.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700">No tables yet</p>
              <p className="text-sm text-gray-500 mt-2">Start adding tables to build your floor plan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {tables.map(table => (
                <div
                  key={table.id}
                  className="relative bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  {/* Capacity Badge */}
                  <div className="absolute -top-3 -right-3 bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm shadow-lg">
                    {table.capacity}
                  </div>

                  <UtensilsCrossed className="w-10 h-10 mb-3 text-green-600" />

                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-lg">Table {table.tableNumber}</div>
                    {table.section && (
                      <div className="text-xs text-green-800 border border-green-200 bg-green-100 px-2 py-1 rounded-full mt-2 font-medium">
                        {table.section}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tables by Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-green-600" />
            Tables by Section
          </h3>

          {sortedSections.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No tables added yet</p>
          ) : (
            <div className="space-y-8">
              {sortedSections.map(sec => (
                <div key={sec}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      {sec} ({tablesBySection[sec].length} table{tablesBySection[sec].length !== 1 ? "s" : ""})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tablesBySection[sec].map(table => (
                      <div
                        key={table.id}
                        className="bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4 transition-all duration-200"
                      >
                        <div className="w-14 h-14 rounded-full bg-green-100/20 flex items-center justify-center font-bold border border-green-200 text-xl shadow-sm">
                          {table.tableNumber}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Table {table.tableNumber}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Users className="w-4 h-4" />
                            {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Table Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Table">
        <form onSubmit={handleCreate} className="space-y-5 p-1">
          <div className="relative">
            <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min={1}
              placeholder="Table Number"
              value={tableNumber}
              onChange={(e) => setTableNumber(Math.max(1, Number(e.target.value)))}
              required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min={1}
              placeholder="Capacity (number of seats)"
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
              required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Section (e.g. Patio, VIP, Bar) – optional"
              value={section}
              onChange={(e) => setSection(e.target.value)}
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
              disabled={creating}
              className="order-1 sm:order-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {creating ? "Adding Table..." : <><Plus className="w-5 h-5" />Add Table</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TableManagement;