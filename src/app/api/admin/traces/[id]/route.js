import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req, { params }) {
  const traceId = parseInt(params.id);

  try {
    const existingTrace = await prisma.trace.findUnique({
      where: { id: traceId },
    });

    if (!existingTrace) {
      return NextResponse.json({ message: 'Trace not found' }, { status: 404 });
    }

    const logoutAt = new Date();
    const loginAt = new Date(existingTrace.loginAt);
    const durationInHours = (logoutAt.getTime() - loginAt.getTime()) / (1000 * 60 * 60);

    const isPresent = durationInHours >= 4;

    const updatedTrace = await prisma.trace.update({
      where: { id: traceId },
      data: {
        logoutAt,
        attendance: isPresent,
      },
    });

    return NextResponse.json(updatedTrace);
  } catch (error) {
    console.error('Error updating trace:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}