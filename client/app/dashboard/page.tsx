"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    async function go() {
      try {
        const res = await api.get("/users/me");
        const role = res.data.role;
        if (role === "ADMIN") router.push("/admin");
        else if (role === "WAITER") router.push("/waiter");
        else router.push("/kitchen");
      } catch {
        router.push("/login");
      }
    }
    go();
  }, [router]);

  return <div>Redirecting...</div>;
}
