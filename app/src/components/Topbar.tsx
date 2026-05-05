"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Circle, LogOut, User, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getPageDetails = () => {
    if (pathname === "/dashboard/admin/events") {
      return { title: "Event Rapat", subtitle: "Manajemen daftar rapat" };
    }
    if (pathname === "/dashboard") {
      return { title: "Dashboard", subtitle: "Monitoring real-time" };
    }
    return { title: "Sistem Absensi", subtitle: "Panel Kontrol" };
  };

  const { title, subtitle } = getPageDetails();

  return (
    // Perubahan: px-4 di mobile, px-8 di desktop. h-16 di mobile agar tidak terlalu makan tempat.
    <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 w-full">
      
      {/* BAGIAN KIRI - DINAMIS */}
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-base md:text-xl font-bold text-white tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-medium italic uppercase tracking-wider truncate">
          {subtitle}
        </p>
      </div>

      {/* BAGIAN KANAN */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Status Online - Sembunyikan di mobile sangat kecil */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 px-2 md:px-3 py-1 rounded-full border border-emerald-500/20">
          <Circle size={6} className="fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">Online</span>
        </div>

        {/* PROFIL DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-slate-800 group"
          >
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Admin</span>
              <span className="text-[10px] text-blue-400 font-medium uppercase tracking-tighter">Full Access</span>
            </div>
            
            {/* Avatar: Perkecil sedikit di mobile */}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg border border-blue-400/20 group-hover:scale-105 transition-transform text-sm md:text-base">
              A
            </div>
            <ChevronDown size={12} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* MENU DROPDOWN */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
              
              {/* Dropdown position: geser sedikit agar tidak off-screen di mobile */}
              <div className="absolute right-0 mt-3 w-48 md:w-56 bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-800/30 lg:hidden">
                   <p className="text-[9px] font-bold text-blue-400 uppercase">Admin Account</p>
                </div>

                <div className="p-1.5 md:p-2">
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg md:rounded-xl transition-all group"
                  >
                    <User size={16} className="text-slate-500 group-hover:text-white" />
                    <span>Profil</span>
                  </Link>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all group"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span className="font-semibold">Keluar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}