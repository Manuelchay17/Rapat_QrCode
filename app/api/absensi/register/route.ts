import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, division, rapatId, signature } = body;

    if (!rapatId || !name) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingAttendance = await tx.absensi.findFirst({
        where: { 
          rapat_id: rapatId, 
          participant_name: name 
        },
      });

      // --- PERBAIKAN ZONA WAKTU DI SINI ---
      const currentTime = new Date().toLocaleTimeString("id-ID", { 
        timeZone: "Asia/Jakarta", // <--- Kuncinya ada di baris ini
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).replace('.', ':'); // Mengubah format 01.27 menjadi 01:27

      if (existingAttendance) {
        return await tx.absensi.update({
          where: { id: existingAttendance.id },
          data: {
            status: signature ? "present" : existingAttendance.status,
            signature_at_event: signature || existingAttendance.signature_at_event,
            check_in_time: signature ? currentTime : existingAttendance.check_in_time,
            division: division || existingAttendance.division,
          },
        });
      } else {
        const newEntry = await tx.absensi.create({
          data: {
            rapat_id: rapatId,
            participant_name: name,
            division: division || "Umum",
            status: signature ? "present" : "registered",
            signature_at_event: signature || null,
            check_in_time: signature ? currentTime : null,
          },
        });

        await tx.event.update({
          where: { id: rapatId },
          data: { participants: { increment: 1 } }
        });

        return newEntry;
      }
    });

    return NextResponse.json({ message: "Berhasil", data: result });

  } catch (error: any) { 
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mencatat absensi" }, 
      { status: 500 }
    );
  }
}