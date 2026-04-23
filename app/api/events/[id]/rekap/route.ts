import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 1. Ambil Info Event
    const event = await prisma.event.findUnique({
      where: { id: id },
    });

    if (!event) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil Daftar Absensi
    // HAPUS bagian 'include' jika memang field 'peserta' tidak ada di schema
    const absensi = await prisma.absensi.findMany({
      where: { 
        rapat_id: id,
        status: "present" 
      },
      orderBy: { 
        check_in_time: 'asc' 
      },
    });

    // 3. Mapping data
    // 3. Mapping data
const formattedPeserta = absensi.map((p: any) => ({
  participant_name: p.participant_name,
  division: p.division || "-",
  
  // Karena p.check_in_time isinya sudah string "09.33", 
  // langsung ambil saja tanpa menggunakan new Date()
  time: p.check_in_time || "-",
  
  signature: p.signature_at_event || null,
}));

   return NextResponse.json({
  event: {
    ...event,
    // Kita langsung pakai dateRaw karena properti 'date' tidak ada di schema
    dateRaw: event.dateRaw || "-"
  },
  peserta: formattedPeserta,
});

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}