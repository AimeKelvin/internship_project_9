"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const [ok, setOk] = useState<null | boolean>(null);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
        const res = await api.get("/users/me");
        const role = res.data.role;

        // Admin can enter anything
        if (role === "ADMIN" || allowedRoles.includes(role)) {
          setOk(true);
        } else {
          alert("Forbidden");
          router.push("/dashboard"); // redirect to dashboard or forbidden page
        }
      } catch {
        router.push("/login"); // not logged in
      }
    }
    check();
  }, [allowedRoles, router]);

  if (ok === null) return <div>Loading...</div>;
  return <>{children}</>;
}
