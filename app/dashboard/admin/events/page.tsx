"use client";

import { CalendarDays, MapPin, QrCode, Users, X, ChevronRight, Info, Clock, Edit3 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createEventAction, updateEventAction, getEvents } from "./_actions";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  dateRaw: string;
  time: string;
  endTime?: string | null;
  location: string;
  participants: number;
  status: string;
  rapat_type: "with_reg" | "no_reg";
}

export default function EventsPage() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | number>("all");
  const [selectedYear, setSelectedYear] = useState<string | number>("all");
  
  const [rapatType, setRapatType] = useState("with_reg");
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents();
        setEvents(data as EventItem[]);
      } catch (err) {
        console.error("Gagal load data:", err);
      }
    };
    fetchData();
  }, []);

  // Logika pengecekan apakah rapat sudah lewat
  const isEventPast = (dateRaw: string, time: string) => {
    const eventDateTime = new Date(`${dateRaw}T${time}`);
    return eventDateTime < new Date();
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setRapatType("with_reg");
    setShowModal(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setRapatType(event.rapat_type);
    setShowModal(true);
  };

  async function handleSubmit(formData: FormData) {
    formData.append("rapat_type", rapatType);
    
    if (editingEvent) {
      await updateEventAction(editingEvent.id, formData);
    } else {
      await createEventAction(formData);
    }
    
    setShowModal(false);
    const updatedData = await getEvents();
    setEvents(updatedData as EventItem[]);
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const d = new Date(event.dateRaw);
      const matchMonth = selectedMonth === "all" || d.getMonth() === Number(selectedMonth);
      const matchYear = selectedYear === "all" || d.getFullYear() === Number(selectedYear);
      return matchMonth && matchYear;
    });
  }, [events, selectedMonth, selectedYear]);

  const formatIndoDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 relative text-white min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dataset Rapat</h1>
          <p className="text-slate-400 text-sm">Kelola rapat dan absensi peserta</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-sm">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-[11px] font-bold px-3 py-2 outline-none cursor-pointer">
              <option value="all" className="bg-slate-900">Semua Bulan</option>
              {months.map((m, i) => <option key={i} value={i} className="bg-slate-900">{m}</option>)}
            </select>
            <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent text-[11px] font-bold px-3 py-2 outline-none cursor-pointer">
              <option value="all" className="bg-slate-900">Semua Tahun</option>
              {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
            </select>
          </div>

          <button onClick={openCreateModal} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-bold shadow-lg flex items-center gap-2">
            <span className="text-lg">+</span> Buat Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isPast = isEventPast(event.dateRaw, event.time);
          
          return (
            <div key={event.id} className="relative group">
              {/* Tombol Edit - Hanya muncul jika event BELUM lewat */}
              {!isPast && (
                <button 
                  onClick={() => openEditModal(event)}
                  className="absolute top-4 right-4 z-20 p-2 bg-slate-700/80 hover:bg-blue-600 rounded-lg transition-all text-white border border-slate-600 opacity-0 group-hover:opacity-100"
                  title="Edit Event"
                >
                  <Edit3 size={14} />
                </button>
              )}

              <Link href={`/dashboard/admin/events/${event.id}`} className="block h-full">
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 space-y-5 group-hover:border-blue-600 transition-all backdrop-blur-sm h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start  border-b pb-3 border-slate-700 mb-4">
                      <div>
                        <h2 className="font-semibold text-lg group-hover:text-blue-400 transition ">{event.title}</h2>
                      </div>
                      <span className={`text-[10px] px-2 py-1 mx-3 mt-1 rounded-full font-medium shrink-0 ${isPast ? "bg-slate-600/20 text-slate-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {isPast ? "Selesai" : "Aktif"}
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-slate-400 line-clamp-2 italic">{event.description || "Tidak ada deskripsi."}</p>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="flex items-center gap-3">
                        <CalendarDays size={16} className="text-slate-500" />
                        <span>{formatIndoDate(event.dateRaw)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-500" />
                        <span>{event.time} — {event.endTime || "Selesai"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-slate-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-slate-500" />
                        <span>{event.participants} Peserta</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-blue-400 font-medium">
                      <QrCode size={16} /> QR Absensi
                    </div>
                    <div className="text-slate-500 group-hover:text-white transition flex items-center gap-1 text-sm font-medium">Detail <ChevronRight size={14} /></div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">{editingEvent ? "Edit Event Rapat" : "Buat Event Baru"}</h2>
              <p className="text-sm text-slate-400 mt-1">{editingEvent ? "Perbarui informasi agenda rapat Anda" : "Tentukan tipe sistem absensi rapat"}</p>
            </div>

            <form action={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800 rounded-2xl border border-slate-700">
                <button 
                  type="button"
                  onClick={() => setRapatType("with_reg")}
                  className={`py-3 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${rapatType === "with_reg" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Users size={16} /> DENGAN REGISTRASI
                </button>
                <button 
                  type="button"
                  onClick={() => setRapatType("no_reg")}
                  className={`py-3 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${rapatType === "no_reg" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <QrCode size={16} /> TANPA REGISTRASI
                </button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3 items-start">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {rapatType === "with_reg" 
                    ? "Peserta wajib melakukan registrasi melalui link sebelum bisa melakukan scan absensi di lokasi." 
                    : "Peserta tidak perlu registrasi. Nama dan divisi akan diinput secara manual saat melakukan scan absensi."}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Judul Rapat</label>
                <input name="title" type="text" required defaultValue={editingEvent?.title} placeholder="Nama agenda..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Tanggal</label>
                <input name="dateRaw" type="date" required defaultValue={editingEvent?.dateRaw} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Jam Mulai</label>
                  <input name="time" type="time" required defaultValue={editingEvent?.time} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Jam Selesai</label>
                  <input name="endTime" type="time" required defaultValue={editingEvent?.endTime || ""} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Lokasi / Ruangan</label>
                <input name="location" type="text" required defaultValue={editingEvent?.location} placeholder="Contoh: Ruang IT" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Deskripsi Agenda</label>
                <textarea name="description" rows={2} defaultValue={editingEvent?.description || ""} placeholder="Apa yang akan dibahas?" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition resize-none"></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 font-bold text-sm text-slate-300">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-lg active:scale-95 transition">
                  {editingEvent ? "Simpan Perubahan" : "Simpan Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}