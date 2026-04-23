import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Sesuaikan path authOptions Anda
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const { newEmail, currentPassword, newPassword } = await req.json();

    // 1. Cari admin berdasarkan email sesi saat ini
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ message: "Admin tidak ditemukan" }, { status: 404 });
    }

    // 2. Verifikasi password lama
    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password saat ini salah!" }, { status: 400 });
    }

    // 3. Siapkan data yang akan diupdate
    const updateData: any = {};
    if (newEmail) updateData.email = newEmail;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    // 4. Update di database
    await prisma.admin.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui. Silakan login ulang jika email berubah." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}