"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Download, User, FileText } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function RekapAbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const [peserta, setPeserta] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [pimpinanName, setPimpinanName] = useState("");
  const [sekretarisName, setSekretarisName] = useState("");

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

  // Di dalam komponen RekapAbsensiPage


// Fungsi untuk kembali ke detail event
const handleBack = () => {
  // Mengarahkan langsung ke halaman detail event di folder admin dashboard
  router.push(`/dashboard/admin/events/${params.id}`);
};

  const handleDownloadPDF = () => {
  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const dataPimpinan = peserta.find(p => p.participant_name === pimpinanName);
    const dataSekretaris = peserta.find(p => p.participant_name === sekretarisName);

    const tableRowsForPDF = [...peserta];
    if (tableRowsForPDF.length < 12) {
      const diff = 12 - tableRowsForPDF.length;
      for (let i = 0; i < diff; i++) {
        tableRowsForPDF.push({ isPlaceholder: true });
      }
    }

    autoTable(doc, {
      startY: 62,
      showHead: 'firstPage',
      // REVISI UTAMA: Mencegah baris terpotong antar halaman
      rowPageBreak: 'avoid', 
      margin: { top: 20, left: 20, right: 20, bottom: 20 }, 
      head: [['NO', 'NAMA LENGKAP', 'JABATAN / INSTANSI', 'WAKTU', 'TANDA TANGAN']],
      body: tableRowsForPDF.map((p, i) => [
        i + 1,
        p.isPlaceholder ? "" : (p.participant_name?.toUpperCase() || ""),
        p.isPlaceholder ? "" : (p.division?.toUpperCase() || "-"),
        p.isPlaceholder ? "" : (p.time || "-"),
        "" 
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], textColor: [0, 0, 0], font: 'times', fontStyle: 'bold',
        halign: 'center', lineWidth: 0.1, lineColor: [0, 0, 0]
      },
      styles: {
        font: 'times', lineWidth: 0.1, lineColor: [0, 0, 0], textColor: [0, 0, 0],
        fontSize: 10, cellPadding: 2.5,
        // Tambahan: Agar teks di dalam sel tidak terpotong (overflow)
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 50 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35, minCellHeight: 14 }
      },
      didDrawPage: (data) => {
        if (data.pageNumber === 1) {
          doc.setFont("times", "bold");
          doc.setFontSize(14);
          doc.text("DAFTAR HADIR PERTEMUAN", 105, 20, { align: "center" });
          doc.setFontSize(12);
          doc.text(eventInfo?.title?.toUpperCase() || "JUDUL KEGIATAN", 105, 27, { align: "center" });
          
          doc.setLineWidth(0.5);
          doc.line(20, 32, 190, 32); 
          doc.setLineWidth(0.1);
          doc.line(20, 33, 190, 33); 
          
          doc.setFont("times", "normal");
          doc.setFontSize(11);
          doc.text(`Hari / Tanggal  : ${eventInfo?.dateRaw || "-"}`, 20, 42);
          doc.text(`Waktu               : ${eventInfo?.time || "-"} WIB s/d Selesai`, 20, 48);
          doc.text(`Tempat             : ${eventInfo?.location || "-"}`, 20, 54);
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const rowIndex = data.row.index;
          const p = tableRowsForPDF[rowIndex];
          if (p && !p.isPlaceholder && p.signature) {
            try {
              const imgW = 16;
              const imgH = 8;
              const xPos = data.cell.x + (data.cell.width - imgW) / 2;
              const yPos = data.cell.y + (data.cell.height - imgH) / 2;
              doc.addImage(p.signature, 'PNG', xPos, yPos, imgW, imgH, undefined, 'FAST');
            } catch (e) { console.error(e); }
          }
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 15; 
    const paddingTabelKeTtd = 10; 
    const areaTtdHeight = 35; 
    
    const sisaRuang = pageHeight - finalY - marginBottom;

    let currentY;
    if (sisaRuang > areaTtdHeight) {
      currentY = finalY + paddingTabelKeTtd;
    } else {
      doc.addPage();
      currentY = 25; 
    }

    const sigW = 25;      
    const sigH = 12;      
    const gapTeksKeTtd = 10; 
    const gapTtdKeNama = 18; 

    doc.setFont("times", "normal");
    doc.setFontSize(10);

    doc.text("Mengetahui,", 50, currentY, { align: "center" });
    doc.text("Pimpinan Rapat,", 50, currentY + 5, { align: "center" });
    if (dataPimpinan?.signature) {
      try {
        doc.addImage(dataPimpinan.signature, 'PNG', 50 - (sigW/2), currentY + gapTeksKeTtd, sigW, sigH, undefined, 'FAST');
      } catch (e) { console.error(e); }
    }
    doc.setFont("times", "bold");
    doc.text(`( ${pimpinanName?.toUpperCase() || "...................."} )`, 50, currentY + gapTeksKeTtd + gapTtdKeNama, { align: "center" });

    doc.setFont("times", "normal");
    doc.text("Dicatat Oleh,", 155, currentY, { align: "center" });
    doc.text("Notulis,", 155, currentY + 5, { align: "center" });
    if (dataSekretaris?.signature) {
      try {
        doc.addImage(dataSekretaris.signature, 'PNG', 155 - (sigW/2), currentY + gapTeksKeTtd, sigW, sigH, undefined, 'FAST');
      } catch (e) { console.error(e); }
    }
    doc.setFont("times", "bold");
    doc.text(`( ${sekretarisName?.toUpperCase() || "...................."} )`, 155, currentY + gapTeksKeTtd + gapTtdKeNama, { align: "center" });

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const cleanTitle = eventInfo?.title?.replace(/\s+/g, '_') || "Rapat";
    doc.save(`Presensi_${cleanTitle}_${dateStr}.pdf`);

  } catch (err) {
    console.error(err);
    alert("Gagal memproses file PDF.");
  }
};

  const selectedPimpinan = peserta.find(p => p.participant_name === pimpinanName);
  const selectedSekretaris = peserta.find(p => p.participant_name === sekretarisName);

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Header Bar */}
      <div className="bg-[#1e293b]/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
  onClick={handleBack} // Ubah dari router.back() menjadi handleBack
  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
>
  <ChevronLeft size={20} /> Kembali
</button>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all">
              <Download size={18} /> Simpan PDF
            </button>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kontrol Panel (Kiri) */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6 text-blue-400">
              <FileText size={24} />
              <h3 className="font-bold text-lg text-white">Pengaturan Rekap</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pimpinan Rapat</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <select 
                        value={pimpinanName} 
                        onChange={(e) => setPimpinanName(e.target.value)} 
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">-- Pilih Pimpinan --</option>
                        {peserta.map((p, idx) => (<option key={idx} value={p.participant_name}>{p.participant_name}</option>))}
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notulis / Sekretaris</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <select 
                        value={sekretarisName} 
                        onChange={(e) => setSekretarisName(e.target.value)} 
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">-- Pilih Sekretaris --</option>
                        {peserta.map((p, idx) => (<option key={idx} value={p.participant_name}>{p.participant_name}</option>))}
                    </select>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 leading-relaxed">
                    Nama yang dipilih akan muncul secara otomatis pada bagian tanda tangan di bawah dokumen PDF dan Preview.
                </p>
            </div>
          </div>
        </div>

        {/* Preview Dokumen (Kanan) */}
        <div className="lg:col-span-8 flex justify-center overflow-x-auto">
          <div className="w-[210mm] bg-white p-[1.5cm] shadow-2xl min-h-[297mm] text-black font-serif origin-top scale-[0.9] md:scale-100 rounded-sm">
            {/* Kop Surat */}
            <div className="text-center border-b-[3px] border-double border-black pb-4 mb-8">
              <h1 className="text-xl font-bold uppercase">Daftar Hadir Pertemuan</h1>
              <h2 className="text-lg font-bold uppercase leading-tight">{eventInfo?.title || "Judul Rapat"}</h2>
            </div>

            {/* Info Rapat */}
            <div className="mb-6 space-y-1 text-[13px]">
              <div className="grid grid-cols-[100px_10px_1fr]">
                <span>Hari / Tanggal</span><span>:</span><span className="font-medium">{eventInfo?.dateRaw || "-"}</span>
                <span>Waktu</span><span>:</span><span className="font-medium">{eventInfo?.time || "-"} WIB s/d Selesai</span>
                <span>Tempat</span><span>:</span><span className="font-medium">{eventInfo?.location || "-"}</span>
              </div>
            </div>

            {/* Tabel */}
            <table className="w-full border-collapse border-[0.5px] border-black text-[12px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border-[0.5px] border-black p-2 w-10 text-center uppercase">No</th>
                  <th className="border-[0.5px] border-black p-2 text-left uppercase">Nama Lengkap</th>
                  <th className="border-[0.5px] border-black p-2 text-left uppercase">Jabatan / Instansi</th>
                  <th className="border-[0.5px] border-black p-2 w-20 text-center uppercase">Waktu</th>
                  <th className="border-[0.5px] border-black p-2 w-32 text-center uppercase">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const displayRows = [...peserta];
                  while(displayRows.length < 12) displayRows.push({ isPlaceholder: true });
                  return displayRows.map((p, i) => (
                    <tr key={i} className="h-12">
                      <td className="border-[0.5px] border-black text-center">{i + 1}</td>
                      <td className="border-[0.5px] border-black px-3 font-bold uppercase">{p.isPlaceholder ? "" : p.participant_name}</td>
                      <td className="border-[0.5px] border-black px-3">{p.isPlaceholder ? "" : (p.division || "-")}</td>
                      <td className="border-[0.5px] border-black text-center font-mono text-[11px]">{p.isPlaceholder ? "" : p.time}</td>
                      <td className="border-[0.5px] border-black p-1 relative">
                        <span className="absolute top-0.5 left-0.5 text-[8px] text-slate-400">{i+1}.</span>
                        {!p.isPlaceholder && p.signature && (
                          <img src={p.signature} className="h-9 w-full object-contain mix-blend-multiply" alt="" />
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            {/* Tanda Tangan */}
            <div className="mt-12 grid grid-cols-2 text-center text-[13px]">
              <div className="flex flex-col items-center">
                <p className="font-bold">Mengetahui,<br/>Pimpinan Rapat</p>
                <div className="h-16 flex items-center justify-center">
                  {selectedPimpinan?.signature && (
                    <img src={selectedPimpinan.signature} className="h-14 object-contain mix-blend-multiply" alt="" />
                  )}
                </div>
                <p className="font-bold uppercase border-b border-black inline-block px-2">
                  {pimpinanName || "........................................"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold">Dicatat Oleh,<br/>Notulis</p>
                <div className="h-16 flex items-center justify-center">
                  {selectedSekretaris?.signature && (
                    <img src={selectedSekretaris.signature} className="h-14 object-contain mix-blend-multiply" alt="" />
                  )}
                </div>
                <p className="font-bold uppercase border-b border-black inline-block px-2">
                  {sekretarisName || "........................................"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}