"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarDays, Users, QrCode, TrendingUp, 
  ArrowUpRight, ChevronDown, Loader2 
} from "lucide-react"; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

// ... (trendData dan presenceData tetap sama)
const trendData = [
  { day: "Mon", count: 45 }, { day: "Tue", count: 52 },
  { day: "Wed", count: 38 }, { day: "Thu", count: 65 },
  { day: "Fri", count: 48 }, { day: "Sat", count: 20 },
  { day: "Sun", count: 15 },
];

const presenceData = [
  { name: "Hadir", value: 85, color: "#3b82f6" },
  { name: "Izin", value: 10, color: "#f59e0b" },
  { name: "Sakit", value: 5, color: "#ef4444" },
];

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (year: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch(`/api/dashboard?year=${year}`);
      const result = await response.json();
      if (response.ok) {
        setStats(result);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedYear);
    const interval = setInterval(() => {
      fetchStats(selectedYear, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedYear]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold tracking-widest uppercase text-[10px] text-center">Menghubungkan ke Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 text-slate-200">
      
      {/* Header: Stack di mobile, row di desktop */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Insights</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Monitoring real-time aktivitas absensi.</p>
        </div>

        <div className="relative w-full sm:w-auto">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-slate-900 border border-slate-800 text-white text-[10px] sm:text-xs font-bold py-3 pl-5 pr-12 rounded-2xl outline-none focus:border-blue-500 transition-all cursor-pointer shadow-lg"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
            <option value="2024">Tahun 2024</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Stats Grid: 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* YEARLY STATS */}
        {[
          { title: `Total Rapat (${selectedYear})`, value: stats?.yearly?.totalRapat || "0", icon: CalendarDays, trend: "Live" },
          { title: `Total Peserta`, value: stats?.yearly?.totalPeserta || "0", icon: Users, trend: "+12%" },
          { title: `Total Scan`, value: stats?.yearly?.totalScan || "0", icon: QrCode, trend: "Present" },
        ].map((item, i) => (
          <div key={i} className="group bg-slate-900/40 border border-slate-800 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:border-blue-500/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <item.icon size={20} />
              </div>
              <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={10}/> {item.trend}
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{item.title}</p>
            <p className="text-3xl md:text-4xl font-black text-white mt-1">{item.value}</p>
          </div>
        ))}

        {/* DAILY STATS (REAL-TIME) */}
        {[
          { title: "Rapat Hari Ini", value: stats?.daily?.rapatHariIni || "0", icon: CalendarDays, color: "text-amber-400" },
          { title: "Peserta Terdaftar", value: stats?.daily?.pesertaHariIni || "0", icon: Users, color: "text-purple-400" },
          { title: "Hadir / Scan", value: stats?.daily?.hadirHariIni || "0", icon: QrCode, color: "text-emerald-400" },
        ].map((item, i) => (
          <div key={i} className="group bg-blue-600/5 border border-blue-500/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:border-blue-500/40 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-slate-900 rounded-xl ${item.color} group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                <item.icon size={20} />
              </div>
              <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full tracking-widest uppercase">
                Real-Time
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.title}</p>
            <p className="text-3xl md:text-4xl font-black text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section: Tumpuk di mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8 md:mb-10">
            <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">Activity Trend</h3>
            <button className="text-blue-500 text-[10px] font-bold flex items-center gap-2 hover:bg-blue-500/10 px-3 py-1.5 rounded-xl transition-all">
              Details <ArrowUpRight size={14}/>
            </button>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                  itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 flex flex-col shadow-2xl">
          <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 md:mb-10">Attendance Share</h3>
          <div className="flex-1 min-h-[200px] md:min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={presenceData} innerRadius="60%" outerRadius="85%" paddingAngle={8} dataKey="value">
                  {presenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-4 md:mt-6">
            {presenceData.map((item) => (
              <div key={item.name} className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}