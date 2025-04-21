import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ adjust the path if needed
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paramId = parseInt(params.id);           // From URL
    const sessionId = parseInt(session.user.id);   // From session
    const role = session.user.role;

    // ✅ Check access
    if (role !== 'ADMIN' && sessionId !== paramId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let stats = {};

    if (role === 'ADMIN') {
      const loggedInUsers = await prisma.session.count({
        where: { expires: { gt: new Date() } },
      });

      const leavesRequestedToday = await prisma.leaveRequest.count({
        where: { createdAt: { gte: startOfDay } },
      });

      const pendingApprovals = await prisma.leaveRequest.count({
        where: { status: 'PENDING' },
      });

      const departments = await prisma.department.count();

      stats = {
        loggedInUsers,
        leavesRequestedToday,
        pendingApprovals,
        departments,
      };
    } else {
      const user = await prisma.user.findUnique({
        where: { id: paramId },
        include: { department: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const loggedInUsers = await prisma.session.count({
        where: {
          userId: paramId,
          expires: { gt: new Date() },
        },
      });

      const leavesRequestedToday = await prisma.leaveRequest.count({
        where: {
          userId: paramId,
          createdAt: { gte: startOfDay },
        },
      });

      const pendingApprovals = await prisma.leaveRequest.count({
        where: {
          userId: paramId,
          status: 'PENDING',
        },
      });

      const departments = user.department ? 1 : 0;

      stats = {
        loggedInUsers,
        leavesRequestedToday,
        pendingApprovals,
        departments,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
