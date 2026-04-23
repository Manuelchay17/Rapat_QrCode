import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const participants = await prisma.absensi.findMany({
      where: { rapat_id: eventId },
      orderBy: { id: 'desc' },
    });

    // Format data sederhana
    const formattedData = participants.map((p) => ({
      name: p.participant_name,
      division: p.division || "-",
      signature_data: p.signature_at_event, 
      status: p.status,
      time: p.check_in_time || "-",
    }));

    return NextResponse.json(formattedData);
  } catch (error: unknown) {
    console.error("Error Fetching Participants:", error);

    // Cek apakah error adalah instance dari Error untuk mengambil pesannya
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal";

    return NextResponse.json(
      { message: "Gagal: " + errorMessage }, 
      { status: 500 }
    );
  }
}