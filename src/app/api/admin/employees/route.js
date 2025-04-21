import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const employees = await prisma.user.findMany({
      where: {
        NOT: { email: session.user.email },
      },
      include: {
        department: { select: { name: true } },
        leaves: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}