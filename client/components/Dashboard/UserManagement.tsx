"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Lock, User as UserIcon } from "lucide-react";
import Modal from "../ui/Modal";
import api from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "WAITER" | "KITCHEN";
}

interface UserManagementProps {
  users: User[];
  reload: { users: () => Promise<void> };
}

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers, reload }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "WAITER" | "KITCHEN">("WAITER");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    WAITER: "bg-green-100 text-green-800 border-green-200",
    KITCHEN: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const roleLabels = {
    ADMIN: "Admin",
    WAITER: "Waiter",
    KITCHEN: "Kitchen",
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const optimisticUser: User = {
      id: Date.now(),
      name,
      email,
      role,
    };

    setUsers(prev => [...prev, optimisticUser]);
    setIsModalOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    setRole("WAITER");

    try {
      const res = await api.post("/users", { name, email, role, password });

      setUsers(prev =>
        prev.map(u => (u.id === optimisticUser.id ? res.data : u))
      );

      if (reload?.users) {
        await reload.users();
      }
    } catch (err: any) {
      setUsers(prev => prev.filter(u => u.id !== optimisticUser.id));
      setIsModalOpen(true);
      console.error("create user", err);
      alert(err?.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Staff Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your restaurant team members
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#adf760] hover:bg-[#98fd39] text-[#0A3D2F] font-medium px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
          >
            <UserPlus className="w-5 h-5 text-[#0A3D2F]" />
            Add Staff Member
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Existing Staff</h3>
            <p className="text-sm text-gray-500 mt-1">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-700 text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sm:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No staff members yet</p>
              <p className="text-sm mt-2">Click "Add Staff Member" to get started</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Staff Member">
        <div className="p-1">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <select
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base appearance-none bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="WAITER">Waiter</option>
              <option value="KITCHEN">Kitchen Staff</option>
              <option value="ADMIN">Admin</option>
            </select>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                className="order-1 sm:order-2 px-6 py-3.5 bg-[#adf760] hover:bg-[#98fd39] text-[#0A3D2F] disabled:bg-gray-300 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Add Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;