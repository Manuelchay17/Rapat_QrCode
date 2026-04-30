"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, Search, MapPin, Calendar, 
  Clock, Eraser, PenTool, UserPlus, ChevronRight 
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
    rapatType: "with_reg"
  });

  // --- STATE PROSES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [manualDivision, setManualDivision] = useState("");
  const [manualInstansi, setManualInstansi] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [dbPeserta, setDbPeserta] = useState<any[]>([]);
  const [SignatureComponent, setSignatureComponent] = useState<any>(null);

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
          setEventData({
            title: data.title,
            location: data.location,
            timeOnly: data.endTime ? `${data.time} - ${data.endTime}` : `${data.time} WIB`,
            rapatType: data.rapat_type || "with_reg"
          });
        }

        const partRes = await fetch(`/api/events/${eventId}/participants`);
        if (partRes.ok) {
          const partData = await partRes.json();
          setDbPeserta(partData);
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

  if (status === "success") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-blue-500/20 p-10 rounded-[3rem] shadow-2xl shadow-black/50 flex flex-col items-center text-center">
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-slate-950 border border-emerald-500/40 w-24 h-24 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
            Presensi Berhasil
          </h1>
          
          <div className="h-1 w-8 bg-blue-600 rounded-full my-4" />

          <p className="text-blue-100 font-bold text-lg leading-tight mb-2">
            Selamat mengikuti kegiatan hari ini
          </p>
          
          <div className="mt-8 pt-6 border-t border-blue-500/10 w-full group">
             <div className="bg-slate-950/50 rounded-2xl p-4 border border-blue-500/5 transition-colors group-hover:border-blue-500/20 text-left">
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-1">Agenda Anda</p>
                <p className="text-xs font-bold text-slate-300 line-clamp-2">{eventData.title}</p>
             </div>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="mt-10 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            SELESAI
          </button>
        </div>
        
        <p className="text-center mt-8 text-slate-800 text-[9px] font-bold uppercase tracking-widest">
          Sistem Absensi Digital • 2024
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-md mx-auto pt-4 space-y-6">
        
        {/* --- HEADER DINAMIS DENGAN FIX WRAP UNTUK MOBILE --- */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 shadow-2xl shadow-blue-900/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shrink-0">
              <Calendar size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Agenda Rapat</p>
              <h1 className="font-bold text-xl leading-tight mb-3">
                {eventData.title || "Memuat Agenda..."}
              </h1>
              
              {/* Container Jam & Lokasi: Menggunakan flex-wrap agar tidak terpotong di HP */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 border-t border-blue-500/10 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium shrink-0">
                  <Clock size={14} className="text-blue-500 shrink-0" />
                  <span>{eventData.timeOnly || "..."}</span>
                </div>
                
                {/* Divider vertical: disembunyikan di layar sangat kecil jika wrap terjadi */}
                <div className="hidden sm:block h-3 w-[1px] bg-slate-700"></div>

                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium min-w-0">
                  <MapPin size={14} className="text-blue-500 shrink-0" />
                  <span className="leading-tight">{eventData.location || "..."}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 p-8 rounded-[2.5rem] space-y-8 shadow-xl">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none transition-all text-sm"
                    onChange={(e) => setManualDivision(e.target.value)}
                  />
                  <input 
                    placeholder="Instansi / Unit Kerja..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none transition-all text-sm"
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
              {status === "verifying" ? "MEMPROSES..." : "KONFIRMASI HADIR"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}