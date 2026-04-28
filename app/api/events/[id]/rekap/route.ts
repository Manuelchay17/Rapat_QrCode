// app/api/events/[id]/rekap/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const event = await prisma.event.findUnique({
      where: { id: id },
    });

    if (!event) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }

    const absensi = await prisma.absensi.findMany({
      where: { 
        rapat_id: id,
        status: "present" 
      },
      orderBy: { 
        check_in_time: 'asc' 
      },
    });

    const formattedPeserta = absensi.map((p: any) => {
      let displayTime = "-";

      // LOGIKA KONVERSI JAM KE WIB
      if (p.check_in_time) {
        const dateObj = new Date(p.check_in_time);
        
        // Cek apakah dateObj valid
        if (!isNaN(dateObj.getTime())) {
          displayTime = dateObj.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta", // Mengunci ke Waktu Indonesia Barat
          }).replace(":", ".");
        } else {
          // Jika data di DB sudah string manual "09.30"
          displayTime = p.check_in_time;
        }
      }

      return {
        participant_name: p.participant_name,
        division: p.division || "-",
        time: displayTime,
        signature: p.signature_at_event || null,
      };
    });

    return NextResponse.json({
      event: {
        ...event,
        dateRaw: event.dateRaw || "-"
      },
      peserta: formattedPeserta,
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}