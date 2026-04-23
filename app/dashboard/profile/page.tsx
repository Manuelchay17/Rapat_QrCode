"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Mail, Lock, Save, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
  });

  // State untuk Error Handling & Loading
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
if (res.ok) {
        setStatus({ type: "success", message: data.message });
        
        // APAPUN yang diganti (Email atau Password), paksa logout setelah 2 detik
        // agar user harus login ulang dengan kredensial baru
        setTimeout(() => {
          signOut({ callbackUrl: "/login" });
        }, 2000);

      } else {
        setStatus({ type: "error", message: data.message || "Gagal memperbarui profil" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Terjadi kesalahan koneksi ke server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-white tracking-tight">Pengaturan Profil</h1>
        <p className="text-slate-400 text-sm mt-2">Perbarui kredensial akses administrator Anda di sini.</p>
      </div>

      {/* NOTIFIKASI ERROR / SUKSES */}
      {status.type && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border animate-in zoom-in duration-300 ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6 bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* SECTION: EMAIL */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Mail size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Management</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 ml-1">Email Baru</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email"
                placeholder="biarkan kosong jika tidak ingin ganti"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* SECTION: KEAMANAN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Lock size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Check</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 ml-1 flex items-center gap-2">
              Password Saat Ini <span className="text-red-500 text-[10px] font-normal italic">(Wajib diisi)</span>
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                required
                type="password"
                placeholder="Masukkan password lama Anda"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 ml-1">Password Baru</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password"
                placeholder="Masukkan password baru jika ingin ganti"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* BUTTON SUBMIT */}
        <button 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20 mt-4"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Save size={18} /> Simpan Perubahan
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-start gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-blue-400/60">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Penting:</strong> Jika Anda mengganti email, sistem akan otomatis mengeluarkan Anda (Sign Out) untuk alasan keamanan. Pastikan Anda mengingat email baru tersebut.
        </p>
      </div>
    </div>
  );
}