"use client";

import "./globals.css";
import React from "react";
import Navbar from "../components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // List of routes where navbar should NOT appear
  const hideNavbar =
    pathname === "/login" || 
    pathname.startsWith("/auth") || 
    pathname.startsWith("/admin"); // hide navbar on admin pages

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* Render navbar only if NOT hidden */}
        {!hideNavbar && <Navbar />}

        <main >
          {children}
        </main>
      </body>
    </html>
  );
}
