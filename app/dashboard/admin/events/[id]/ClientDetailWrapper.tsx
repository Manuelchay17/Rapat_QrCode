"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Download,
  Share2,
  UserCheck,
  Check,
  UserRoundCheck,
  UserMinus,
  X,
  Printer,
  Info
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  dateRaw: string;
  time: string;
  endTime?: string | null;
  rapat_type: "with_reg" | "no_reg";
}

interface Participant {
  name: string;
  division: string;
  signature_data?: string;
  status: "registered" | "present";
  time: string;
}

interface ClientDetailWrapperProps {
  eventData: EventData;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

interface ParticipantRowProps {
  participant: Participant;
  isPresent: boolean;
}

export default function ClientDetailWrapper({ eventData }: ClientDetailWrapperProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<"hadir" | "belum" | null>(null);
  const [mounted, setMounted] = useState(false);

  const isNoReg = eventData.rapat_type === "no_reg";

  useEffect(() => {
    setMounted(true);
  }, []);

 const displayUrl = useMemo(() => {
  if (typeof window === "undefined") return "";
  const baseUrl = window.location.origin;
  
  
  const targetPath = `/scan/${eventData.id}`;
  
  return `${baseUrl}${targetPath}`;
}, [eventData.id]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`/api/events/${eventData.id}/participants`);
        if (response.ok) {
          const data = await response.json();
          setParticipants(data);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi:", err);
      }
    };

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [eventData.id]);

  const presentOnly = participants.filter(p => p.status === "present");
  const registeredOnly = participants.filter(p => p.status !== "present");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${eventData.title}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const formatIndoDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* Tombol Action: Menggunakan flexbox agar rapi di semua ukuran layar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mb-2 md:absolute md:-top-16 md:right-0">
        <button 
          onClick={() => window.open(`/rekap/${eventData.id}`, '_blank')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all active:scale-95 text-sm font-bold"
        >
          <Printer size={18} /> Cetak Rekap
        </button>
        {!isNoReg && (
          <button 
            onClick={handleCopyLink} 
            className={`flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl transition text-sm font-bold ${
              copied ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 shadow-lg"
            }`}
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? "Tersalin!" : "Salin Link Registrasi"}
          </button>
        )}
      </div>

      {/* Grid Info: 2 kolom di HP, 3 di tablet, 5 di desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <InfoItem icon={<CalendarDays size={18} />} label="Tanggal" value={formatIndoDate(eventData.dateRaw)} />
        <InfoItem 
          icon={<Clock size={18} />} 
          label="Waktu" 
          value={`${eventData.time} - ${eventData.endTime || "Selesai"}`} 
        />
        <InfoItem icon={<MapPin size={18} />} label="Lokasi" value={eventData.location} />
        <InfoItem icon={<UserRoundCheck size={18} />} label="Hadir" value={`${presentOnly.length}`} color="text-emerald-400" />
        <InfoItem icon={<Users size={18} />} label="Total" value={`${participants.length}`} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-[1.3rem] p-6 md:p-8 flex flex-col items-center shadow-sm h-fit lg:sticky lg:top-6">
            <h3 className="text-[10px] font-black mb-6 text-slate-500 uppercase tracking-widest text-center">
              {isNoReg ? "QR Presensi Langsung" : "QR Registrasi Peserta"}
            </h3>
            <div className="p-4 bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl min-h-[200px] w-full max-w-[240px] flex items-center justify-center overflow-hidden">
              {mounted ? (
                <QRCodeSVG id="qr-code-svg" value={displayUrl} size={200} level="H" className="w-full h-auto" />
              ) : (
                <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>
            <button 
              disabled={!mounted}
              onClick={downloadQRCode}
              className="mt-8 w-full sm:w-auto flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-bold transition group bg-blue-400/5 px-4 py-2.5 rounded-lg disabled:opacity-50"
            >
              <Download size={16} /> DOWNLOAD QR
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border-2 border-emerald-500/30 rounded-[1.1rem] overflow-hidden shadow-lg">
            <div className="bg-emerald-500/10 p-4 md:p-5 border-b border-emerald-500/20 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-[10px] md:text-xs text-emerald-400 uppercase tracking-widest">
                <UserCheck size={18} /> {isNoReg ? "Daftar Peserta Hadir" : "Sudah Verifikasi"}
              </h3>
              <button onClick={() => setActiveModal("hadir")} className="text-[10px] font-black text-blue-400 uppercase hover:underline">Lihat Semua</button>
            </div>
            <div className="p-3 md:p-5 space-y-3">
              {presentOnly.length === 0 ? <EmptyState text="Belum ada aktivitas" /> : presentOnly.slice(0, 5).map((p, i) => <ParticipantRow key={i} participant={p} isPresent={true} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Dioptimalkan agar tidak kepotong di layar kecil */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setActiveModal(null)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white">
                {activeModal === "hadir" ? "Detail Peserta Hadir" : "Daftar Tunggu"}
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-3 flex-1">
              {(activeModal === "hadir" ? presentOnly : registeredOnly).map((p, i) => <ParticipantRow key={i} participant={p} isPresent={activeModal === "hadir"} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value, color = "text-blue-400" }: InfoItemProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-sm hover:border-slate-600 transition-colors min-w-0">
      <div className={`${color} bg-current/10 p-2 md:p-2.5 rounded-xl shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{label}</p>
        <p className="text-xs md:text-sm font-bold truncate text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function ParticipantRow({ participant, isPresent }: ParticipantRowProps) {
  return (
    <div className={`flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl border ${isPresent ? "bg-emerald-500/5 border-emerald-500/10" : "bg-slate-900/60 border-slate-800"}`}>
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black ${isPresent ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
          {participant.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs md:text-sm text-slate-200 truncate">{participant.name}</p>
          <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold truncate">{participant.division || "Umum"}</p>
        </div>
      </div>
      <span className="shrink-0 text-[9px] md:text-[10px] text-slate-500 font-mono bg-slate-950/50 px-2 md:px-3 py-1.5 rounded-lg border border-slate-800/50 ml-2">
        {participant.time || "--:--"}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-slate-700 text-center">
      <Users size={32} className="mb-3 opacity-10" />
      <p className="text-[10px] italic font-bold tracking-widest uppercase opacity-40">{text}</p>
    </div>
  );
}