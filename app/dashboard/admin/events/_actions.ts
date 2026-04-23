"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  try {
    const data = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    return data;
  } catch (error) { 
    console.error("Gagal mengambil data:", error);
    return [];
  }
}

export async function createEventAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const dateRaw = formData.get("dateRaw") as string;
    const startTime = formData.get("time") as string;
    const endTime = formData.get("endTime") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const rapat_type = formData.get("rapat_type") as string;

    await prisma.event.create({
      data: {
        title,
        dateRaw,
        time: startTime,
        endTime: endTime || null, 
        location,
        description,
        rapat_type,
        participants: 0,
        status: "active",
      },
    });

    revalidatePath("/dashboard/admin/events");
  } catch (error) {
    console.error("Gagal membuat event:", error);
    throw new Error("Gagal menyimpan ke database");
  }
}

export async function updateEventAction(id: string, formData: FormData) {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) throw new Error("Event tidak ditemukan");

    // LOGIKA VALIDASI: Cek apakah rapat sudah usai
    // Gunakan endTime untuk pengecekan, jika kosong gunakan startTime
    const compareTime = existingEvent.endTime || existingEvent.time;
    const eventFullDateTime = new Date(`${existingEvent.dateRaw}T${compareTime}`);
    const now = new Date();

    if (now > eventFullDateTime) {
      throw new Error("Rapat ini sudah berakhir (usai). Data tidak dapat diubah lagi.");
    }

    const title = formData.get("title") as string;
    const dateRaw = formData.get("dateRaw") as string;
    const startTime = formData.get("time") as string;
    const endTime = formData.get("endTime") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const rapat_type = formData.get("rapat_type") as string;

    await prisma.event.update({
      where: { id },
      data: {
        title,
        dateRaw,
        time: startTime,
        endTime: endTime || null,
        location,
        description,
        rapat_type,
      },
    });

    revalidatePath("/dashboard/admin/events");
    revalidatePath(`/dashboard/admin/events/${id}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Gagal update event:", error);
    throw new Error(error.message || "Gagal memperbarui data");
  }
}