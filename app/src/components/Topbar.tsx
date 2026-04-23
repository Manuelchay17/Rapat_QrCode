"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Circle, LogOut, Key, User, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getPageDetails = () => {
    if (pathname === "/dashboard/admin/events") {
      return { title: "Event Rapat", subtitle: "Manajemen daftar dan jadwal rapat" };
    }
    if (pathname === "/dashboard") {
      return { title: "Dashboard", subtitle: "Monitoring rapat & absensi real-time" };
    }
    return { title: "Sistem Absensi", subtitle: "Selamat datang di panel kontrol" };
  };

  const { title, subtitle } = getPageDetails();

  return (
    <header className="h-20 px-10 flex items-center justify-between bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      
      {/* BAGIAN KIRI - DINAMIS */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-[10px] text-slate-400 font-medium italic uppercase tracking-wider">{subtitle}</p>
      </div>

      {/* BAGIAN KANAN - STATUS & USER */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <Circle size={8} className="fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sistem Online</span>
        </div>

        {/* PROFIL DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 pl-6 border-l border-slate-800 group"
          >
            <div className="flex flex-col items-end hidden sm:flex text-right">
              <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Admin</span>
              <span className="text-[10px] text-blue-400 font-medium uppercase tracking-tighter">Full Access</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg border border-blue-400/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* MENU DROPDOWN */}
          {isOpen && (
            <>
              {/* Overlay untuk menutup dropdown saat klik di luar */}
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
              
              <div className="absolute right-0 mt-4 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/30">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Akun Terhubung</p>
                  <p className="text-sm font-medium text-white truncate">admin@gmail.com</p>
                </div>

                <div className="p-2">
                  {/* Ganti link lama dengan ini */}
<Link 
  href="/dashboard/profile"
  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all group"
>
  <User size={16} className="text-slate-500 group-hover:text-white" />
  <span>Edit Profil</span>
</Link>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                  >
                    <LogOut size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                    <span className="font-semibold">Keluar Sistem</span>
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