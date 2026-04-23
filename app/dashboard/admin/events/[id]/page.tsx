import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CalendarCheck } from "lucide-react";
import ClientDetailWrapper from "./ClientDetailWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id: id },
  });

  if (!event) {
    notFound();
  }

  const eventDateTime = new Date(`${event.dateRaw}T${event.time}`);
  const now = new Date();
  const isExpired = eventDateTime < now;

  const eventDataFormatted = {
    ...event,
    rapat_type: event.rapat_type as "with_reg" | "no_reg",
  };

  const isNoReg = event.rapat_type === "no_reg";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Mengatur padding container agar konsisten di mobile */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/dashboard/admin/events" 
            className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition w-fit"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Kembali ke Daftar Event</span><span className="sm:hidden">Kembali</span>
          </Link>
          
          <div className="flex flex-col gap-4">
            <div>
              {/* Judul responsif: text-2xl di mobile, text-3xl di desktop */}
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Status Live vs Selesai */}
                {!isExpired ? (
                  <p className="text-emerald-400 text-[10px] sm:text-sm flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </p>
                ) : (
                  <p className="text-slate-400 text-[10px] sm:text-sm flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    <CalendarCheck size={14} />
                    Selesai
                  </p>
                )}

                {/* Tipe Registrasi */}
                <span className="text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase border border-blue-500/20">
                  {isNoReg ? "Tanpa Reg" : "Registrasi"}
                </span>

                {/* Indikator Proteksi Edit */}
                {isExpired && (
                  <span className="text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold uppercase border border-amber-500/20 flex items-center gap-1">
                    <Lock size={12} /> Read Only
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kirim data event lengkap ke Client Component */}
        <ClientDetailWrapper eventData={eventDataFormatted} />

      </div>
    </div>
  );
}