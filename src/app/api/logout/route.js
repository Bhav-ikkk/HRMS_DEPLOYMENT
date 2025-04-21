import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const latestTrace = await prisma.trace.findFirst({
      where: {
        userId: parseInt(userId),
        logoutAt: null,
      },
      orderBy: {
        loginAt: 'desc',
      },
    });

    if (!latestTrace) {
      console.warn(`No active trace found for user ${userId}`);
      return NextResponse.json(
        { message: 'No active session to log out' },
        { status: 404 }
      );
    }

    const logoutAt = new Date();

    await prisma.trace.update({
      where: { id: latestTrace.id },
      data: {
        logoutAt,
      },
    });

    return NextResponse.json({ message: 'Logout recorded' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}