"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      Cookies.set("token", data.token, { expires: 7 });
      router.push("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full  flex items-center justify-center px-4 relative overflow-hidden">

      {/* Decorative blurred circles */}
      <div className="absolute w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl top-10 left-10 animate-pulse opacity-70"></div>
      <div className="absolute w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl bottom-10 right-10 animate-pulse opacity-60"></div>

      {/* Card */}
      <div className="relative max-w-md w-full bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20 animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/icon.png"
            alt="Platr OS"
            className="w-20 h-20 mx-auto drop-shadow-md"
          />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Platr OS 
          </h1>
         <p className="text-gray-600 mt-1">
  Welcome to Platr OS — sign in as an admin, waiter, or kitchen staff.
</p>

        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/60 border border-gray-300 rounded-xl p-3.5 pl-12 text-gray-800 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/60 border border-gray-300 rounded-xl p-3.5 pl-12 pr-12 text-gray-800 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-800 hover:bg-emerald-700 disabled:bg-green-600  text-white p-3.5 rounded-xl font-semibold shadow-lg  transition flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Platr OS — All rights reserved.
        </p>
      </div>
    </div>
  );
}
