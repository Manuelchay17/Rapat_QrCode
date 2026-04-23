"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Printer, ChevronLeft, Download } from "lucide-react";

export default function RekapAbsensiPage() {
  const params = useParams();
  const [peserta, setPeserta] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Pastikan endpoint ini sesuai dengan struktur API Anda
      const res = await fetch(`/api/rapat/${params.id}/rekap`);
      const data = await res.json();
      setPeserta(data.peserta || []);
      setEventInfo(data.event || null);
    };
    fetchData();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-8 font-serif">
      {/* Tombol Kontrol - Hidden saat Print */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-slate-700 hover:text-black font-sans bg-white px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <ChevronLeft size={20} /> Kembali
        </button>
        <button 
          onClick={handlePrint}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md transition-all font-sans font-bold"
        >
          <Printer size={20} /> Cetak Laporan Resmi
        </button>
      </div>

      {/* AREA CETAK (A4) */}
      <div className="max-w-[21cm] mx-auto bg-white p-[1.5cm] md:p-[2cm] shadow-2xl border border-slate-300 min-h-[29.7cm] text-black shadow-inner">
        
        {/* KOP SURAT RESMI */}
        <div className="text-center border-b-2 border-black pb-4 mb-8">
          <h1 className="text-xl font-bold uppercase tracking-widest">Daftar Hadir Peserta</h1>
          <h2 className="text-2xl font-black uppercase mt-1">{eventInfo?.title || "JUDUL RAPAT"}</h2>
          <div className="flex justify-center gap-4 text-sm mt-2 font-sans font-medium text-slate-700">
            <span className="flex items-center gap-1 uppercase tracking-tighter">Lokasi: {eventInfo?.location || "-"}</span>
            <span>|</span>
            <span className="uppercase tracking-tighter">Tanggal: {eventInfo?.date || "-"}</span>
          </div>
        </div>

        {/* TABEL ABSENSI GAYA MANUAL */}
        <table className="w-full border-collapse border-[1.5px] border-black">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 text-center w-10 text-xs uppercase">No</th>
              <th className="border border-black p-2 text-left uppercase text-xs tracking-wider">Nama Lengkap</th>
              <th className="border border-black p-2 text-left uppercase text-xs tracking-wider">Jabatan / Divisi</th>
              <th className="border border-black p-2 text-center uppercase text-xs tracking-wider w-24">Waktu</th>
              <th colSpan={2} className="border border-black p-2 text-center uppercase text-xs tracking-wider w-48">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {peserta.length > 0 ? (
              peserta.map((p, i) => {
                const isEven = (i + 1) % 2 === 0;
                return (
                  <tr key={i} className="h-14">
                    <td className="border border-black text-center text-sm">{i + 1}.</td>
                    <td className="border border-black px-3 text-sm font-bold uppercase">{p.participant_name}</td>
                    <td className="border border-black px-3 text-sm italic">{p.division || "-"}</td>
                    <td className="border border-black text-center text-[10px]">{p.time} WIB</td>
                    
                    {/* KOLOM TANDA TANGAN ZIG-ZAG (Gaya Absen Manual) */}
                    <td className="border-y border-black w-24 p-1 relative">
                      {!isEven && (
                        <div className="absolute left-2 top-2 text-[10px] text-slate-400">{i + 1}.</div>
                      )}
                      {!isEven && p.signature && (
                        <img src={p.signature} className="h-10 mx-auto object-contain mix-blend-multiply" alt="ttd" />
                      )}
                    </td>
                    <td className="border-y border-r border-black w-24 p-1 relative">
                      {isEven && (
                        <div className="absolute left-2 top-2 text-[10px] text-slate-400">{i + 1}.</div>
                      )}
                      {isEven && p.signature && (
                        <img src={p.signature} className="h-10 mx-auto object-contain mix-blend-multiply" alt="ttd" />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              // Empty rows jika data belum ada (untuk estetika print kosong)
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="h-12">
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border-y border-black w-24"></td>
                  <td className="border-y border-r border-black w-24"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* FOOTER PENGESAHAN */}
        <div className="mt-12 flex justify-between px-10">
          <div className="text-center">
            <p className="text-sm mb-20">Mengetahui,</p>
            <p className="font-bold border-b border-black w-40 mx-auto"></p>
            <p className="text-xs uppercase mt-1">Ketua/Pimpinan</p>
          </div>
          <div className="text-center">
            <p className="text-sm mb-20">Dicetak Pada,</p>
            <p className="font-bold border-b border-black w-40 mx-auto">{new Date().toLocaleDateString('id-ID')}</p>
            <p className="text-xs uppercase mt-1">Sekretaris / Admin</p>
          </div>
        </div>

        <div className="mt-20 text-[10px] text-slate-400 italic text-center border-t border-slate-100 pt-2">
          Dokumen ini dihasilkan secara otomatis melalui Sistem Absensi QR-Verify.
        </div>
      </div>

      {/* CSS KHUSUS PRINT */}
      <style jsx global>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\:hidden { display: none !important; }
          .shadow-2xl, .shadow-inner, .border-slate-300 { box-shadow: none !important; border: none !important; }
          @page { 
            size: A4; 
            margin: 1.5cm; 
          }
          table { border: 1.5px solid black !important; }
          th, td { border: 1px solid black !important; }
        }
        
        /* Custom scrollbar untuk preview di browser */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
      `}</style>
    </div>
  );
}