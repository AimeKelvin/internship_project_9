"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Eye, EyeOff, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      Cookies.set("token", data.token, { expires: 7 });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#FFFDF8]">

      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative">
        <img
          src="/login.png"
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />

     
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        
        <div className="relative z-10 flex flex-col justify-end h-full p-12 lg:p-16 text-white max-w-lg">

        
         <div className="mb-8">
  <div className="inline-flex items-center gap-3 bg-[#0A3D2F] backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-900/60 shadow-2xl">
    <img 
      src="/icon.png" 
      alt="Platr OS" 
      className="w-9 h-9 object-contain" 
    />
    <span className="font-semibold text-2xl tracking-tight text-white">
      Platr OS
    </span>
  </div>
</div>

          <h1 className="text-5xl lg:text-6xl font-semibold leading-tight tracking-tighter">
            Manage your restaurant{" "}
            <span className="text-[#adf760]">in real time</span>
          </h1>

          <p className="mt-6 text-lg text-white/90 max-w-md">
            Streamline orders, tables, kitchen operations, and analytics — all in one powerful system.
          </p>

 
          <div className="mt-12 space-y-3 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#adf760]" />
              <span>Real-time order tracking</span>
            </div>

            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#adf760]" />
              <span>Table & reservation management</span>
            </div>

            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#adf760]" />
              <span>Kitchen display system</span>
            </div>
          </div>
        </div>

    
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

 
      <div className="w-full lg:w-2/5 xl:w-1/3 flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">

     
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <img src="/icon.png" alt="Platr OS" className="w-10 h-10 object-contain" />
            <span className="font-bold text-3xl text-gray-900">
              Platr OS
            </span>
          </div>


          <div className="mb-10 px-10">
            <h2 className="text-4xl font-semibold text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Sign in to access your restaurant dashboard
            </p>
          </div>

   
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 px-10">

        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="you@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#adf760] focus:border-transparent"
                />
              </div>
            </div>

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#adf760] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

     
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#adf760]"
                />
                <span className="text-gray-700">Remember me</span>
              </label>

              <a
                href="#"
                className="text-[#b6f27d] hover:opacity-80 font-medium"
              >
                Forgot password?
              </a>
            </div>

         
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#adf760] hover:bg-[#b6f27d] text-black font-semibold py-4 rounded-2xl transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-12 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Platr OS • Restaurant Management System
          </p>
        </div>
      </div>
    </div>
  );
}