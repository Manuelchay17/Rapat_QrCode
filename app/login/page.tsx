"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Activity, Fingerprint, ArrowRight, Loader2, XCircle } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE BARU: Untuk menangkap pesan error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Reset error setiap kali mencoba login

    try {
      const res = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if (res?.error) {
        // Mapping error message agar lebih user-friendly
        if (res.error === "CredentialsSignin") {
          setErrorMessage("Email atau Password yang Anda masukkan salah.");
        } else {
          setErrorMessage(res.error || "Terjadi kesalahan sistem. Silakan coba lagi.");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setErrorMessage("Koneksi gagal. Pastikan server database menyala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200">
      
      {/* LEFT SIDE: Identity & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 flex-col justify-between p-16 relative overflow-hidden border-r border-slate-800/50">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-800/20 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 rotate-3">
              <Fingerprint className="text-white" size={28} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter uppercase italic block leading-none text-white">
                QRCODE<span className="text-blue-500 font-light not-italic">absensi</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Activity size={12} /> System Status: Operational
            </div>
            <h2 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              SMART <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">PRESENCE.</span>
            </h2>
          </div>
          <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
            Efisiensi manajemen kehadiran dalam satu aplikasi. Cepat, aman, dan terintegrasi secara real-time.
          </p>
        </div>

        <div className="relative z-10 pt-10 border-t border-slate-800" />
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[400px] space-y-10 relative z-10">
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Authentication</h1>
            <p className="text-slate-500 font-medium text-sm tracking-wide">
              Gunakan email admin untuk masuk ke sistem.
            </p>
          </div>

          {/* UI ERROR HANDLING BOX */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in zoom-in duration-300">
              <XCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-6">
              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] ml-1">Email</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errorMessage ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={18} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ADMIN@NEXUS.ID"
                    className={`w-full bg-slate-900/40 border rounded-2xl py-5 pl-12 pr-4 outline-none transition-all text-white placeholder:text-slate-800 font-bold text-sm tracking-wide focus:bg-slate-900/60 ${errorMessage ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'}`}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Password</label>
                  <button type="button" className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">Recover</button>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errorMessage ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={18} />
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-900/40 border rounded-2xl py-5 pl-12 pr-12 outline-none transition-all text-white placeholder:text-slate-800 font-bold text-sm tracking-wide focus:bg-slate-900/60 ${errorMessage ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="space-y-4 pt-2">
              <button 
                disabled={isLoading}
                className="w-full group bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[4px] hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-blue-900/20 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Masuk
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${errorMessage ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[2px]">
                  {errorMessage ? "Authentication Failed" : "Secure Connection Verified"}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}