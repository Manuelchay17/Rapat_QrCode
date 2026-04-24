"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ChevronLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RekapAbsensiPage() {
  const params = useParams();
  const [peserta, setPeserta] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      // 1. KOP SURAT
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("DAFTAR HADIR PERTEMUAN", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(eventInfo?.title?.toUpperCase() || "JUDUL KEGIATAN", 105, 27, { align: "center" });

      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);
      doc.setLineWidth(0.1);
      doc.line(20, 33, 190, 33);

      // 2. DETAIL KEGIATAN
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(`Hari / Tanggal  : ${eventInfo?.dateRaw || "-"}`, 20, 42);
      doc.text(`Waktu               : ${eventInfo?.time || "-"} WIB s/d Selesai`, 20, 48);
      doc.text(`Tempat             : ${eventInfo?.location || "-"}`, 20, 54);

      // 3. LOGIKA BARIS (MINIMAL 12 BARIS)
      const tableRows = [...peserta];
      while (tableRows.length < 12) {
        tableRows.push({ isPlaceholder: true });
      }

      // 4. GENERATE TABEL
      autoTable(doc, {
        startY: 62,
        margin: { left: 20, right: 20, bottom: 40 },
        head: [['NO', 'NAMA LENGKAP', 'JABATAN / INSTANSI', 'WAKTU', 'TANDA TANGAN']],
        body: tableRows.map((p, i) => [
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
          fontSize: 10, cellPadding: 2.5 
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 35, minCellHeight: 14 }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const rowIndex = data.row.index;
            const p = tableRows[rowIndex];
            
            // Perbaikan Error: Cek apakah data p ada sebelum akses properti
            if (p) {
              if (!p.isPlaceholder && p.signature) {
                try {
                  const imgW = 16;
                  const imgH = 6;
                  const xPos = data.cell.x + (data.cell.width - imgW) / 2;
                  const yPos = data.cell.y + (data.cell.height - imgH) / 2;
                  doc.addImage(p.signature, 'PNG', xPos, yPos, imgW, imgH);
                } catch (e) {
                  console.error("Gagal render ttd");
                }
              }
              // Nomor urut kecil di pojok tanda tangan
              doc.setFontSize(7);
              doc.setTextColor(150);
              doc.text(`${rowIndex + 1}.`, data.cell.x + 1.2, data.cell.y + 3.5);
            }
          }
        }
      });

      // 5. FOOTER PENGESAHAN
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      const pageHeight = doc.internal.pageSize.getHeight();
      
      let currentY = finalY;
      if (finalY > pageHeight - 50) {
        doc.addPage();
        currentY = 25;
      }

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0);

      doc.text("Mengetahui,", 50, currentY, { align: "center" });
      doc.text("Pimpinan Rapat,", 50, currentY + 6, { align: "center" });
      doc.text("(..................................................)", 50, currentY + 35, { align: "center" });

      doc.text("Dicatat Oleh,", 155, currentY, { align: "center" });
      doc.text("Sekretaris,", 155, currentY + 6, { align: "center" });
      doc.text("(..................................................)", 155, currentY + 35, { align: "center" });

      doc.save(`REKAP_HADIR_${eventInfo?.title?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses PDF. Periksa konsol untuk detail.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 print:bg-white print:p-0">
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => window.history.back()} className="text-slate-600 flex items-center gap-2 font-bold hover:text-blue-600">
          <ChevronLeft size={20} /> Kembali
        </button>
        <div className="flex gap-3">
          <button onClick={handleDownloadPDF} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md">
            <Download size={18} /> Simpan PDF
          </button>
          <button onClick={() => window.print()} className="bg-white border border-slate-300 px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
            <Printer size={18} /> Cetak
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white p-[1.5cm] md:p-[2cm] shadow-2xl min-h-[297mm] text-black font-serif border border-slate-200">
        <div className="text-center border-b-[3px] border-double border-black pb-4 mb-8">
          <h1 className="text-xl font-bold uppercase tracking-tight">Daftar Hadir Pertemuan</h1>
          <h2 className="text-lg font-bold uppercase">{eventInfo?.title}</h2>
        </div>

        <div className="mb-8 space-y-1 text-[13px]">
          <p>Hari / Tanggal : {eventInfo?.dateRaw}</p>
          <p>Waktu                : {eventInfo?.time} WIB s/d Selesai</p>
          <p>Tempat              : {eventInfo?.location}</p>
        </div>

        <table className="w-full border-collapse border-[0.2px] border-black text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-[0.2px] border-black p-2 w-12 text-center uppercase">No</th>
              <th className="border-[0.2px] border-black p-2 text-left uppercase">Nama Lengkap</th>
              <th className="border-[0.2px] border-black p-2 text-left uppercase">Jabatan / Instansi</th>
              <th className="border-[0.2px] border-black p-2 w-24 text-center uppercase">Waktu</th>
              <th className="border-[0.2px] border-black p-2 w-36 text-center uppercase">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const displayRows = [...peserta];
              while(displayRows.length < 12) displayRows.push({ isPlaceholder: true });
              
              return displayRows.map((p, i) => (
                <tr key={i} className="h-14">
                  <td className="border-[0.2px] border-black text-center">{i + 1}</td>
                  <td className="border-[0.2px] border-black px-3 font-bold uppercase">{p.isPlaceholder ? "" : p.participant_name}</td>
                  <td className="border-[0.2px] border-black px-3">{p.isPlaceholder ? "" : (p.division || "-")}</td>
                  <td className="border-[0.2px] border-black text-center text-xs font-mono">{p.isPlaceholder ? "" : p.time}</td>
                  <td className="border-[0.2px] border-black p-1 relative">
                    <span className="absolute top-0.5 left-0.5 text-[8px] text-slate-300">{i+1}.</span>
                    {!p.isPlaceholder && p.signature && (
                      <img src={p.signature} className="h-10 w-full object-contain mix-blend-multiply" alt="" />
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>

        <div className="mt-16 grid grid-cols-2 text-center text-[13px]">
          <div className="space-y-24">
            <p className="font-bold">Mengetahui,<br/>Pimpinan Rapat</p>
            <p>(..................................................)</p>
          </div>
          <div className="space-y-24">
            <p className="font-bold">Dicatat Oleh,<br/>Sekretaris</p>
            <p>(..................................................)</p>
          </div>
        </div>
      </div>
    </div>
  );
}