"use client"; // Pastikan ada ini karena kita pakai state

import React, { useState } from "react";
import Sidebar from "@/app/src/components/sidebar";
import Topbar from "@/app/src/components/Topbar";
import { Menu, X } from "lucide-react"; // Import icon untuk tombol menu

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden">
      
      {/* OVERLAY: Muncul saat sidebar dibuka di mobile untuk menggelapkan background */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Hidden di mobile, muncul sebagai drawer saat isSidebarOpen true */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-slate-950 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:block
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Tombol Close di dalam sidebar (khusus mobile) */}
        <button 
          className="lg:hidden absolute right-4 top-4 p-2 text-slate-400"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR: Kita modifikasi sedikit untuk menerima tombol menu */}
        <header className="flex items-center px-4 md:px-6 h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 mr-4 bg-slate-800 rounded-lg lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-10 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}