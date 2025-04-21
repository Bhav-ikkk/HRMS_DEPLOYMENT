import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  // Validate status against LeaveStatus enum
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id, 10) },
  });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const updatedLeave = await prisma.leave.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });
    return NextResponse.json(updatedLeave);
  } catch (err) {
    console.error('Error updating leave request:', err);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}