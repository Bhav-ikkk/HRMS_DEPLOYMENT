import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: { select: { id: true, name: true } }, // Optional: include user count
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}