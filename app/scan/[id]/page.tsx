"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, Search, MapPin, Briefcase, Building2,
  ChevronRight, Calendar, Clock, Eraser, 
  PenTool, UserPlus
} from "lucide-react";
import { useParams } from "next/navigation";

export default function VerificationScanPage() {
  const params = useParams();
  const eventId = params.id as string;
  const sigCanvas = useRef<any>(null);

  const [rapatType, setRapatType] = useState<"with_reg" | "no_reg">("with_reg");
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
          const eventData = await eventRes.json();
          if (eventData.rapat_type) setRapatType(eventData.rapat_type);
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
    if (rapatType === "with_reg" && searchTerm.length > 1 && !selectedUser) {
      const filtered = dbPeserta.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        p.status !== "present"
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, dbPeserta, selectedUser, rapatType]);

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
    const finalName = rapatType === "no_reg" ? searchTerm : selectedUser?.name;
    const finalDivision = rapatType === "no_reg" 
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <CheckCircle size={80} className="text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold uppercase tracking-tighter">Presensi Berhasil!</h1>
      <button onClick={() => window.location.reload()} className="mt-10 px-8 py-4 bg-blue-600 rounded-2xl text-xs font-black tracking-widest uppercase transition active:scale-95">
        SELESAI
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-md mx-auto pt-4 space-y-6">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Calendar size={24} /></div>
            <div>
              <h1 className="font-bold text-xl leading-tight">Konfirmasi Kehadiran</h1>
              <div className="flex gap-4 mt-2 text-[10px] text-blue-400 font-bold uppercase">
                <span className="flex items-center gap-1"><Clock size={12} /> Live Scan</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Lokasi Rapat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 p-8 rounded-[2.5rem] space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {rapatType === "no_reg" ? "Identitas Peserta (Input Manual)" : "Konfirmasi Nama (Cari Daftar)"}
            </label>
            <div className="space-y-3">
              <div className="relative">
                {rapatType === "no_reg" ? <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} /> : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />}
                <input 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (selectedUser) setSelectedUser(null); }}
                  placeholder={rapatType === "no_reg" ? "Nama Lengkap..." : "Cari nama..."} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-4 focus:border-blue-500 outline-none" 
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

              {rapatType === "no_reg" && (
                <>
                  <input 
                    placeholder="Jabatan..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none"
                    onChange={(e) => setManualDivision(e.target.value)}
                  />
                  <input 
                    placeholder="Instansi / UPD..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 focus:border-blue-500 outline-none"
                    onChange={(e) => setManualInstansi(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-500 ${(rapatType === "no_reg" || selectedUser) ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <PenTool size={14} className="text-blue-500" /> Tanda Tangan
                </label>
                <button onClick={clearSignature} className="text-[10px] text-red-500 font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                  <Eraser size={14} className="inline mr-1" /> Hapus
                </button>
              </div>
              <div className="bg-white rounded-[1.5rem] border-4 border-slate-800 h-48 flex items-center justify-center relative shadow-inner overflow-hidden">
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
              className="w-full py-5 rounded-[1.5rem] font-black tracking-widest text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-95 transition-all uppercase"
            >
              {status === "verifying" ? "MEMPROSES..." : "KONFIRMASI HADIR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}