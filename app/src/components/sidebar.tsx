"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, QrCode, Users, FileText } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Event Rapat", href: "/dashboard/admin/events", icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    /* Tambahkan h-full atau h-screen agar background biru gelapnya sampai ke bawah */
    <aside className="w-64 h-full min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 text-lg font-semibold tracking-wide">
        <span className="text-blue-500">QR</span> Absensi
      </div>

      <p className="px-6 text-xs uppercase tracking-widest text-slate-500 mb-3">
        Menu Utama
      </p>

      <nav className="px-4 space-y-1 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                ${
                  active
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bagian bawah akan tetap di bawah karena ada flex-1 di nav */}
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
        v1.0.0 • Internal Office System
      </div>
    </aside>
  );
}