"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, Search, MapPin, Calendar, 
  Clock, Eraser, PenTool, UserPlus, ChevronRight,
  XCircle, AlertCircle, Loader2
} from "lucide-react";
import { useParams } from "next/navigation";

export default function VerificationScanPage() {
  const params = useParams();
  const eventId = params.id as string;
  const sigCanvas = useRef<any>(null);

  // --- STATE DATA EVENT ---
  const [eventData, setEventData] = useState({
    title: "",
    location: "",
    timeOnly: "",
    rapatType: "with_reg",
    isPast: false,
    isManualOpen: false
  });

  // --- STATE PROSES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [manualDivision, setManualDivision] = useState("");
  const [manualInstansi, setManualInstansi] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "loading">("loading");
  const [dbPeserta, setDbPeserta] = useState<any[]>([]);
  const [SignatureComponent, setSignatureComponent] = useState<any>(null);

  // Fungsi cek waktu lampau
  const isEventPast = (dateRaw: string, time: string) => {
    const eventDateTime = new Date(`${dateRaw}T${time}`);
    return eventDateTime < new Date();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SigCanvas = require("react-signature-canvas");
      setSignatureComponent(() => SigCanvas.default || SigCanvas);
    }
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const eventRes = await fetch(`/api/events/${eventId}`);
        if (eventRes.ok) {
          const data = await eventRes.json();
          
          // Logic pengecekan apakah akses diizinkan
          const past = isEventPast(data.dateRaw, data.endTime || data.time);
          
          setEventData({
            title: data.title,
            location: data.location,
            timeOnly: data.endTime ? `${data.time} - ${data.endTime}` : `${data.time} WIB`,
            rapatType: data.rapat_type || "with_reg",
            isPast: past,
            isManualOpen: !!data.isManualOpen
          });

          // Jika tidak lewat ATAU dibuka manual oleh admin, baru load peserta
          if (!past || data.isManualOpen) {
            const partRes = await fetch(`/api/events/${eventId}/participants`);
            if (partRes.ok) {
              const partData = await partRes.json();
              setDbPeserta(partData);
            }
            setStatus("idle");
          } else {
            setStatus("idle"); // Status idle tapi nanti di-render sebagai 'Expired' berdasarkan eventData
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    if (eventId) loadAllData();
  }, [eventId]);

  useEffect(() => {
    if (eventData.rapatType === "with_reg" && searchTerm.length > 1 && !selectedUser) {
      const filtered = dbPeserta.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        p.status !== "present"
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, dbPeserta, selectedUser, eventData.rapatType]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
    setSuggestions([]);
  };

  const clearSignature = () => {
    const canvas = sigCanvas.current;
    if (canvas) {
      const api = canvas.clear ? canvas : canvas.instance;
      if (api) api.clear();
    }
  };

  const handleConfirmAttendance = async () => {
    const finalName = eventData.rapatType === "no_reg" ? searchTerm : selectedUser?.name;
    const finalDivision = eventData.rapatType === "no_reg" 
      ? `${manualDivision} - ${manualInstansi}` 
      : selectedUser?.division;

    if (!finalName) return alert("Silakan isi nama lengkap.");

    let finalSignature = "";
    const canvas = sigCanvas.current;
    const api = canvas?.getTrimmedCanvas ? canvas : canvas?.instance;
    
    if (api && !api.isEmpty()) {
      finalSignature = api.getTrimmedCanvas().toDataURL("image/png");
    } else {
      return alert("Silakan bubuhkan tanda tangan.");
    }

    setStatus("verifying");
    try {
      const response = await fetch("/api/absensi/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          division: finalDivision || "Umum",
          rapatId: eventId, 
          signature: finalSignature,
        }),
      });

      if (response.ok) setStatus("success");
      else setStatus("idle");
    } catch (err) {
      setStatus("idle");
    }
  };

  // --- TAMPILAN LOADING AWAL ---
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">Menyiapkan Sistem...</p>
      </div>
    );
  }

  // --- TAMPILAN JIKA RAPAT SUDAH BERAKHIR ---
  if (eventData.isPast && !eventData.isManualOpen) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-sm z-10 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-red-500/20 p-10 rounded-[3rem] shadow-2xl">
            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Rapat Berakhir</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Maaf, waktu akses absensi untuk agenda ini telah ditutup secara otomatis.
            </p>
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 text-left mb-8">
               <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-1">Nama Agenda</p>
               <p className="text-xs font-bold text-slate-300">{eventData.title}</p>
            </div>
            <p className="text-[10px] text-slate-500 font-medium italic">Silakan hubungi administrator jika Anda memerlukan bantuan.</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Perbarui Halaman</button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN BERHASIL ---
  if (status === "success") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-blue-500/20 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-slate-950 border border-emerald-500/40 w-24 h-24 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">Presensi Berhasil</h1>
          <div className="h-1 w-8 bg-blue-600 rounded-full my-4" />
          <p className="text-blue-100 font-bold text-lg leading-tight mb-2">Selamat mengikuti kegiatan hari ini</p>
          
          <button onClick={() => window.location.reload()} className="mt-10 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95">
            SELESAI
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-md mx-auto pt-4 space-y-6">
        
        {/* --- HEADER --- */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shrink-0">
              <Calendar size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Agenda Rapat</p>
                {eventData.isManualOpen && (
                  <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-black animate-pulse">LATE-ACCESS</span>
                )}
              </div>
              <h1 className="font-bold text-xl leading-tight mb-3 line-clamp-2">
                {eventData.title || "Memuat Agenda..."}
              </h1>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 border-t border-blue-500/10 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium shrink-0">
                  <Clock size={14} className="text-blue-500" />
                  <span>{eventData.timeOnly}</span>
                </div>
                <div className="hidden sm:block h-3 w-[1px] bg-slate-700"></div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium min-w-0">
                  <MapPin size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">{eventData.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FORM ABSENSI --- */}
        <div className="bg-slate-900 border border-slate-800/60 p-8 rounded-[2.5rem] space-y-8 shadow-xl relative overflow-hidden">
          {eventData.isManualOpen && (
             <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3 mb-2">
               <AlertCircle size={16} className="text-amber-500 shrink-0" />
               <p className="text-[10px] text-amber-200/70 font-medium leading-snug">
                 Sesi ini dibuka khusus oleh Admin untuk peserta yang datang terlambat.
               </p>
             </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {eventData.rapatType === "no_reg" ? "Identitas Peserta" : "Konfirmasi Nama"}
            </label>
            <div className="space-y-3">
              <div className="relative">
                {eventData.rapatType === "no_reg" ? 
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} /> : 
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                }
                <input 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (selectedUser) setSelectedUser(null); }}
                  placeholder={eventData.rapatType === "no_reg" ? "Nama Lengkap..." : "Cari nama Anda..."} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-4 focus:border-blue-500 outline-none transition-all" 
                />
                
                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    {suggestions.map((p, i) => (
                      <button key={i} onClick={() => handleSelectUser(p)} className="w-full px-6 py-4 text-left hover:bg-blue-600/10 flex items-center justify-between border-b border-slate-800 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{p.division || "Umum"}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-700" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {eventData.rapatType === "no_reg" && (
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    placeholder="Jabatan/Divisi..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none text-sm"
                    onChange={(e) => setManualDivision(e.target.value)}
                  />
                  <input 
                    placeholder="Instansi / Unit Kerja..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none text-sm"
                    onChange={(e) => setManualInstansi(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-500 ${(eventData.rapatType === "no_reg" || selectedUser) ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <PenTool size={14} className="text-blue-500" /> Tanda Tangan Digital
                </label>
                <button onClick={clearSignature} className="text-[10px] text-red-500 font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  <Eraser size={14} className="inline mr-1" /> Hapus
                </button>
              </div>
              <div className="bg-white rounded-[1.5rem] border-4 border-slate-800 h-48 flex items-center justify-center relative shadow-inner overflow-hidden cursor-crosshair">
                {SignatureComponent && (
                  <SignatureComponent 
                    ref={sigCanvas}
                    penColor="#000"
                    canvasProps={{ className: "w-full h-48", style: { touchAction: 'none' } }}
                  />
                )}
              </div>
            </div>
            
            <button 
              disabled={status === "verifying"}
              onClick={handleConfirmAttendance}
              className="w-full py-5 rounded-[1.5rem] font-black tracking-widest text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-95 transition-all uppercase disabled:bg-slate-800"
            >
              {status === "verifying" ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>MEMPROSES...</span>
                </div>
              ) : "KONFIRMASI HADIR"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-800 text-[9px] font-bold uppercase tracking-widest">Sistem Absensi Digital • 2026</p>
      </div>
    </div>
  );
}