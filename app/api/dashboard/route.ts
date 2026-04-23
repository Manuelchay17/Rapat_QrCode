import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2026";

  try {
    // 1. Dapatkan Tanggal Hari Ini (Format YYYY-MM-DD sesuai database dateRaw)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; 

    // --- STATS BERDASARKAN TAHUN (Baris 1) ---
    const totalRapatYearly = await prisma.event.count({
      where: { dateRaw: { contains: year } }
    });

    // Menghitung total unik nama peserta (Total Peserta Keseluruhan)
    const totalPesertaUnique = await prisma.absensi.groupBy({
      by: ['participant_name'],
    }).then(res => res.length);

    const totalScanYearly = await prisma.absensi.count({
      where: { 
        status: "present",
        // Opsional: Jika ingin scan tahun ini saja, perlu join ke event. 
        // Jika total global, biarkan seperti ini.
      }
    });

    // --- STATS HARI INI (Baris 2 - Real Time) ---
    
    // A. Cari semua ID rapat yang terjadi hari ini
    const eventsToday = await prisma.event.findMany({
      where: { dateRaw: todayStr },
      select: { id: true }
    });
    const eventIdsToday = eventsToday.map(e => e.id);

    // B. Hitung Rapat Hari Ini
    const rapatHariIni = eventsToday.length;

    // C. Hitung Peserta Terdaftar di rapat hari ini saja
    const pesertaTerdaftarHariIni = await prisma.absensi.count({
      where: {
        rapat_id: { in: eventIdsToday }
      }
    });

    // D. Hitung Hadir/Scan di rapat hari ini saja
    const hadirHariIni = await prisma.absensi.count({
      where: {
        rapat_id: { in: eventIdsToday },
        status: "present"
      }
    });

    return NextResponse.json({
      yearly: { 
        totalRapat: totalRapatYearly.toString(), 
        totalPeserta: totalPesertaUnique.toString(), 
        totalScan: totalScanYearly.toString() 
      },
      daily: { 
        rapatHariIni: rapatHariIni.toString(), 
        pesertaHariIni: pesertaTerdaftarHariIni.toString(), 
        hadirHariIni: hadirHariIni.toString() 
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Gagal query database" }, { status: 500 });
  }
}