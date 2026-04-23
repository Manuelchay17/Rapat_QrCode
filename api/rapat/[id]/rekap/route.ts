// Contoh logika Prisma
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const data = await prisma.absensi.findMany({
    where: { 
      rapatId: params.id,
      status: "present" 
    },
    orderBy: { time: 'asc' }
  });
  return Response.json(data);
}