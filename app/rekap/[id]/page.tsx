"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Printer, ChevronLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function RekapAbsensiPage() {
  const params = useParams();
  const [peserta, setPeserta] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Ref untuk menangkap area kertas A4
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/events/${params.id}/rekap`);
        const data = await res.json();
        if (res.ok) {
          setPeserta(data.peserta || []);
          setEventInfo(data.event || null);
        }
      } catch (err) {
        console.error("Gagal load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // Fungsi Download PDF menggunakan html-to-image
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      setLoading(true); // Tampilkan loading sebentar saat proses render
      
      const dataUrl = await toPng(printRef.current, { 
        quality: 1.0,
        pixelRatio: 2, // Biar hasil PDF tajam (tidak pecah)
        cacheBust: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rekap_Absensi_${eventInfo?.title?.replace(/\s+/g, '_') || "Event"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Terjadi kesalahan saat membuat PDF. Gunakan fitur 'Cetak' sebagai alternatif.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-sans animate-pulse">Memproses Dokumen...</div>;

  return (
    <div className="min-h-screen bg-slate-600 p-0 md:p-8 print:bg-white print:p-0">
      {/* Action Buttons */}
      <div className="max-w-[21cm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 md:px-0">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-white hover:text-slate-200 font-sans font-bold transition-all"
        >
          <ChevronLeft size={20} /> Kembali
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF} 
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold transition-all"
          >
            <Download size={18} /> Download PDF
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-emerald-600 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-emerald-700 shadow-lg font-bold transition-all"
          >
            <Printer size={18} /> Cetak (A4)
          </button>
        </div>
      </div>

      {/* Area Kertas A4 */}
      <div 
        ref={printRef}
        id="kertas-rekap" 
        className="bg-white mx-auto w-[21cm] min-h-[29.7cm] p-[1.5cm] md:p-[2cm] shadow-2xl print:shadow-none print:w-full print:m-0 text-black border border-slate-300 print:border-none"
        style={{ backgroundColor: 'white', color: 'black' }} // Force solid colors for PDF stability
      >
        {/* Kop Surat / Header Dokumen */}
        <div className="text-center border-b-[3px] border-black pb-4 mb-8 uppercase">
          <h1 className="text-2xl font-bold tracking-widest">Daftar Hadir Rapat</h1>
          <h2 className="text-xl font-black mt-1">{eventInfo?.title || "JUDUL RAPAT"}</h2>
          <div className="flex justify-center gap-6 text-[11px] mt-4 font-sans font-bold text-slate-800 tracking-tight">
            <p>Lokasi: <span className="font-normal">{eventInfo?.location || "-"}</span></p>
            <p>Tanggal: <span className="font-normal">{eventInfo?.dateRaw || "-"}</span></p>
            <p>Waktu: <span className="font-normal">{eventInfo?.time || "-"} WIB</span></p>
          </div>
        </div>

        {/* Tabel Absensi */}
        <table className="w-full border-collapse border-[1.5px] border-black text-[12px]">
          <thead>
            <tr className="bg-slate-100 print:bg-transparent uppercase font-bold">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-left">Nama Peserta</th>
              <th className="border border-black p-2 text-left w-44">Jabatan - Instansi</th>
              <th className="border border-black p-2 text-center w-20">Jam</th>
              <th colSpan={2} className="border border-black p-2 text-center w-48">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {peserta.length > 0 ? (
              peserta.map((p: any, i: number) => {
                const isEven = (i + 1) % 2 === 0;
                return (
                  <tr key={i} className="h-12">
                    <td className="border border-black text-center">{i + 1}.</td>
                    <td className="border border-black px-3 font-bold uppercase">{p.participant_name}</td>
                    <td className="border border-black px-3 italic text-slate-700 text-[11px]">
                      {p.division?.includes(" - ") ? (
                        <>
                          <span className="font-bold text-black uppercase">{p.division.split(" - ")[0]}</span>
                          <span className="uppercase text-[10px]"> - {p.division.split(" - ")[1]}</span>
                        </>
                      ) : p.division || "-"}
                    </td>
                    <td className="border border-black text-center text-[10px] font-mono">{p.time}</td>
                    
                    {/* Tanda Tangan Ganjil */}
                    <td className="border-y border-black w-24 p-1 relative bg-white">
                      {!isEven && <span className="absolute top-0.5 left-1 text-[8px] font-bold text-slate-400">{i + 1}.</span>}
                      {!isEven && p.signature && (
                        <img 
                          src={p.signature} 
                          className="h-8 w-full object-contain mx-auto mix-blend-multiply" 
                          alt="" 
                        />
                      )}
                    </td>
                    
                    {/* Tanda Tangan Genap */}
                    <td className="border-y border-r border-black w-24 p-1 relative bg-white">
                      {isEven && <span className="absolute top-0.5 left-1 text-[8px] font-bold text-slate-400">{i + 1}.</span>}
                      {isEven && p.signature && (
                        <img 
                          src={p.signature} 
                          className="h-8 w-full object-contain mx-auto mix-blend-multiply" 
                          alt="" 
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              // Baris kosong jika tidak ada peserta
              Array.from({ length: 15 }).map((_, i) => (
                <tr key={i} className="h-12">
                  <td className="border border-black text-center">{i + 1}.</td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Pengesahan */}
        <div className="pengesahan-container mt-16 grid grid-cols-2 text-center text-[12px]">
          <div className="space-y-20">
            <p className="font-bold uppercase">Ketua / Penyelenggara</p>
            <div className="border-b border-black w-48 mx-auto"></div>
          </div>
          <div className="space-y-20">
            <p className="font-bold uppercase">Sekretaris / Notulis</p>
            <div className="border-b border-black w-48 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Global CSS for Printing */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { background: white !important; margin: 0 !important; }
          .print\:hidden { display: none !important; }
          #kertas-rekap { 
            width: 100% !important; 
            border: none !important; 
            box-shadow: none !important; 
            padding: 0 !important;
          }
          tr { page-break-inside: avoid; }
          .pengesahan-container { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}