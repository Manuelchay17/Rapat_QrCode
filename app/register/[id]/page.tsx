"use client";

import React, { useState } from "react";
import { User, Briefcase, Building2, Send, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function RegistrationPage() {
  const params = useParams();
  const rapatId = params.id;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", division: "", instansi: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/absensi/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          // Menggabungkan Jabatan dan Instansi dengan separator " - "
          division: `${formData.division} - ${formData.instansi}`, 
          rapatId: rapatId 
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const error = await res.json();
        alert(error.message || "Gagal registrasi");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <CheckCircle size={80} className="text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold">Registrasi Berhasil!</h1>
        <p className="text-slate-400 mt-2">Terima kasih {formData.name}, nama Anda sudah masuk daftar peserta.</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-blue-500 text-sm underline">Daftar Orang Lain</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-md mx-auto pt-12">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold">Registrasi Rapat</h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-semibold opacity-70">Masukkan Data Diri Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama lengkap..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jabatan</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                placeholder="Contoh: IT Support / Manager"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Instansi / OPD</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                value={formData.instansi}
                onChange={(e) => setFormData({...formData, instansi: e.target.value})}
                placeholder="Contoh: Kominfo / Sekretariat"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-blue-900/20"
          >
            {loading ? "Menyimpan..." : <><Send size={18} /> Daftar Sekarang</>}
          </button>
        </form>
      </div>
    </div>
  );
}