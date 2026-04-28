import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true,
        title: true,
        rapat_type: true, 
        description: true,
        location: true,
        dateRaw: true,     // Tanggal
        time: true,      // Jam Mulai
  endTime: true,   // Jam Selesai
      }
    });

    if (!event) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: unknown) {
    console.error("ERROR_FETCH_EVENT:", error);

    // Proteksi agar tidak merah saat mengakses .message
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal";

    return NextResponse.json(
      { message: "Gagal: " + errorMessage }, 
      { status: 500 }
    );
  }
}